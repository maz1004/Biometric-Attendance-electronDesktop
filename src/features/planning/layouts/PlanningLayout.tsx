import { useMemo, useState } from "react";
import styled from "styled-components";
import { format, isValid, startOfWeek } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// State & Logic Hooks
import { usePlanning } from "../hooks/usePlanning";
import { usePlanningLayoutState } from "../hooks/usePlanningLayoutState";
import { useTemplateManager } from "../hooks/useTemplateManager";
import { computeScheduleWithValidation, getWeekDates, filterTeams, ComputeScheduleResult } from "../engine/PlanningEngine";
import { PlanningService } from "../../../services/planning";

// Components
import OperationalTeamsPanel from "../components/scheduling/OperationalTeamsPanel";
import OperationalWeekView from "../views/OperationalWeekView";
import StrategicMonthView from "../views/StrategicMonthView";
import StrategicWeekView from "../views/StrategicWeekView";
import GenericWeekView from "../views/GenericWeekView";
import TemplateManager from "../components/TemplateManager";
import PlanningHeader from "../components/ui/PlanningHeader";
import AssignmentPopover from "../components/popovers/AssignmentPopover";
import Button from "../../../ui/Button";

// Modals
import TeamAssignmentDialog from "../components/modals/TeamAssignmentDialog";
import TeamFormModal from "../components/modals/teams/TeamFormModal";
import ShiftTemplateEditorModal from "../components/modals/ShiftTemplateEditorModal";
import DayAssignmentsDialog from "../components/modals/DayAssignmentsDialog";

import { ComputedSchedule, UserShift, WeeklySchedule } from "../types";

/* --- STYLES --- */
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: relative;
  flex-direction: column; 
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
  align-items: center;
