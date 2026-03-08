import { useState, useMemo, useEffect, Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { WeeklySchedule, ComputedSchedule, WeeklyTemplate } from "../types";
import { getWeekDates } from "../engine/PlanningEngine";
import { computeCheckoutStatus } from "../engine/dotRenderEngine";
import { usePlanning } from "./usePlanning";

const DAYS_KEY_MAP = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function useTemplateManager(
    selectedTemplate: WeeklyTemplate | null,
    setSelectedTemplate: Dispatch<SetStateAction<WeeklyTemplate | null>>,
    weekDate: string,
    employees: Record<string, any>,
    teams: Record<string, any>, // NEW: Teams for name resolution
    genericTemplates: WeeklyTemplate[] // NEW: Passed from parent (sourced from usePlanning)
) {
    // const queryClient = useQueryClient(); // Unused

    const { createTemplate, updateTemplate, deleteTemplate } = usePlanning();

    const [draftSchedule, setDraftSchedule] = useState<WeeklySchedule>({
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    });
    const [isDirty, setIsDirty] = useState(false);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

    // Auto-sync selectedTemplate when genericTemplates are refetched (e.g. after update)
    useEffect(() => {
        if (selectedTemplate && genericTemplates.length > 0) {
            const updated = genericTemplates.find(t => t.id === selectedTemplate.id);
            if (updated && JSON.stringify(updated.schedule_data) !== JSON.stringify(selectedTemplate.schedule_data)) {
                setSelectedTemplate(updated);
                setDraftSchedule(JSON.parse(JSON.stringify(updated.schedule_data || {
                    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
                })));
            }
        }
    }, [genericTemplates, selectedTemplate?.id, selectedTemplate?.schedule_data, setSelectedTemplate]);

    // Reset Draft
    const handleTemplateSelect = (template: WeeklyTemplate) => {
        setSelectedTemplate(template);
        setDraftSchedule(JSON.parse(JSON.stringify(template.schedule_data || {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        })));
        setIsDirty(false);
    };

    const handleCreateNewTemplate = () => {
        setSelectedTemplate(null);
        setDraftSchedule({
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        });
        setIsDirty(false);
        setIsCreatingTemplate(true); // Flag that we are in creation mode
    };

    const handleCancelDraft = () => {
        if (selectedTemplate) {
            handleTemplateSelect(selectedTemplate);
        } else {
            handleCreateNewTemplate();
        }
        setIsCreatingTemplate(false);
    };

    const handleSaveDraft = (metadata?: Partial<WeeklyTemplate>) => {
        const payload = metadata || {};

        if (!selectedTemplate) {
            // Create New
            const newTemplatePayload: any = {
                name: payload.name || "Nouveau Modèle",
                description: payload.description,
                schedule_data: draftSchedule,
            };
            createTemplate(newTemplatePayload, {
                onSuccess: () => {
                    setIsCreatingTemplate(false);
                    // queryClient.invalidateQueries({ queryKey: ["templates"] }); // Handled in usePlanning mutation logic
                    setIsDirty(false);
                }
            });
        } else {
            // Update Existing
            updateTemplate({
                id: selectedTemplate.id,
                data: {
                    name: payload.name,
                    description: payload.description,
                    schedule_data: draftSchedule
                }
            }, {
                onSuccess: () => {
                    // queryClient.invalidateQueries({ queryKey: ["templates"] });
                    setIsDirty(false);
                    // Update local state optimistically or wait for refetch
                    setSelectedTemplate(prev => prev ? ({ ...prev, ...payload, schedule_data: draftSchedule }) : null);
                }
            });
        }
    };

    const handleDeleteTemplate = (templateId: string) => {
        deleteTemplate(templateId, {
            onSuccess: () => {
                // If deleted template was selected, clear selection
                if (selectedTemplate?.id === templateId) {
                    handleCreateNewTemplate();
                }
            }
        });
    };

    const handleClearDay = (dayIndex: number) => {
        const dayKey = DAYS_KEY_MAP[dayIndex];
        if (!dayKey) return;
        setDraftSchedule(prev => ({ ...prev, [dayKey]: [] }));
        setIsDirty(true);
    };

    const handleClearTimeSlot = (targetTimeStr: string) => {
        setDraftSchedule(prev => {
            const next = { ...prev };
            DAYS_KEY_MAP.forEach(day => {
                const slots = next[day as keyof WeeklySchedule] || [];
                next[day as keyof WeeklySchedule] = slots.filter(s => s.start !== targetTimeStr);
            });
            return next;
        });
        setIsDirty(true);
    };

    // Derived Preview
    const weekDates = useMemo(() => getWeekDates(weekDate), [weekDate]);

    const draftPreviewSchedule: ComputedSchedule[] = useMemo(() => {
        const results: ComputedSchedule[] = [];
        DAYS_KEY_MAP.forEach((dayKey, index) => {
            const slots = draftSchedule[dayKey as keyof WeeklySchedule] || [];
            if (!weekDates[index]) return;
            const dateStr = format(weekDates[index], "yyyy-MM-dd");

            slots.forEach((slot, slotIndex) => {
                // For employees, don't set teamId so they aren't filtered by team filter
                const isEmployee = slot.assigned_type === 'employee';
                const isTeam = slot.assigned_type === 'team';

                // Compute checkout status using pure function
                const missingCheckout = computeCheckoutStatus(
                    slots,
                    slot.assigned_id || '',
                    slot.assigned_type as 'team' | 'employee',
                    teams
                );

                if (isTeam && slot.assigned_id && teams[slot.assigned_id]) {
                    // TEAM EXPANSION: Create one ComputedSchedule per team member
                    const team = teams[slot.assigned_id];
                    const memberIds: string[] = team.memberIds || [];

                    if (memberIds.length > 0) {
                        memberIds.forEach((memberId: string, memberIndex: number) => {
                            // Check if this member has an individual override (employee slot) on this day
                            const memberOverride = slots.find(s =>
                                s.assigned_type === 'employee' &&
                                s.assigned_id === memberId &&
                                !s.is_checkout
                            );
                            const memberCheckout = slots.find(s =>
                                s.assigned_type === 'employee' &&
                                s.assigned_id === memberId &&
                                s.is_checkout
                            );

                            // Use member's personal times if override exists, else team times
                            const effectiveStart = memberOverride ? memberOverride.start : slot.start;
                            const effectiveEnd = memberCheckout ? memberCheckout.end : (memberOverride ? memberOverride.end : slot.end);

                            results.push({
                                id: `draft-${dayKey}-${slotIndex}-member-${memberIndex}`,
                                date: dateStr,
                                teamId: slot.assigned_id,
                                shiftId: "draft",
                                shiftName: "Draft",
                                startTime: effectiveStart,
                                endTime: effectiveEnd,
                                source: 'RULE',
                                color: slot.color || team.color,
                                assigneeId: memberId,
                                assigneeName: employees[memberId]?.name || "Membre",
                                isMissingCheckout: missingCheckout,
                                isCheckoutMarker: false,
                            });
                        });
                    } else {
                        // Team with no members - show single team dot as fallback
                        results.push({
                            id: `draft-${dayKey}-${slotIndex}`,
                            date: dateStr,
                            teamId: slot.assigned_id,
                            shiftId: "draft",
                            shiftName: "Draft",
                            startTime: slot.start,
                            endTime: slot.end,
                            source: 'RULE',
                            color: slot.color || team.color,
                            assigneeId: undefined,
                            assigneeName: team.name || "Unknown",
                            isMissingCheckout: missingCheckout,
                            isCheckoutMarker: slot.is_checkout || false,
                        });
                    }
                } else {
                    // EMPLOYEE or unknown type — render as-is (single dot)

                    let assigneeName = "Inconnu";
                    let isGhost = false;

                    if (isEmployee) {
                        if (employees[slot.assigned_id || ""]) {
                            assigneeName = employees[slot.assigned_id || ""].name;
                        } else if (slot.assigned_id) {
                            assigneeName = `Employé Supprimé (${slot.assigned_id.substring(0, 4)}...)`;
                            isGhost = true;
                        }
                    } else if (isTeam) { // Handle cases where team has no members, but team itself is missing
                        if (teams[slot.assigned_id || ""]) {
                            assigneeName = teams[slot.assigned_id || ""].name;
                        } else if (slot.assigned_id) {
                            assigneeName = `Équipe Supprimée (${slot.assigned_id.substring(0, 4)}...)`;
                            isGhost = true;
                        }
                    }

                    results.push({
                        id: `draft-${dayKey}-${slotIndex}`,
                        date: dateStr,
                        teamId: isEmployee ? undefined : (slot.assigned_id || undefined),
                        shiftId: "draft",
                        shiftName: "Draft",
                        startTime: slot.start,
                        endTime: slot.end,
                        source: 'RULE',
                        color: isGhost ? '#ef4444' : slot.color, // Red if ghost
                        assigneeId: isEmployee ? slot.assigned_id : undefined,
                        assigneeName: assigneeName,
                        isMissingCheckout: missingCheckout,
                        isCheckoutMarker: slot.is_checkout || false,
                        // @ts-ignore - Flag for rendering
                        isGhostData: isGhost
                    });
                }
            });
        });
        return results;
    }, [draftSchedule, weekDates, employees, teams]);

    const hasAssignments = useMemo(() => {
        return DAYS_KEY_MAP.some(day => (draftSchedule[day as keyof WeeklySchedule]?.length || 0) > 0);
    }, [draftSchedule]);

    return {
        genericTemplates, // Return the props passed in, for consistency
        draftSchedule, setDraftSchedule,
        isDirty, setIsDirty,
        isCreatingTemplate, setIsCreatingTemplate,
        handleTemplateSelect,
        handleCreateNewTemplate,
        handleCancelDraft,
        handleSaveDraft,
        handleDeleteTemplate,
        handleClearDay,
        handleClearTimeSlot,
        draftPreviewSchedule,
        hasAssignments
    };
}
