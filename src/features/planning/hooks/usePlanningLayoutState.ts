import { useState } from "react";
import { Shift } from "../types";

export type ViewMode = "week" | "month" | "cells";
export type PlanningMode = "view" | "template";
export type TimeSlot = "day" | "night";

export function usePlanningLayoutState() {
    const [mode, setMode] = useState<PlanningMode>("view");
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [timeSlot, setTimeSlot] = useState<TimeSlot>("day");

    // Filters
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

    // Modals & Popovers
    const [assignModalDate, setAssignModalDate] = useState<Date | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [viewAssignmentsDate, setViewAssignmentsDate] = useState<Date | null>(null);

    // Template specific selection
    const [selectedTemplate, setSelectedTemplate] = useState<Shift | null>(null);

    return {
        mode, setMode,
        viewMode, setViewMode,
        timeSlot, setTimeSlot,
        selectedTeamIds, setSelectedTeamIds,

        assignModalDate, setAssignModalDate,
        isTeamModalOpen, setIsTeamModalOpen,
        editingShiftId, setEditingShiftId,
        isCreatingTemplate, setIsCreatingTemplate,
        viewAssignmentsDate, setViewAssignmentsDate,

        selectedTemplate, setSelectedTemplate
    };
}
