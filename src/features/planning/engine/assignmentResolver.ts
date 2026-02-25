/**
 * assignmentResolver.ts
 * 
 * Pure functions for template assignment logic:
 * - Conflict detection (team ↔ individual)
 * - Available action computation
 * - Assignment application (immutable)
 * - Orphan cleanup on team removal
 * 
 * KEY DESIGN RULES (from user requirements):
 * 1. A team check-out modifies the existing team slot's `end` time
 * 2. An individual check-out linked to a team does NOT create a separate check-in dot
 * 3. Removing a team removes individual overrides linked to that team's check-in,
 *    but preserves independent individual assignments
 */

import { TimeSlot, WeeklySchedule, Team } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────

export interface ExistingAssignment {
    slot: TimeSlot;
    slotIndex: number;
    source: 'team' | 'individual';
    /** If source is 'team', the team that owns this slot */
    teamId?: string;
}

export interface AvailableActions {
    /** Can extend/modify the end time of the existing slot */
    canCheckOut: boolean;
    /** Can extend/modify the start time of the existing slot */
    canCheckIn: boolean;
    /** Clicked the exact same start time → toggle off */
    canToggleOff: boolean;
    /** Whether the clicked time matches the existing slot exactly */
    isExactMatch: boolean;
    /** The existing assignment that was found */
    existing: ExistingAssignment;
}

export type AssignmentAction =
    | { type: 'ADD'; slot: TimeSlot }
    | { type: 'REMOVE'; slotIndex: number }
    | { type: 'MODIFY_END'; slotIndex: number; newEnd: string }
    | { type: 'MODIFY_START'; slotIndex: number; newStart: string }
    | { type: 'CHECKOUT_INDIVIDUAL'; teamSlotIndex: number; employeeId: string; checkoutTime: string }
    | { type: 'REMOVE_TEAM'; teamId: string }
    | { type: 'REMOVE_MEMBER_FROM_TEAM'; teamSlotIndex: number; employeeId: string };

// ─── Core Functions ──────────────────────────────────────────────────────

/**
 * Find an existing assignment for an entity (employee or team) on a given day.
 * For employees, also checks if they are covered by a team assignment.
 */
export function findExistingAssignment(
    entityId: string,
    entityType: 'team' | 'employee',
    daySlots: TimeSlot[],
    teams: Record<string, Team>
): ExistingAssignment | null {

    // 1. Direct match (same id + same type)
    const directIndex = daySlots.findIndex(s =>
        s.assigned_id === entityId && s.assigned_type === entityType
    );
    if (directIndex >= 0) {
        return {
            slot: daySlots[directIndex],
            slotIndex: directIndex,
            source: entityType === 'team' ? 'team' : 'individual',
            teamId: entityType === 'team' ? entityId : undefined,
        };
    }

    // 2. For employees: check if they belong to an assigned team
    if (entityType === 'employee') {
        const memberTeam = Object.values(teams).find(t => t.memberIds.includes(entityId));
        if (memberTeam) {
            const teamSlotIndex = daySlots.findIndex(s =>
                s.assigned_id === memberTeam.id && s.assigned_type === 'team'
            );
            if (teamSlotIndex >= 0) {
                return {
                    slot: daySlots[teamSlotIndex],
                    slotIndex: teamSlotIndex,
                    source: 'team',
                    teamId: memberTeam.id,
                };
            }
        }
    }

    return null;
}

