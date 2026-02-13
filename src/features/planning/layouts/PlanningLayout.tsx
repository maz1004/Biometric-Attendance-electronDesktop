import { useMemo } from "react";
import styled from "styled-components";
import { format, isValid, startOfWeek } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// State & Logic Hooks
import { usePlanning } from "../hooks/usePlanning";
import { usePlanningLayoutState } from "../hooks/usePlanningLayoutState";
import { useTemplateManager } from "../hooks/useTemplateManager";
import { useTemplateAssignment } from "../hooks/useTemplateAssignment";
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
import TeamLegendFilter from "../components/scheduling/TeamLegendFilter";

// Modals
import TeamAssignmentDialog from "../components/modals/TeamAssignmentDialog";
import TeamFormModal from "../components/modals/teams/TeamFormModal";
import ShiftTemplateEditorModal from "../components/modals/ShiftTemplateEditorModal";
import DayAssignmentsDialog from "../components/modals/DayAssignmentsDialog";

import { ComputedSchedule, UserShift, WeeklySchedule, WeeklyTemplate } from "../types";

/* --- STYLES --- */
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  gap: 1rem;
`;

const ContentArea = styled.div`
  flex: 1 0 auto; /* Grow to fill, don't shrink */
  display: flex;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  position: relative;
  flex-direction: column;
  min-height: 600px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
  align-items: center;
  min-height: 56px;
