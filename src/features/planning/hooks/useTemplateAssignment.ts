/**
 * useTemplateAssignment.ts
 * 
 * State machine hook for template assignment flow.
 * Replaces the 4 inline functions from PlanningLayout:
 *   handleTemplateCellClick, handlePopoverToggle, 
 *   processAssignmentChange, handleOverrideDecision
 * 
 * KEY DESIGN RULES:
 * 1. Team check-out = modify team slot's `end`, override individual members' personal checkouts
 * 2. Individual check-out linked to team = NO separate check-in dot (uses team's start)
 * 3. Removing team = removes linked individual overrides, keeps independent ones
 */

import { useState, useCallback } from "react";
import { ComputedSchedule, Team, WeeklySchedule, EmployeeMini } from "../types";
import {
    findExistingAssignment,
    computeAvailableActions,
    applyAssignment,
    findSlotToDeselect,
    AvailableActions,
} from "../engine/assignmentResolver";

// ─── Types ───────────────────────────────────────────────────────────────

export interface PopoverState {
    isOpen: boolean;
    x: number;
    y: number;
    cellHeight: number;
    dayIndex: number;
    slotHour: number;
    assignedIds: string[];
    collisionData?: CollisionData | null;
}

export interface CollisionData {
    employeeName: string;
    teamName: string;
    teamStart: string;
    teamEnd: string;
    clickedTime: string;
    canCheckIn: boolean;
    canCheckOut: boolean;
}

interface PendingOverride {
    employeeId: string;
    employeeName: string;
    teamId: string;
    teamName: string;
    teamSlotIndex: number;
    dayKey: string;
    clickedHour: number;
    actions: AvailableActions;
}

const DAYS_KEY_MAP = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// ─── Hook ────────────────────────────────────────────────────────────────