function d2ts(decimal: number): string {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function ts2d(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
}

export function computeAvailableActions(
    existing: ExistingAssignment,
    clickedHour: number
): AvailableActions {
    const clickedTime = d2ts(clickedHour);
    // Use decimal for precise comparison
    const existingStartDec = ts2d(existing.slot.start);
    const existingEndDec = ts2d(existing.slot.end);

    // Check for "Point" (Start=End)
    const hasCheckout = Math.abs(existingStartDec - existingEndDec) > 0.001;

    // Exact matches (using string comparison is safe now that clickedTime is formatted correctly)
    const isStartMatch = clickedTime === existing.slot.start;
    const isEndMatch = clickedTime === existing.slot.end;

    // Actions
    // Can check out if clicked after (or equal) start
    const canCheckOut = clickedHour >= existingStartDec;

    // Can check in (move start) if:
    // 1. Clicked before start
    // 2. Clicked between start and end
    // 3. Clicked after end (creating a new Gap? OR moving start forward).
    // User says: "si entre le check in et le check out les 2 choix"
    const canCheckIn = true; // Generally possible to move start, validation happens on apply

    // Toggle Off meaning:
    // If start clicked -> Remove entire slot
    // If end clicked (and has checkout) -> Remove checkout only
    const canToggleOff = isStartMatch || (isEndMatch && hasCheckout);

    return {
        canCheckOut,
        canCheckIn,
        canToggleOff,
        isExactMatch: isStartMatch || isEndMatch,
        existing
    };
}

/**
 * Apply an assignment action to produce a new array of TimeSlots.
 * All operations are IMMUTABLE (return new arrays).
 */
export function applyAssignment(
    daySlots: TimeSlot[],
    action: AssignmentAction,
    teams: Record<string, Team>
): TimeSlot[] {
    const slots = [...daySlots];

    switch (action.type) {
        case 'ADD':
            return [...slots, action.slot];

        case 'REMOVE':
            return slots.filter((_, i) => i !== action.slotIndex);

        case 'MODIFY_END':
            return slots.map((s, i) => i === action.slotIndex ? { ...s, end: action.newEnd } : s);

        case 'MODIFY_START':
            return slots.map((s, i) => i === action.slotIndex ? { ...s, start: action.newStart } : s);

        case 'CHECKOUT_INDIVIDUAL': {
            // Create a checkout-only marker for this employee.
            // KEY: start === end signals "checkout marker" - the check-in is inherited from the team.
            // This prevents rendering a separate filled dot at the team's start hour.
            const teamSlot = slots[action.teamSlotIndex];
            if (!teamSlot) return slots;

            // Remove any existing individual overrides for this employee
            const cleaned = slots.filter(s =>
                !(s.assigned_id === action.employeeId && s.assigned_type === 'employee')
            );

            // Checkout marker: start=end=checkoutTime (zero-duration = hollow dot only)
            cleaned.push({
                start: action.checkoutTime,
                end: action.checkoutTime,
                assigned_id: action.employeeId,
                assigned_type: 'employee',
                color: '#10b981', // Individual green
                is_checkout: true, // Flag for rendering as hollow
            });

            return cleaned;
        }


        case 'REMOVE_MEMBER_FROM_TEAM': {
            // "Explode" the team assignment into individual assignments for everyone EXCEPT the target member.
            const teamSlot = slots[action.teamSlotIndex];
            if (!teamSlot || !teamSlot.assigned_id) return slots;

            const teamId = teamSlot.assigned_id;
            const team = teams[teamId];
            if (!team) return slots;

            // 1. Remove the team slot
            const withoutTeam = slots.filter((_, i) => i !== action.teamSlotIndex);

            // 2. Add individual slots for all members EXCEPT the target
            const otherMembers = team.memberIds.filter(mid => mid !== action.employeeId);

            const newSlots = otherMembers.map(mid => ({
                ...teamSlot,
                assigned_id: mid,
                assigned_type: 'employee' as const,
                teamId: undefined, // No longer a strict team slot
                color: '#10b981', // Individual color (green) or keep team color? User usually expects green for indiv.
            }));

            return [...withoutTeam, ...newSlots];
        }

        case 'REMOVE_TEAM': {
            // Remove the team slot AND any individual overrides linked to it.
            // "Linked" = employee is a member of this team with a checkout marker (is_checkout=true).
            const teamSlot = slots.find(s => s.assigned_id === action.teamId && s.assigned_type === 'team');
            if (!teamSlot) {
                // Just remove the team slot if found
                return slots.filter(s => !(s.assigned_id === action.teamId && s.assigned_type === 'team'));
            }

            const team = teams[action.teamId];
            const memberIds = new Set(team?.memberIds || []);

            return slots.filter(s => {
                // Remove the team slot itself
                if (s.assigned_id === action.teamId && s.assigned_type === 'team') return false;

                // Remove individual checkout markers linked to this team
                if (
                    s.assigned_type === 'employee' &&
                    s.assigned_id &&
                    memberIds.has(s.assigned_id) &&
                    s.is_checkout === true // Checkout marker = linked to team
                ) {
                    return false;
                }

                // Keep everything else (independent individual assignments)
                return true;
            });
        }

        default:
            return slots;
    }
}

/**
 * When removing a team, clean orphaned individual overrides across ALL days.
 * Only removes overrides linked to the team's check-in on each day.
 * Preserves independent individual assignments.
 */
export function cleanOrphansOnTeamRemove(
    schedule: WeeklySchedule,
    teamId: string,
    teams: Record<string, Team>
): WeeklySchedule {
    const newSchedule = { ...schedule };
    const dayKeys = Object.keys(newSchedule) as (keyof WeeklySchedule)[];

    for (const dayKey of dayKeys) {
        const daySlots = newSchedule[dayKey];
        if (!daySlots || daySlots.length === 0) continue;

        newSchedule[dayKey] = applyAssignment(daySlots, { type: 'REMOVE_TEAM', teamId }, teams);
    }

    return newSchedule;
}

/**
 * Check if a specific entity can be toggled off (deselected) from a day.
 * Returns the slot index to remove, or -1 if not found.
 * 
 * Unlike processAssignmentChange (old code), this searches by assigned_id + type
 * regardless of start time, so deselection always works.
 */
export function findSlotToDeselect(
    daySlots: TimeSlot[],
    entityId: string,
    entityType: 'team' | 'employee'
): number {
    return daySlots.findIndex(s =>
        s.assigned_id === entityId && s.assigned_type === entityType
    );
}

/**
 * Check if a set of slots for one assignee on one day has an unpaired check-in
 * (i.e., missing check-out). Uses the "pair" semantic:
 * Dot 1 = check-in, Dot 2 = check-out, Dot 3 = check-in, etc.
 * An odd count means a check-out is missing.
 */
export function isMissingCheckout(
    daySlots: TimeSlot[],
    assigneeId: string,
    assigneeType: 'team' | 'employee'
): boolean {
    const count = daySlots.filter(s =>
        s.assigned_id === assigneeId && s.assigned_type === assigneeType
    ).length;
    return count > 0 && count % 2 !== 0;
}