`;

/* --- CONSTANTS --- */
const DAYS_KEY_MAP = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function PlanningLayout() {
    const queryClient = useQueryClient();

    // 1. Global Planning Data
    const {
        shifts, teams, state,
        updateTeam, deleteTeam, createTeam,
        userShifts,
        gotoNextWeek, gotoPrevWeek,
        settings // <--- Added
    } = usePlanning();

    // 2. Local Layout State
    const layout = usePlanningLayoutState();

    // 3. Template Manager Logic
    const templateMgr = useTemplateManager(
        layout.selectedTemplate,
        layout.setSelectedTemplate,
        state.week,
        state.employees,
        teams // NEW: Pass teams for name resolution
    );

    // 4. Common Computed Values
    const weekStart = useMemo(() => {
        const d = new Date(state.week);
        return isValid(d) ? d : startOfWeek(new Date(), { weekStartsOn: 1 });
    }, [state.week]);

    const weekDates = useMemo(() => getWeekDates(state.week), [state.week]);

    // View Mode Schedule Computation with Validation
    const scheduleResult: ComputeScheduleResult | null = useMemo(() => {
        if (layout.mode === "template") return null;
        const assignments = (Array.isArray(userShifts) ? userShifts : Object.values(userShifts || {})) as UserShift[];

        console.log(`[PlanningLayout] Computing Schedule. Assignments: ${assignments.length}, Week: ${state.week}`);

        return computeScheduleWithValidation(
            shifts,
            assignments,
            state.employees,
            teams,
            { weekDates, selectedTeamIds: layout.selectedTeamIds, debugContext: 'Layout', settings }
        );
    }, [userShifts, shifts, state.employees, teams, weekDates, layout.selectedTeamIds, layout.mode, settings]);

    // Extract schedule for rendering
    const computedSchedule: ComputedSchedule[] = scheduleResult?.schedule || [];

    // Log validation issues
    if (scheduleResult && !scheduleResult.validation.isValid) {
        console.warn('[PlanningLayout] Validation errors:', scheduleResult.validation.errors);
    }
    if (scheduleResult?.conflicts.hasConflicts) {
        console.warn('[PlanningLayout] Conflicts detected:', scheduleResult.conflicts.summary);
    }


    // Filtered Teams
    const displayTeams = useMemo(() => filterTeams(teams, layout.selectedTeamIds), [teams, layout.selectedTeamIds]);

    /* --- POPOVER LOGIC (Kept here for now as it bridges UI and Draft State) --- */
    const [popoverState, setPopoverState] = useState<{
        isOpen: boolean; x: number; y: number; dayIndex: number; slotHour: number; assignedIds: string[];
    } | null>(null);

    const handleTemplateCellClick = (dayIndex: number, slotHour: number, event: React.MouseEvent<HTMLDivElement>, currentAssignments: ComputedSchedule[]) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const assignedIds = currentAssignments.map(c => c.teamId).filter((id): id is string => !!id).concat(
            currentAssignments.map(c => c.assigneeId).filter((id): id is string => !!id)
        );
        setPopoverState({
            isOpen: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            dayIndex,
            slotHour,
            assignedIds
        });
    };

    const handlePopoverToggle = (id: string, type: 'team' | 'employee') => {
        if (!popoverState) return;
        const { dayIndex, slotHour } = popoverState;
        const dayKey = DAYS_KEY_MAP[dayIndex] as keyof WeeklySchedule;

        templateMgr.setDraftSchedule(prev => {
            const newSchedule = { ...prev };
            const daySlots = [...(newSchedule[dayKey] || [])];
            const startStr = `${slotHour.toString().padStart(2, '0')}:00`;
            const endStr = `${(slotHour + 1).toString().padStart(2, '0')}:00`;

            const existingIndex = daySlots.findIndex(s =>
                s.start === startStr && s.assigned_id === id && s.assigned_type === type
            );

            if (existingIndex >= 0) {
                daySlots.splice(existingIndex, 1);
            } else {
                daySlots.push({
                    start: startStr, end: endStr, assigned_id: id, assigned_type: type,
                    color: type === 'team' ? teams[id]?.color : "#10b981"
                });
            }
            newSchedule[dayKey] = daySlots;
            return newSchedule;
        });
        templateMgr.setIsDirty(true);
        // Optimistic UI update for popover list
        setPopoverState(prev => prev ? ({
            ...prev,
            assignedIds: prev.assignedIds.includes(id) ? prev.assignedIds.filter(x => x !== id) : [...prev.assignedIds, id]
        }) : null);
    };

    /* --- RENDER HELPERS --- */
    const handleAssignTemplateToDate = async (dateOrDates: Date | Date[], template: any) => {
        const dates = Array.isArray(dateOrDates) ? dateOrDates : [dateOrDates];
        const batchAssignments: any[] = [];

        for (const date of dates) {
            const dayKey = DAYS_KEY_MAP[date.getDay()] as keyof WeeklySchedule;
            let sourceSlots = template.schedule_data?.[dayKey] || [];
            // Failover/Clone logic: if target day empty, maybe copy Monday? (Optional, kept behavior)
            if (sourceSlots.length === 0) sourceSlots = template.schedule_data?.monday || [];

            for (const slot of sourceSlots) {
                batchAssignments.push({
                    date: format(date, "yyyy-MM-dd"),
                    start_time: slot.start,
                    end_time: slot.end,
                    assigned_id: slot.assigned_id,
                    assigned_type: slot.assigned_type,
                    team_id: slot.assigned_type === 'team' ? slot.assigned_id : undefined,
                    user_id: slot.assigned_type === 'employee' ? slot.assigned_id : undefined,
                    shift_id: template.id,
                    name: template.name // Optional, for context
                });
            }
        }

        if (batchAssignments.length === 0) return;

        console.log("handleAssignTemplateToDate: Sending Batch", {
            count: batchAssignments.length,
            sample: batchAssignments[0],
            dates: dates.map(d => format(d, 'yyyy-MM-dd'))
        });

        try {
            await PlanningService.createAssignmentsBatch({ assignments: batchAssignments });
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
        } catch (error: any) {
            if (error.response?.status === 409) {
                // Conflict detected - Ask user to overwrite
                if (window.confirm(`${error.response.data.error}\n\nVoulez-vous remplacer les plannings existants par ce nouveau modèle ?`)) {
                    try {
                        await PlanningService.createAssignmentsBatch({
                            assignments: batchAssignments,
                            overwrite: true
                        });
                        queryClient.invalidateQueries({ queryKey: ["shifts"] });
                        queryClient.invalidateQueries({ queryKey: ["assignments"] });
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                        alert("Erreur lors de la mise à jour forcée.");
                    }
                }
            } else {
                console.error('Error applying template batch:', error);
                alert("Une erreur est survenue lors de l'application du modèle.");
            }
        }
    };

    return (
        <LayoutContainer>
            <PlanningHeader
                currentDate={weekStart}
                onPrev={gotoPrevWeek}
                onNext={gotoNextWeek}
                viewMode={layout.viewMode}
                onViewChange={layout.setViewMode}
                timeSlot={layout.timeSlot}
                onTimeSlotChange={layout.setTimeSlot}
                mode={layout.mode}
                onModeChange={(m) => {
                    layout.setMode(m);
                    if (m === 'template') templateMgr.handleCreateNewTemplate();
                }}
            />

            {/* Template Mode: Manager & Actions */}
            {layout.mode === 'template' && (
                <>
                    <TemplateManager
                        templates={templateMgr.genericTemplates}
                        selectedTemplateId={layout.selectedTemplate?.id || null}
                        onSelectTemplate={templateMgr.handleTemplateSelect}
                        onCreateTemplate={templateMgr.handleCreateNewTemplate}
                    />
                    <Toolbar>
                        <div style={{ flex: 1, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {layout.selectedTemplate ? `Édition: ${layout.selectedTemplate.name}` : "Nouveau Modèle (Brouillon)"}
                            {templateMgr.isDirty && <span style={{ color: 'var(--color-orange-500)', marginLeft: '0.5rem' }}>(Modifié)</span>}
                        </div>
                        {templateMgr.isDirty && (
                            <>
                                <Button variation="secondary" size="small" onClick={templateMgr.handleCancelDraft}>Annuler</Button>
                                <Button variation="primary" size="small" onClick={() => {
                                    if (!layout.selectedTemplate) {
                                        layout.setIsCreatingTemplate(true);
                                        layout.setEditingShiftId("NEW");
                                    } else {
                                        templateMgr.handleSaveDraft();
                                    }
                                }}>Enregistrer</Button>
                            </>
                        )}
                    </Toolbar>
                </>
            )}

            {/* Template Mode: Teams Panel (Management) */}
            {layout.mode === 'template' && (
                <OperationalTeamsPanel
                    teams={Object.values(teams)}
                    employees={state.employees}
                    selectedTeamIds={layout.selectedTeamIds}
                    onToggleSelect={(id) => layout.setSelectedTeamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onUpdateTeam={(id, data) => updateTeam({ id, data })}
                    onDeleteTeam={deleteTeam}
                    onAddTeam={() => layout.setIsTeamModalOpen(true)}
                />
            )}

            <ContentArea>
                {layout.mode === 'template' ? (
                    <GenericWeekView
                        computedSchedule={templateMgr.draftPreviewSchedule}
                        teams={displayTeams}
                        timeSlot={layout.timeSlot}
                        onCellClick={handleTemplateCellClick}
                    />
                ) : (
                    <>
                        {layout.viewMode === "week" && (
                            <OperationalWeekView
                                dates={weekDates}
                                teams={displayTeams}
                                computedSchedule={computedSchedule}
                                timeSlot={layout.timeSlot}
                            />
                        )}
                        {layout.viewMode === "cells" && (
                            <StrategicWeekView
                                currentWeek={weekStart}
                                teams={teams}
                                employees={state.employees}
                                userShifts={userShifts}
                                shifts={shifts}
                                onSaveAssignment={() => { }}
                            />
                        )}
                        {layout.viewMode === "month" && (
                            <StrategicMonthView
                                userShifts={userShifts}
                                shifts={shifts}
                                templates={templateMgr.genericTemplates}
                                onAssignTemplate={handleAssignTemplateToDate}
                            />
                        )}
                    </>
                )}
            </ContentArea>

            {/* ============ OVERLAYS ============ */}

            {popoverState && (
                <AssignmentPopover
                    x={popoverState.x}
                    y={popoverState.y}
                    teams={Object.values(teams)}
                    employees={Object.values(state.employees)}
                    assignedIds={popoverState.assignedIds}
                    onToggle={handlePopoverToggle}
                    onClose={() => setPopoverState(null)}
                />
            )}

            {layout.assignModalDate && (
                <TeamAssignmentDialog
                    isOpen={true}
                    date={layout.assignModalDate}
                    onClose={() => layout.setAssignModalDate(null)}
                    allTeams={Object.values(teams)}
                    unassignedEmployees={Object.values(state.employees)}
                    onSave={async () => layout.setAssignModalDate(null)}
                />
            )}

            {layout.isTeamModalOpen && (
                <TeamFormModal
                    employees={state.employees}
                    onCloseModal={() => layout.setIsTeamModalOpen(false)}
                    onSave={(data) => {
                        createTeam({ name: data.name, department: data.department || "General", manager_id: undefined });
                        layout.setIsTeamModalOpen(false);
                    }}
                />
            )}

            {layout.editingShiftId && (
                <ShiftTemplateEditorModal
                    isOpen={true}
                    shift={layout.editingShiftId === "NEW" ? undefined : (layout.selectedTemplate && layout.isCreatingTemplate ? undefined : shifts[layout.editingShiftId] || layout.selectedTemplate)}
                    onClose={() => {
                        layout.setEditingShiftId(null);
                        layout.setIsCreatingTemplate(false);
                    }}
                    onSave={(metadata) => {
                        if (layout.isCreatingTemplate) {
                            templateMgr.handleSaveDraft(metadata);
                            layout.setEditingShiftId(null);
                        } else {
                            // Simple edit flow reuse if needed
                            templateMgr.handleSaveDraft(metadata);
                            layout.setEditingShiftId(null);
                        }
                    }}
                />
            )}

            {layout.viewAssignmentsDate && (
                <DayAssignmentsDialog
                    date={layout.viewAssignmentsDate}
                    assignments={[]} // TODO: wire up dayAssignments if used
                    onClose={() => layout.setViewAssignmentsDate(null)}
                    onEditShift={(shiftId) => {
                        layout.setViewAssignmentsDate(null);
                        layout.setEditingShiftId(shiftId);
                    }}
                    onAddAssignment={() => {
                        layout.setAssignModalDate(layout.viewAssignmentsDate);
                        layout.setViewAssignmentsDate(null);
                    }}
                // TODO: wire up onDeleteAssignment
                />
            )}


        </LayoutContainer>
    );
}