export function useTemplateAssignment(
    draftSchedule: WeeklySchedule,
    setDraftSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>,
    setIsDirty: (dirty: boolean) => void,
    teams: Record<string, Team>,
    employees: Record<string, EmployeeMini>
) {
    const [popoverState, setPopoverState] = useState<PopoverState | null>(null);
    const [pendingOverride, setPendingOverride] = useState<PendingOverride | null>(null);

    // ─── 1. Cell Click → Open Popover ──────────────────────────────────────

    const handleCellClick = useCallback((
        dayIndex: number,
        slotHour: number,
        event: React.MouseEvent<HTMLDivElement>,
        currentAssignments: ComputedSchedule[]
    ) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const assignedIds = currentAssignments
            .map(c => c.teamId || c.assigneeId)
            .filter((id): id is string => !!id);

        setPopoverState({
            isOpen: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            cellHeight: rect.height,
            dayIndex,
            slotHour,
            assignedIds,
            collisionData: null,
        });
        setPendingOverride(null);
    }, []);

    // ─── 2. Toggle Selection → Detect Conflicts or Apply ──────────────────

    const handleToggle = useCallback((id: string, type: 'team' | 'employee') => {
        if (!popoverState) return;
        const { dayIndex, slotHour } = popoverState;
        const dayKey = DAYS_KEY_MAP[dayIndex] as keyof WeeklySchedule;
        const daySlots = draftSchedule[dayKey] || [];
        const startStr = `${slotHour.toString().padStart(2, '0')}:00`;

        // ── TEAM TOGGLE ──────────────────────────────────────────────────────
        if (type === 'team') {
            // Check if already assigned
            const existingIdx = findSlotToDeselect(daySlots, id, 'team');

            if (existingIdx >= 0) {
                const existingSlot = daySlots[existingIdx];
                const existingStartHour = parseInt(existingSlot.start.split(':')[0], 10);

                if (existingStartHour === slotHour) {
                    // SAME hour clicked → Deselect: remove team + linked individual overrides
                    setDraftSchedule(prev => {
                        const newSchedule = { ...prev };
                        newSchedule[dayKey] = applyAssignment(
                            prev[dayKey] || [],
                            { type: 'REMOVE_TEAM', teamId: id },
                            teams
                        );
                        return newSchedule;
                    });
                } else {
                    // DIFFERENT hour clicked → offer check-out/check-in
                    const existing = { slot: existingSlot, slotIndex: existingIdx, source: 'team' as const, teamId: id };
                    const actions = computeAvailableActions(existing, slotHour);
                    const team = teams[id];

                    if (actions.canCheckOut) {
                        // Show conflict popup for team check-out
                        setPopoverState(prev => prev ? ({
                            ...prev,
                            collisionData: {
                                employeeName: team?.name || 'Team',
                                teamName: team?.name || 'Team',
                                teamStart: existingSlot.start,
                                teamEnd: existingSlot.end,
                                clickedTime: startStr,
                                canCheckIn: actions.canCheckIn,
                                canCheckOut: actions.canCheckOut,
                            }
                        }) : null);

                        setPendingOverride({
                            employeeId: id,
                            employeeName: team?.name || 'Team',
                            teamId: id,
                            teamName: team?.name || 'Team',
                            teamSlotIndex: existingIdx,
                            dayKey,
                            clickedHour: slotHour,
                            actions,
                        });
                        return;
                    }
                }
            } else {
                // Not assigned yet → Check-in marker (zero-duration)
                setDraftSchedule(prev => {
                    const newSchedule = { ...prev };
                    newSchedule[dayKey] = applyAssignment(
                        prev[dayKey] || [],
                        {
                            type: 'ADD',
                            slot: {
                                start: startStr,
                                end: startStr, // Zero-duration = check-in marker
                                assigned_id: id,
                                assigned_type: 'team',
                                color: teams[id]?.color || '#3b82f6',
                            }
                        },
                        teams
                    );
                    return newSchedule;
                });
            }

            setIsDirty(true);
            updatePopoverAssignedIds(id);
            return;
        }

        // ── EMPLOYEE TOGGLE ──────────────────────────────────────────────────
        if (type === 'employee') {
            const employee = employees[id];

            // Check if this employee has ANY existing assignment (direct or via team)
            const existing = findExistingAssignment(id, 'employee', daySlots, teams);

            if (existing) {
                // Employee already assigned somewhere on this day

                if (existing.source === 'team') {
                    // Employee is assigned via team → offer individual override (check-out)
                    const actions = computeAvailableActions(existing, slotHour);
                    const teamName = existing.teamId ? teams[existing.teamId]?.name || 'Team' : 'Team';

                    setPopoverState(prev => prev ? ({
                        ...prev,
                        collisionData: {
                            employeeName: employee?.name || 'Employé',
                            teamName,
                            teamStart: existing.slot.start,
                            teamEnd: existing.slot.end,
                            clickedTime: startStr,
                            canCheckIn: actions.canCheckIn,
                            canCheckOut: actions.canCheckOut,
                        }
                    }) : null);

                    setPendingOverride({
                        employeeId: id,
                        employeeName: employee?.name || 'Employé',
                        teamId: existing.teamId || '',
                        teamName,
                        teamSlotIndex: existing.slotIndex,
                        dayKey,
                        clickedHour: slotHour,
                        actions,
                    });
                    return;
                }

                if (existing.source === 'individual') {
                    // Individual already assigned → try to deselect
                    const deselectIdx = findSlotToDeselect(daySlots, id, 'employee');
                    if (deselectIdx >= 0) {
                        setDraftSchedule(prev => {
                            const newSchedule = { ...prev };
                            newSchedule[dayKey] = applyAssignment(
                                prev[dayKey] || [],
                                { type: 'REMOVE', slotIndex: deselectIdx },
                                teams
                            );
                            return newSchedule;
                        });
                        setIsDirty(true);
                        updatePopoverAssignedIds(id);
                        return;
                    }
                }
            }

            // No existing → check-in marker (zero-duration)
            setDraftSchedule(prev => {
                const newSchedule = { ...prev };
                newSchedule[dayKey] = applyAssignment(
                    prev[dayKey] || [],
                    {
                        type: 'ADD',
                        slot: {
                            start: startStr,
                            end: startStr, // Zero-duration = check-in marker
                            assigned_id: id,
                            assigned_type: 'employee',
                            color: '#10b981',
                        }
                    },
                    teams
                );
                return newSchedule;
            });
            setIsDirty(true);
            updatePopoverAssignedIds(id);
        }
    }, [popoverState, draftSchedule, teams, employees, setDraftSchedule, setIsDirty]);

    // ─── 3. Resolve Conflict ──────────────────────────────────────────────

    const handleResolveConflict = useCallback((mode: 'checkout' | 'checkin' | 'new') => {
        if (!pendingOverride) return;
        const { employeeId, teamSlotIndex, dayKey, clickedHour } = pendingOverride;
        const clickedTime = `${clickedHour.toString().padStart(2, '0')}:00`;
        const dayKeyTyped = dayKey as keyof WeeklySchedule;
        const daySlots = draftSchedule[dayKeyTyped] || [];
        const teamSlot = daySlots[teamSlotIndex];

        if (!teamSlot) {
            closeAll();
            return;
        }

        setDraftSchedule(prev => {
            const newSchedule = { ...prev };
            const currentDaySlots = prev[dayKeyTyped] || [];

            if (mode === 'checkout') {
                // Check if we are dealing with a team's own check-out or a member's override
                if (pendingOverride.employeeId === pendingOverride.teamId) {
                    // Team check-out: modify team slot's end time
                    newSchedule[dayKeyTyped] = applyAssignment(
                        currentDaySlots,
                        { type: 'MODIFY_END', slotIndex: teamSlotIndex, newEnd: clickedTime },
                        teams
                    );
                } else {
                    // Individual check-out linked to team: create override WITHOUT separate check-in
                    newSchedule[dayKeyTyped] = applyAssignment(
                        currentDaySlots,
                        {
                            type: 'CHECKOUT_INDIVIDUAL',
                            teamSlotIndex,
                            employeeId,
                            checkoutTime: clickedTime,
                        },
                        teams
                    );
                }
            } else if (mode === 'checkin') {
                // Individual check-in: new slot from clicked time to team's end
                const cleaned = currentDaySlots.filter(s =>
                    !(s.assigned_id === employeeId && s.assigned_type === 'employee')
                );
                cleaned.push({
                    start: clickedTime,
                    end: teamSlot.end,
                    assigned_id: employeeId,
                    assigned_type: 'employee',
                    color: '#10b981',
                });
                newSchedule[dayKeyTyped] = cleaned;
            } else {
                // New independent shift (1-hour slot, unrelated to team)
                const endStr = `${(clickedHour + 1).toString().padStart(2, '0')}:00`;
                newSchedule[dayKeyTyped] = applyAssignment(
                    currentDaySlots,
                    {
                        type: 'ADD',
                        slot: {
                            start: clickedTime,
                            end: endStr,
                            assigned_id: employeeId,
                            assigned_type: 'employee',
                            color: '#10b981',
                        }
                    },
                    teams
                );
            }

            return newSchedule;
        });

        setIsDirty(true);
        closeAll();
    }, [pendingOverride, draftSchedule, teams, setDraftSchedule, setIsDirty]);

    // ─── Helpers ───────────────────────────────────────────────────────────

    const updatePopoverAssignedIds = useCallback((toggledId: string) => {
        setPopoverState(prev => {
            if (!prev) return null;
            const ids = prev.assignedIds.includes(toggledId)
                ? prev.assignedIds.filter(x => x !== toggledId)
                : [...prev.assignedIds, toggledId];
            return { ...prev, assignedIds: ids, collisionData: null };
        });
    }, []);

    const closePopover = useCallback(() => {
        setPopoverState(null);
        setPendingOverride(null);
    }, []);

    const closeAll = useCallback(() => {
        setPopoverState(null);
        setPendingOverride(null);
    }, []);

    // ─── Return ────────────────────────────────────────────────────────────

    return {
        popoverState,
        handleCellClick,
        handleToggle,
        handleResolveConflict,
        closePopover,
    };
}
