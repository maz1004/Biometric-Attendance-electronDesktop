import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shift, WeeklySchedule, ComputedSchedule } from "../types";
import { PlanningService } from "../../../services/planning";
import { getWeekDates } from "../engine/PlanningEngine";
import { usePlanning } from "./usePlanning";

const DAYS_KEY_MAP = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function useTemplateManager(
    selectedTemplate: Shift | null,
    setSelectedTemplate: Dispatch<SetStateAction<Shift | null>>,
    weekDate: string,
    employees: Record<string, any>,
    teams: Record<string, any> // NEW: Teams for name resolution
) {
    const queryClient = useQueryClient();
    const { updateShift, createShift } = usePlanning();

    const [draftSchedule, setDraftSchedule] = useState<WeeklySchedule>({
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    });
    const [isDirty, setIsDirty] = useState(false);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

    // Fetch Generic Templates
    const { data: genericTemplates = [] } = useQuery({
        queryKey: ["templates", "TEMPLATE_LIBRARY"],
        queryFn: () => PlanningService.getShifts("TEMPLATE_LIBRARY")
    });

    // Reset Draft
    const handleTemplateSelect = (template: Shift) => {
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
    };

    const handleCancelDraft = () => {
        if (selectedTemplate) {
            handleTemplateSelect(selectedTemplate);
        } else {
            handleCreateNewTemplate();
        }
    };

    const handleSaveDraft = (metadata?: Partial<Shift>) => {
        const payload = metadata || {};

        if (!selectedTemplate) {
            // Create New
            const newShiftPayload: any = {
                name: payload.name || "Nouveau Modèle",
                color: payload.color || "#3b82f6",
                schedule_data: draftSchedule,
                week_key: "TEMPLATE_LIBRARY",
            };
            createShift(newShiftPayload, {
                onSuccess: () => {
                    setIsCreatingTemplate(false);
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                    setIsDirty(false);
                }
            });
        } else {
            // Update Existing
            updateShift({
                id: selectedTemplate.id,
                data: {
                    id: selectedTemplate.id,
                    name: payload.name,
                    color: payload.color,
                    schedule_data: draftSchedule
                }
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                    setIsDirty(false);
                    setSelectedTemplate(prev => prev ? ({ ...prev, ...payload, schedule_data: draftSchedule }) : null);
                }
            });
        }
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
                results.push({
                    id: `draft-${dayKey}-${slotIndex}`,
                    date: dateStr,
                    teamId: slot.assigned_id || "unassigned",
                    shiftId: "draft",
                    shiftName: "Draft",
                    startTime: slot.start,
                    endTime: slot.end,
                    source: 'RULE',
                    color: slot.color,
                    assigneeId: slot.assigned_type === 'employee' ? slot.assigned_id : undefined,
                    assigneeName: slot.assigned_type === 'employee'
                        ? employees[slot.assigned_id || ""]?.name
                        : slot.assigned_type === 'team'
                            ? teams[slot.assigned_id || ""]?.name
                            : "Unknown"
                });
            });
        });
        return results;
    }, [draftSchedule, weekDates, employees, teams]);

    return {
        genericTemplates,
        draftSchedule, setDraftSchedule,
        isDirty, setIsDirty,
        isCreatingTemplate, setIsCreatingTemplate,
        handleTemplateSelect,
        handleCreateNewTemplate,
        handleCancelDraft,
        handleSaveDraft,
        draftPreviewSchedule
    };
}