`;

/* --- CONSTANTS --- */

export default function PlanningLayout() {
    const queryClient = useQueryClient();

    // 1. Global Planning Data
    const {
        shifts, teams, state,
        userShifts,
        gotoNextWeek, gotoPrevWeek,
        settings,
        templates,

    } = usePlanning();

    // 2. Local Layout State
    const layout = usePlanningLayoutState();

    // 3. Template Manager Logic
    const templateMgr = useTemplateManager(
        layout.selectedTemplate as WeeklyTemplate | null,
        layout.setSelectedTemplate as any,
        state.week,
        state.employees,
        teams,
        templates
    );

    // 4. Common Computed Values
    const weekStart = useMemo(() => {
        const d = state.week ? new Date(state.week) : new Date();
        return isValid(d) ? d : startOfWeek(new Date(), { weekStartsOn: 1 });
    }, [state.week]);

    const weekDates = useMemo(() => getWeekDates(state.week), [state.week]);

    // View Mode Schedule Computation with Validation
    const scheduleResult: ComputeScheduleResult | null = useMemo(() => {
        if (layout.mode === "template") return null;
        const assignments = (Array.isArray(userShifts) ? userShifts : Object.values(userShifts || {})) as UserShift[];

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

    // Filter out placeholders for week/operational views (they have no real time slots)
    const scheduleForWeekView = useMemo(() =>
        computedSchedule.filter(item => !item.isPlaceholder),
        [computedSchedule]);

    // Log validation issues
    if (scheduleResult && !scheduleResult.validation.isValid) {
        console.warn('[PlanningLayout] Validation errors:', scheduleResult.validation.errors);
    }
    if (scheduleResult?.conflicts.hasConflicts) {
        console.warn('[PlanningLayout] Conflicts detected:', scheduleResult.conflicts.summary);
    }


    // Filtered Teams
    const displayTeams = useMemo(() => filterTeams(teams, layout.selectedTeamIds), [teams, layout.selectedTeamIds]);

    /* --- ASSIGNMENT LOGIC (delegated to useTemplateAssignment hook) --- */
    const assignment = useTemplateAssignment(
        templateMgr.draftSchedule,
        templateMgr.setDraftSchedule,
        templateMgr.setIsDirty,
        teams,
        state.employees
    );

    // ... (existing render helpers)



    // ... existing code ...

    /* --- RENDER HELPERS --- */

    /**
     * Validates that a template has complete check-in/check-out pairs.
     * Dot 1 = Check-in, Dot 2 = Check-out, Dot 3 = Check-in, etc.
     * Returns true if valid (all pairs complete), false with alert if invalid.
     */
    const validateTemplateCheckouts = (scheduleData: WeeklySchedule | undefined): boolean => {
        if (!scheduleData) return true; // Empty template is valid

        // Group slots by day + assignee
        const groups: Map<string, number> = new Map();

        for (const dayKey of Object.keys(scheduleData)) {
            const slots = scheduleData[dayKey as keyof WeeklySchedule];
            if (!slots || !Array.isArray(slots)) continue;

            for (const slot of slots) {
                const assignee = slot.assigned_id || "unassigned";
                const key = `${dayKey}|${assignee}`;
                groups.set(key, (groups.get(key) || 0) + 1);
            }
        }

        // Check for odd counts (incomplete pairs)
        const incompleteAssignees: string[] = [];
        for (const [key, count] of groups) {
            if (count % 2 !== 0) {
                incompleteAssignees.push(key);
            }
        }

        if (incompleteAssignees.length > 0) {
            alert(`⚠️ Validation échouée: ${incompleteAssignees.length} jour(s)/assignee(s) ont un checkout manquant.\n\nVeuillez ajouter les checkouts manquants (nombre pair de dots requis par jour) avant d'appliquer le modèle.`);
            return false;
        }

        return true;
    };

    const handleAssignTemplateToDate = async (dateOrDates: Date | Date[], template: any, targetAssignee?: { id: string, type: 'team' | 'employee' }) => {
        // VALIDATION: Check for complete check-in/check-out pairs before applying
        if (!validateTemplateCheckouts(template.schedule_data)) {
            return; // Block application if validation fails
        }

        const dates = Array.isArray(dateOrDates) ? dateOrDates : [dateOrDates];
        if (dates.length === 0) return;

        // TEMPLATE-FIRST: Send template_id directly, no shift creation!
        // Backend stores schedules with template_id reference
        // PlanningEngine dynamically expands template.schedule_data per day
        const batchAssignments: any[] = [];

        // Helper to map Date's getDay() to schedule_data keys (lowercase matches backend JSON)
        const dayKeyMap: { [key: number]: string } = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
        };
        // Backend uses lowercase keys in JSON
        for (const date of dates) {
            // Get the specific day's schedule from template
            const dayOfWeek = date.getDay();
            const dayKey = dayKeyMap[dayOfWeek]; // For logging
            // Helper: get schedule for this specific day (0=Sunday, 1=Monday...)
            const daySchedule = template.schedule_data ? template.schedule_data[dayKey.toLowerCase()] || [] : [];

            // let assignedId = "";
            // let assignedType = "";
            // let startTime: string | undefined;
            // let endTime: string | undefined;

            // Extract assignee and times from THIS DAY's schedule
            if (daySchedule.length > 0) {
                // MULTI-SLOT SUPPORT: Iterate through ALL slots defined in the template for this day
                for (const slot of daySchedule) {
                    let slotAssignedId = slot.assigned_id || "";
                    let slotAssignedType = slot.assigned_type || 'team'; // Default to team if not specified

                    // Fallback: If template slot is generic (no assignee), use the target assignee
                    if (!slotAssignedId && targetAssignee) {
                        slotAssignedId = targetAssignee.id;
                        slotAssignedType = targetAssignee.type;
                    }

                    console.log(`[DEBUG_TEMPLATE] Processing Date=${format(date, "yyyy-MM-dd")}, Slot=${slot.start}-${slot.end}, AssignedID=${slotAssignedId}, Type=${slotAssignedType}`);

                    // Only add if we have an assignee or if it's intended to be a global placeholder (though usually slots have times)
                    // If it's a slot with times but no assignee, it might be a "floating" shift. 
                    // But for now, we assume if it's in the template, it should be assigned.

                    batchAssignments.push({
                        date: format(date, "yyyy-MM-dd"),
                        start_time: slot.start,
                        end_time: slot.end,
                        assigned_id: slotAssignedId,
                        assigned_type: slotAssignedType,
                        team_id: slotAssignedType === 'team' ? slotAssignedId : undefined,
                        user_id: slotAssignedType === 'employee' ? slotAssignedId : undefined,
                        template_id: template.id, // DIRECT TEMPLATE REFERENCE
                        name: template.name,
                        is_placeholder: false
                    });
                }
            } else {
                // EMPTY DAY IN TEMPLATE -> Create Placeholder
                // Should be "Global Placeholder" (empty ID) to trigger day wipe, 
                // UNLESS we are targeting a specific row (targetAssignee). 
                // But typically, applying a template means "apply this pattern". 
                // If the pattern is empty, it means "clear this day".

                let placeholderId = "";
                let placeholderType = "";

                if (targetAssignee) {
                    placeholderId = targetAssignee.id;
                    placeholderType = targetAssignee.type;
                }

                batchAssignments.push({
                    date: format(date, "yyyy-MM-dd"),
                    start_time: undefined,
                    end_time: undefined,
                    assigned_id: placeholderId,
                    assigned_type: placeholderType,
                    team_id: placeholderType === 'team' ? placeholderId : undefined,
                    user_id: placeholderType === 'employee' ? placeholderId : undefined,
                    template_id: template.id,
                    name: template.name,
                    is_placeholder: true // EXPLICITLY MARK AS PLACEHOLDER
                });
            }
        }

        if (batchAssignments.length === 0) return;

        console.log("[handleAssignTemplateToDate] TEMPLATE-FIRST: Sending Batch", {
            templateId: template.id,
            templateName: template.name,
            count: batchAssignments.length,
            dates: dates.map(d => format(d, 'yyyy-MM-dd'))
        });

        try {
            await PlanningService.createAssignmentsBatch({ assignments: batchAssignments });
            queryClient.invalidateQueries({ queryKey: ["shifts"] });
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        } catch (error: any) {
            console.error("Batch Creation Failed. Status:", error.response?.status);
            if (error.response?.status === 409) {
                // Conflict detected - AUTO-OVERWRITE (User explicitly requested force mode)
                console.log("Auto-resolving conflict with overwrite...");
                // DEBUG PAYLOAD
                console.log("Retry Payload (First 3):", batchAssignments.slice(0, 3));
                const invalidItems = batchAssignments.filter(a => !a.assigned_id && !a.is_placeholder);
                if (invalidItems.length > 0) {
                    console.error("CRITICAL: Found invalid items in batch (No ID, Not Placeholder):", invalidItems);
                    alert(`CRITICAL: ${invalidItems.length} invalid items in batch payload! Check console.`);
                }
                try {
                    const retryRes = await PlanningService.createAssignmentsBatch({
                        assignments: batchAssignments,
                        overwrite: true
                    });
                    console.log("Retry Result (Overwrite):", retryRes);
                    alert(`Force update successful! Created: ${batchAssignments.length}`);
                    queryClient.invalidateQueries({ queryKey: ["shifts"] });
                    queryClient.invalidateQueries({ queryKey: ["assignments"] });
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                } catch (retryError) {
                    console.error('Retry failed:', retryError);
                    alert("Erreur lors de la mise à jour forcée.");
                }
            } else {
                console.error('Error applying template batch:', error);
                alert("Une erreur est survenue lors de l'application du modèle: " + (error.response?.data?.message || error.message));
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
                settings={settings}
            />

            {/* TEAM LEGEND / FILTER (Appears in View Mode AND Template Mode if needed, usually global) */}
            {/* The user specifically wanted it in 'Planning View' (mode='view') to replace the dropdown */}
            {layout.mode === 'view' && (
                <TeamLegendFilter
                    teams={Object.values(teams)}
                    selectedTeamIds={layout.selectedTeamIds}
                    onToggleTeam={(id) => layout.setSelectedTeamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    onSelectAll={() => layout.setSelectedTeamIds(Object.values(teams).map(t => t.id))}
                />
            )}

            {/* Template Mode: Manager & Actions */}
            {layout.mode === 'template' && (
                <>
                    <TemplateManager
                        templates={templateMgr.genericTemplates}
                        selectedTemplateId={layout.selectedTemplate?.id || null}
                        onSelectTemplate={templateMgr.handleTemplateSelect}
                        onCreateTemplate={templateMgr.handleCreateNewTemplate}
                        onEditTemplate={(template) => {
                            layout.setSelectedTemplate(template as any); // Cast for legacy layout state
                            layout.setEditingShiftId(template.id);
                        }}
                        onDeleteTemplate={(template) => {
                            if (window.confirm(`Supprimer le modèle "${template.name}" ?`)) {
                                // deleteTemplate(template.id);
                                templateMgr.handleDeleteTemplate(template.id);
                            }
                        }}
                    />
                    <Toolbar>
                        <div style={{ flex: 1, color: 'var(--color-text-main)', fontSize: '1.05rem', fontWeight: 500 }}>
                            {layout.selectedTemplate ? `Édition: ${layout.selectedTemplate?.name}` : "Nouveau Modèle (Brouillon)"}
                            {templateMgr.isDirty && <span style={{ color: 'var(--color-orange-500)', marginLeft: '0.5rem', fontWeight: 400 }}>(Modifié)</span>}
                        </div>
                        {templateMgr.isDirty && (
                            <>
                                <Button variation="secondary" size="small" onClick={templateMgr.handleCancelDraft}>Annuler</Button>
                                <Button variation="primary" size="small" disabled={!templateMgr.hasAssignments} onClick={() => {
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
                    onUpdateTeam={(_id, _data) => {
                        // updateTeam({ id, data })
                        console.warn("Update team not implemented");
                    }}
                    onDeleteTeam={(_id) => {
                        // deleteTeam(id)
                        console.warn("Delete team not implemented");
                    }}
                    onAddTeam={() => layout.setIsTeamModalOpen(true)}
                />
            )}

            <ContentArea>
                {layout.mode === 'template' ? (
                    <GenericWeekView
                        computedSchedule={templateMgr.draftPreviewSchedule}
                        teams={displayTeams}
                        timeSlot={layout.timeSlot}
                        onCellClick={assignment.handleCellClick}
                    />
                ) : (
                    <>
                        {layout.viewMode === "week" && (
                            <OperationalWeekView
                                dates={weekDates}
                                teams={displayTeams}
                                computedSchedule={scheduleForWeekView}
                                timeSlot={layout.timeSlot}
                                settings={settings}
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
                                selectedTeamIds={layout.selectedTeamIds}
                            />
                        )}
                    </>
                )}
            </ContentArea>

            {/* ============ OVERLAYS ============ */}

            {assignment.popoverState && (
                <AssignmentPopover
                    x={assignment.popoverState.x}
                    y={assignment.popoverState.y}
                    cellHeight={assignment.popoverState.cellHeight}
                    teams={Object.values(teams)}
                    employees={Object.values(state.employees)}
                    assignedIds={assignment.popoverState.assignedIds}
                    onToggle={assignment.handleToggle}
                    onClose={assignment.closePopover}
                    collisionData={assignment.popoverState.collisionData}
                    onResolveConflict={(mode) => {
                        assignment.handleResolveConflict(mode);
                    }}
                />
            )}

            {layout.assignModalDate && (
                <TeamAssignmentDialog
                    isOpen={true}
                    date={layout.assignModalDate!}
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
                    onSave={(_data) => {
                        // createTeam({ name: data.name, department: data.department || "General", manager_id: undefined });
                        console.warn("Create team not implemented");
                        layout.setIsTeamModalOpen(false);
                    }}
                />
            )}

            {layout.editingShiftId && (
                <ShiftTemplateEditorModal
                    isOpen={true}
                    shift={layout.editingShiftId === "NEW" ? undefined : (layout.selectedTemplate && layout.isCreatingTemplate ? undefined : shifts[layout.editingShiftId!] || layout.selectedTemplate)}
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
                    date={layout.viewAssignmentsDate!}
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

            {/* OVERRIDE MODAL removed - conflict resolution now handled inline by AssignmentPopover via useTemplateAssignment */}

        </LayoutContainer>
    );
}

