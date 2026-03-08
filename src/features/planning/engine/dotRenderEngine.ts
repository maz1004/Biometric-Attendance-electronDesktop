/**
 * dotRenderEngine.ts
 * 
 * Pure functions for computing visual dot types from TimeSlot data.
 * Separated from GenericWeekView to enable testing and reuse.
 */

import { TimeSlot } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────

export type DotVariant = 'filled' | 'hollow' | 'line' | null;

export interface DotRenderInfo {
    variant: DotVariant;
    /** True if this check-in has no matching check-out */
    isMissingCheckout: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

export function parseTime(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
}

// ─── Core Functions ──────────────────────────────────────────────────────

/**
 * Compute the dot variant for a schedule item at a specific slot.
 * 
 * - `filled` = check-in (start hour)
 * - `hollow` = check-out (end hour, only for multi-slot durations)
 * - `line` = continuation between check-in and check-out
 * - `null` = this item doesn't appear in this slot
 */
export function computeDotVariant(
    startTime: string,
    endTime: string,
    slotStart: number,
    timeSlotMode: 'day' | 'night',
    isCheckout?: boolean,
    slotDuration: number = 1 // Default to 1 hour
): DotVariant {
    let tStart = parseTime(startTime);
    let tEnd = parseTime(endTime);

    if (timeSlotMode === 'night') {
        if (tStart < 12) tStart += 24;
        if (tEnd < 12) tEnd += 24;
    }

    // Zero-duration marker (start === end):
    if (Math.abs(tStart - tEnd) < 0.001) {
        // Precise match with slotStart
        if (Math.abs(tStart - slotStart) < 0.001) {
            return isCheckout ? 'hollow' : 'filled';
        }
        return null;
    }

    const slotEnd = slotStart + slotDuration;

    // Check overlap
    // Standard overlap: Start < SlotEnd AND End >= SlotStart
    if (!(tStart < slotEnd && tEnd >= slotStart)) {
        return null; // Not in this slot at all
    }

    // Check-in: start falls within this slot
    if (tStart >= slotStart && tStart < slotEnd) {
        return 'filled';
    }

    // Check-out: end falls within this slot but after the start
    // Or exactly at the start of the slot (backward compatibility)
    if ((tEnd > slotStart && tEnd < slotEnd) || Math.abs(tEnd - slotStart) < 0.001) {
        return 'hollow';
    }

    // Also, if checkout is at the END of the previous slot...
    // But our grid renders dots AT the timestamp (slotStart).
    // If shift is 8:30 - 9:30.
    // 8:30 slot (8.5): Matches Start. Filled.
    // 9:00 slot (9.0): Matches Line.
    // 9:30 slot (9.5): Matches End. Hollow.

    return 'line';
}

/**
 * Determine if a specific assignee is missing a check-out on a day.
 * 
 * Convention: check-in markers are zero-duration (start===end).
 *             Checkout markers have is_checkout=true.
 *             Team with explicit checkout has start !== end (via MODIFY_END).
 * 
 * For TEAMS:
 *   - If the team slot has start !== end → checkout was explicitly assigned → NOT missing
 *   - If ALL team members have individual checkout markers (is_checkout=true) → NOT missing
 *   - Otherwise → still just a check-in point → missing
 * 
 * For EMPLOYEES:
 *   - Slots with is_checkout=true are checkout markers → NOT missing
 *   - Zero-duration without is_checkout = check-in only → missing
 */
export function computeCheckoutStatus(
    daySlots: TimeSlot[],
    assigneeId: string,
    assigneeType: 'team' | 'employee',
    teams?: Record<string, { memberIds: string[] }>
): boolean {
    const mySlots = daySlots.filter(s =>
        s.assigned_id === assigneeId && s.assigned_type === assigneeType
    );
    if (mySlots.length === 0) return false;

    if (assigneeType === 'team') {
        const teamSlot = mySlots[0];

        // If team slot has start !== end → checkout was explicitly set (MODIFY_END)
        if (teamSlot.start !== teamSlot.end) return false;

        // Check if ALL team members have individual checkout markers
        const team = teams?.[assigneeId];
        if (team && team.memberIds.length > 0) {
            const allMembersCovered = team.memberIds.every(memberId =>
                daySlots.some(s =>
                    s.assigned_type === 'employee' &&
                    s.assigned_id === memberId &&
                    s.is_checkout === true // Explicit checkout marker
                )
            );
            if (allMembersCovered) return false;
        }

        // Still just a check-in point → missing
        return true;
    }

    // EMPLOYEE: checkout markers are explicitly flagged
    if (mySlots.some(s => s.is_checkout)) return false;

    // Zero-duration without is_checkout = check-in only → missing
    if (mySlots.every(s => s.start === s.end)) return true;

    // Non-zero duration = has explicit checkout range
    return false;
}

/**
 * For a set of schedule items on a day, compute DotRenderInfo for each item at a slot.
 * Returns an array of render info matching the items array.
 */
export function computeSlotDots(
    items: Array<{ startTime: string; endTime: string; assigneeId?: string; assigneeType?: string }>,
    slotStart: number,
    timeSlotMode: 'day' | 'night',
    slotDuration: number = 1
): DotRenderInfo[] {
    return items.map(item => {
        const variant = computeDotVariant(item.startTime, item.endTime, slotStart, timeSlotMode, item.assigneeType === 'employee' ? false : undefined, slotDuration);
        return {
            variant,
            isMissingCheckout: false, // Caller sets this from computeCheckoutStatus
        };
    });
}
