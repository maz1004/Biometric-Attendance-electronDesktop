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
    AvailableActions,
    AssignmentAction,
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

    // ─── Helpers ───────────────────────────────────────────────────────────

    function decimalToTimeStr(decimal: number): string {
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function timeStrToDecimal(time: string): number {
        const [h, m] = time.split(':').map(Number);
        return h + m / 60;
    }

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
        // FIX: Use decimalToTimeStr
        const startStr = decimalToTimeStr(slotHour);

        // Find existing assignment (works for both Team and Employee)
        const existing = findExistingAssignment(id, type, daySlots, teams);

        if (existing) {
            // FIX: Use decimal comparison instead of integer parsing
            const existingStartDec = timeStrToDecimal(existing.slot.start);
            const existingEndDec = timeStrToDecimal(existing.slot.end);

            const isPoint = existing.slot.start === existing.slot.end;
            // Use small epsilon for float comparison if needed, but exact should be fine for 0.5 steps
            const isExactStart = Math.abs(slotHour - existingStartDec) < 0.01;
            const isExactEnd = Math.abs(slotHour - existingEndDec) < 0.01;

            // 1. EXACT MATCHES -> Direct Action
            if (isExactStart) {
                // Remove entire assignment
                setDraftSchedule(prev => {
                    const newSchedule = { ...prev };

                    let action: AssignmentAction;
                    if (existing.source === 'team' && type === 'team') {
                        action = { type: 'REMOVE_TEAM', teamId: id };
                    } else if (existing.source === 'team' && type === 'employee') {
                        // User clicked an individual member of a team assignment -> Explode team, remove this member
                        action = { type: 'REMOVE_MEMBER_FROM_TEAM', teamSlotIndex: existing.slotIndex, employeeId: id };
                    } else {
                        // Individual assignment or fallback
                        action = { type: 'REMOVE', slotIndex: existing.slotIndex };
                    }

                    newSchedule[dayKey] = applyAssignment(prev[dayKey] || [], action, teams);
                    return newSchedule;
                });
                setIsDirty(true);
                updatePopoverAssignedIds(id);
                return;
            }

            if (!isPoint && isExactEnd) {
                // Remove Check-out (Reset to Point at Check-in)
                setDraftSchedule(prev => {
                    const newSchedule = { ...prev };
                    newSchedule[dayKey] = applyAssignment(
                        prev[dayKey] || [],
                        { type: 'MODIFY_END', slotIndex: existing.slotIndex, newEnd: existing.slot.start },
                        teams
                    );
                    return newSchedule;
                });
                setIsDirty(true);
                return;
            }

            // 2. POINT EXTENSION -> Direct Action (User Requirement for 9h -> 14h click)
            if (isPoint) {
                if (slotHour > existingStartDec) {
                    // Extend End (Check-out)
                    const actionType = existing.source === 'team' && type === 'team' ? 'team_modify' :
                        existing.source === 'team' && type === 'employee' ? 'indiv_override' : 'indiv_modify';

                    setDraftSchedule(prev => {
                        const ns = { ...prev };
                        if (actionType === 'team_modify' || actionType === 'indiv_modify') {
                            ns[dayKey] = applyAssignment(ns[dayKey] || [], { type: 'MODIFY_END', slotIndex: existing.slotIndex, newEnd: startStr }, teams);
                        } else {
                            // Individual override of Team Point
                            ns[dayKey] = applyAssignment(ns[dayKey] || [], { type: 'CHECKOUT_INDIVIDUAL', teamSlotIndex: existing.slotIndex, employeeId: id, checkoutTime: startStr }, teams);
                        }
                        return ns;
                    });
                    setIsDirty(true);
                    return;
                }
                if (slotHour < existingStartDec) {
                    // Move Start (Check-in) - Direct? Or Popover?
                    // "impossible de mettre un check out d 'une personne avant son check in" -> implies moving start is the only option.
                    // Let's do direct move start.
                    setDraftSchedule(prev => {
                        const ns = { ...prev };
                        if (existing.source === 'team' && type === 'employee') {
                            // Override Team Start -> Add new Indiv Slot with new Start and Team End (which is same as Team Start if Point)
                            // Basically new Indiv Slot.
                            const cleaned = (ns[dayKey] || []).filter(s => !(s.assigned_id === id && s.assigned_type === 'employee'));
                            cleaned.push({
                                start: startStr,
                                end: existing.slot.end,
                                assigned_id: id,
                                assigned_type: 'employee',
                                color: '#10b981'
                            });
                            ns[dayKey] = cleaned;
                        } else {
                            // Modify existing
                            ns[dayKey] = applyAssignment(ns[dayKey] || [], { type: 'MODIFY_START', slotIndex: existing.slotIndex, newStart: startStr }, teams);
                        }
                        return ns;
                    });
                    setIsDirty(true);
                    return;
                }
            }

            // 3. RANGE MODIFICATION -> Popover Choices
            // (Clicked Between, After, or Before a Range)
            const actions = computeAvailableActions(existing, slotHour);
            const entityName = type === 'team' ? teams[id]?.name : employees[id]?.name;
            const teamName = existing.teamId ? teams[existing.teamId]?.name || 'Team' : 'Team';

            setPopoverState(prev => prev ? ({
                ...prev,
                collisionData: {
                    employeeName: entityName || (type === 'team' ? 'Team' : 'Employé'),
                    teamName: type === 'team' ? (entityName || 'Team') : teamName,
                    teamStart: existing.slot.start,
                    teamEnd: existing.slot.end,
                    clickedTime: startStr,
                    canCheckIn: actions.canCheckIn,
                    canCheckOut: actions.canCheckOut,
                }
            }) : null);

            setPendingOverride({
                employeeId: id,
                employeeName: entityName || (type === 'team' ? 'Team' : 'Employé'),
                teamId: existing.teamId || (type === 'team' ? id : ''),
                teamName: type === 'team' ? (entityName || 'Team') : teamName,
                teamSlotIndex: existing.slotIndex,
                dayKey,
                clickedHour: slotHour,
                actions,
            });
            return;

        } else {
            // NEW ASSIGNMENT (Check-in marker)
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
                            assigned_type: type,
                            color: type === 'team' ? (teams[id]?.color || '#3b82f6') : '#10b981',
                        }
                    },
                    teams
                );
                return newSchedule;
            });
            setIsDirty(true);
            updatePopoverAssignedIds(id);
        }
    }, [popoverState, draftSchedule, teams, employees, setDraftSchedule, setIsDirty, updatePopoverAssignedIds]);

    // ─── 3. Resolve Conflict ──────────────────────────────────────────────

    const handleResolveConflict = useCallback((mode: 'checkout' | 'checkin' | 'new') => {
        if (!pendingOverride) return;
        const { employeeId, teamSlotIndex, dayKey, clickedHour } = pendingOverride;
        // FIX: Use decimalToTimeStr
        const clickedTime = decimalToTimeStr(clickedHour);

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

                // Safety: If team slot is a point (Start=End) or ends before our new check-in, 
                // we must treat this as a Point (Start=End) or extend to Team End if valid.
                // Actually, if Team ends at 17h and we check-in at 14h, we want 14h-17h.
                // If Team ends at 9h (Point) and we check-in at 14h, we want 14h-14h (Point).
                const teamEndDec = timeStrToDecimal(teamSlot.end);
                const newStartDec = clickedHour;

                let newEnd = teamSlot.end;
                if (teamEndDec <= newStartDec) {
                    newEnd = clickedTime;
                }

                cleaned.push({
                    start: clickedTime,
                    end: newEnd,
                    assigned_id: employeeId,
                    assigned_type: 'employee',
                    color: '#10b981',
                });
                newSchedule[dayKeyTyped] = cleaned;
            } else {
                // New independent shift (1-hour slot, unrelated to team)
                // FIX: Use decimal math for +1 hour
                const endStr = decimalToTimeStr(clickedHour + 1);

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

    // ─── Return ────────────────────────────────────────────────────────────

    return {
        popoverState,
        handleCellClick,
        handleToggle,
        handleResolveConflict,
        closePopover,
    };
}
