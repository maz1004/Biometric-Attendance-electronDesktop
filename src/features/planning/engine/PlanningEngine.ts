import { format } from "date-fns";
import {
    Shift,
    UserShift,
    ComputedSchedule,
    EmployeeMini,
    Team,
    WeeklySchedule,
    ShiftException as PlanningException
} from "../types";
import { CompanySettings } from "../../../services/settings";
import {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    AttendanceLog,
    CheckInPair,
    CheckInPairValidationResult,
    TimeRange,
    ShiftConfigValidation,
    SlotConflict,
    ConflictDetectionResult,
    ComputeScheduleResult
} from "./ValidationTypes";

/**
 * PLANNING ENGINE
 * Pure logic for determining who works when.
 */

export interface ScheduleOptions {
    weekDates: Date[]; // The 7 days of the view
    selectedTeamIds?: string[]; // Filter
    exceptions?: PlanningException[]; // Global/Team/User Exceptions
    debugContext?: string; // Caller Identifier
    settings?: CompanySettings; // Global Settings for Day/Night definitions
}

/**
 * Computes the final schedule by merging Templates, Assignments, and Exceptions.
 * 
 * Logic Flow:
 * 1. Identify Valid Assignments (Active, In-Week).
 * 2. Resolve Template for each.
 * 3. CHECK EXCEPTIONS (Override/Block) with Priority.
 * 4. Expand Template Slots (Multi-slot support).
 */
// 0. Helpers for Pure Logic (moved from Components)
export function getWeekDates(weekKey: string): Date[] {
    const d = new Date(weekKey);
    // If invalid (e.g. empty), default to current week
    const start = isNaN(d.getTime()) ? new Date() : d;
    // Align to Monday
    // const day = start.getDay(); 
    // const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    // Actually date-fns startOfWeek is safer.
    // If weekKey is YYYY-MM-DD (Monday), use it.
    // But let's assume valid date.
    const weekStart = new Date(start);
    // Ensure it's the start of the week? 
    // Usually weekKey is passed as the Monday date.
    // Let's generate 7 days.
    return Array.from({ length: 7 }).map((_, i) => {
        const temp = new Date(weekStart);
        temp.setDate(weekStart.getDate() + i);
        return temp;
    });
}

export function filterTeams(teams: Record<string, Team>, selectedIds: string[]): Team[] {
    const all = Object.values(teams);
    const globalTeam: Team = {
        id: "GLOBAL",
        name: "Global / Sans Équipe",
        department: "Général",
        memberIds: [],
        color: "#94a3b8"
    };
    const withGlobal = [globalTeam, ...all];

    if (!selectedIds || selectedIds.length === 0) return withGlobal;
    return withGlobal.filter(t => selectedIds.includes(t.id));
}

// ============================================================================
// COLOR STANDARDIZATION
// ============================================================================

/**
 * Reserved colors that cannot be used for regular shifts:
 * - Red (#ef4444): Exceptions (Leave/Sick)
 * - Yellow (#f59e0b): Holidays
 */
export const RESERVED_COLORS = {
    EXCEPTION: '#ef4444',
    HOLIDAY: '#f59e0b',
    INDEPENDENT: '#10b981'
};

/**
 * Resolves the display color based on standardized rules:
 * Priority:
 * 1. Exception (Leave/Sick) → Red
 * 2. Holiday → Yellow
 * 3. Independent Employee (no team) → Green
 * 4. Shift custom color (if valid)
 * 5. Default Blue
 */
export function resolveShiftColor(
    source: 'RULE' | 'EXCEPTION',
    exceptionType?: string,
    shiftColor?: string,
    isIndependent?: boolean
): string {
    // Priority 1: Exceptions
    if (source === 'EXCEPTION') {
        if (exceptionType === 'HOLIDAY') return RESERVED_COLORS.HOLIDAY;
        return RESERVED_COLORS.EXCEPTION; // Leave, Sick, etc.
    }

    // Priority 2: Independent employees
    if (isIndependent) return RESERVED_COLORS.INDEPENDENT;

    // Priority 3: Shift custom color (if not reserved)
    if (shiftColor &&
        shiftColor !== RESERVED_COLORS.EXCEPTION &&
        shiftColor !== RESERVED_COLORS.HOLIDAY) {
        return shiftColor;
    }

    // Default: Blue
    return '#3b82f6';
}

/**
 * Validates if a color can be used for a shift
 * Returns error message if invalid, null if valid
 */
export function validateShiftColor(color: string, existingShiftColors: string[]): string | null {
    if (color === RESERVED_COLORS.EXCEPTION) {
        return 'Rouge est réservé aux exceptions (congé/maladie)';
    }
    if (color === RESERVED_COLORS.HOLIDAY) {
        return 'Jaune est réservé aux jours fériés';
    }
    if (existingShiftColors.includes(color)) {
        return 'Cette couleur est déjà utilisée par un autre shift';
    }
    return null; // Valid
}

/**
 * INTERNAL: Core schedule computation logic
 * Use computeSchedule() for public API with validation support
 */
function _computeScheduleCore(
    shifts: Record<string, Shift>,
    userShifts: UserShift[],
    employees: Record<string, EmployeeMini>,
    _teams: Record<string, Team>,
    options: ScheduleOptions
): ComputedSchedule[] {
    const { weekDates, selectedTeamIds, exceptions = [] } = options;
    const result: ComputedSchedule[] = [];

    // 0. Pre-calc helpers
    // Conflict Map: Day -> UserId -> Count
    const dayUserCounts: Record<string, Record<string, number>> = {};

    // Helper to check collision with Priority: USER > TEAM
    const getApplicableException = (dateStr: string, userId: string, teamId: string) => {
        // 1. User Specific (Leave, Sick)
        const userEx = exceptions.find(ex => ex.start_date.startsWith(dateStr) && ex.user_id === userId);
        if (userEx) return userEx;

        // 2. Team Specific
        const teamEx = exceptions.find(ex => ex.start_date.startsWith(dateStr) && ex.team_id === teamId);
        if (teamEx) return teamEx;

        return undefined;
    };

    // 1. Filter Assignments for this Week View
    // Note: Deduplication removed as backend returns same ID for multi-day schedules which is valid

    // 1. Filter Assignments for this Week View
    // Deduplicate by ID + Date to prevent React Key collisions if backend/state sends duplicates
    const uniqueAssignmentsMap = new Map<string, UserShift>();
    userShifts.forEach(us => {
        // Normalize date to ensure string match
        const d = new Date(us.assignedAt);
        if (isNaN(d.getTime())) return;
        const dateStr = format(d, "yyyy-MM-dd");

        // Key: Rule allows same ID on different days, but NOT same ID on same day
        const uniqueKey = `${us.id}_${dateStr}`;
        uniqueAssignmentsMap.set(uniqueKey, us);
    });

    Array.from(uniqueAssignmentsMap.values()).forEach(us => {
        if (!us.isActive) return;

        // Check if assignment falls within the visible week dates
        const d = new Date(us.assignedAt);
        const dateStr = format(d, "yyyy-MM-dd");

        const isInWeek = weekDates.some(wd => format(wd, "yyyy-MM-dd") === dateStr);
        if (!isInWeek) return;

        // Resolving Template
        let template = shifts[us.shiftId];
        if (!template && us.shiftId) {
            const cleanId = us.shiftId.trim();
            template = shifts[cleanId];
        }

        if (!template) {
            // Check if we have fallback data from the assignment itself (added in recent backend update)
            if (us.shiftName) {
                // Create a synthetic template for display purposes
                template = {
                    id: us.shiftId,
                    name: us.shiftName,
                    color: "#94a3b8", // Default Grey for unknown templates
                    schedule_data: {}, // Empty schedule data
                } as any; // Cast as Shift
            } else {
                // Log with Context
                const contextPrefix = options.debugContext ? `[${options.debugContext}]` : '';
                console.warn(`[PlanningEngine]${contextPrefix} Missing Template for Assignment ${us.id} (ShiftID: ${us.shiftId})`);

                const debugKey = 'debug_logged_' + us.shiftId + '_' + dateStr;
                if (!dayUserCounts[debugKey]) {
                    // (Keep existing debug log logic if desired, or simplify)
                    // @ts-ignore
                    dayUserCounts[debugKey] = 1;
                }
                return; // Skip ONLY if no fallback name available
            }
        }

        // WeekKey Validation (Strict Mode)
        // if (us.weekKey && template.weekKey && us.weekKey !== template.weekKey) return;

        // Team Fallback
        const effectiveTeamId = us.teamId || template.teamIds?.[0] || "unassigned";

        // Team Filter - INCLUDE independents (GLOBAL/unassigned)
        if (selectedTeamIds && selectedTeamIds.length > 0) {
            const isIndependent = effectiveTeamId === 'unassigned' || effectiveTeamId === 'GLOBAL';
            if (!isIndependent && !selectedTeamIds.includes(effectiveTeamId)) return;
        }

        // CHECK EXCEPTIONS priority
        const exception = getApplicableException(dateStr, us.userId, effectiveTeamId);

        // Determine Slots - PRIORITY:
        // 1. Direct startTime/endTime from assignment (stored in backend)
        // 2. Template schedule_data for the day
        // 3. Fallback to any day's slots
        // 4. Ultimate fallback to settings defaults
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = days[d.getDay()] as keyof WeeklySchedule;

        let slots: { start: string; end: string; color?: string }[] = [];

        // PRIORITY 1: Use direct times from assignment if available
        if (us.startTime && us.endTime) {
            slots = [{ start: us.startTime, end: us.endTime, color: template.color }];
        } else {
            // PRIORITY 2: Template slots for the specific day
            slots = template.schedule_data?.[dayName] || [];
        }

        // Fallback: If explicit day has no slots (e.g. assigning a "Monday" template to "Tuesday"),
        // try to find ANY defined slots in the template to ensure visibility.
        if (slots.length === 0) {
            const allDays = Object.values(template.schedule_data || {});
            const firstValidDay = allDays.find(s => s && s.length > 0);
            if (firstValidDay) {
                slots = firstValidDay;
            } else {
                // Ultimate Fallback: Template has NO slots at all (e.g. Auto-Created empty shift)
                const s = options.settings;
                const dayStart = s?.planning_day_start || "08:00";
                const dayEnd = s?.planning_day_end || "16:00";
                const nightStart = s?.planning_night_start || "21:00";
                const nightEnd = s?.planning_night_end || "05:00";

                // Smart Heuristic: Check name for "Nuit"
                const isNight = template.name?.toLowerCase().includes("nuit");
                if (isNight) {
                    slots = [{ start: nightStart, end: nightEnd, color: template.color || "#6366f1" }];
                } else {
                    slots = [{ start: dayStart, end: dayEnd, color: template.color || "#3b82f6" }];
                }
            }
        }

        // If blocked by exception, clear slots or mark as blocked
        let source: 'RULE' | 'EXCEPTION' = 'RULE';
        let shiftName = template.name;

        if (exception) {
            source = 'EXCEPTION';
            // Simple mapping for now
            if (exception.type === 'LEAVE' || exception.type === 'SICK') {
                shiftName = exception.type === 'LEAVE' ? "Congé" : "Maladie";
                slots = [{ start: "08:00", end: "18:00" }];
            }
        }

        // If no slots exist (e.g. day off in template), we skip unless it's an exception (blocked)
        if (slots.length === 0 && !exception) return;

        // Generate Output Items (Multi-Slot Support)
        slots.forEach((slot, index) => {
            // Track Conflict
            if (!dayUserCounts[dateStr]) dayUserCounts[dateStr] = {};
            if (!dayUserCounts[dateStr][us.userId]) dayUserCounts[dateStr][us.userId] = 0;
            dayUserCounts[dateStr][us.userId]++;

            result.push({
                // Generate UNIQUE ID combining assignment ID + Date + Slot Index 
                // to handle backend multi-day assignment ID reuse
                id: `${us.id}-${dateStr}-${index}`,
                date: dateStr,
                teamId: effectiveTeamId,
                shiftId: us.shiftId,
                shiftName: shiftName,
                startTime: slot.start,
                endTime: slot.end,
                source,
                color: resolveShiftColor(
                    source,
                    exception?.type,
                    template.color,
                    !us.teamId || us.teamId === 'GLOBAL' || us.teamId === 'unassigned'
                ),
                assigneeId: us.userId,
                assigneeName: employees[us.userId]?.name || us.userName || (() => {
                    console.warn(`[PlanningEngine] Unknown Employee ID: ${us.userId} (Type: ${typeof us.userId}). Available Keys: ${Object.keys(employees).length}`);
                    return "Unknown";
                })(),
                hasConflict: false // Computed later
            });

        });
    });

    // 2. Mark Conflicts
    result.forEach(item => {
        if (dayUserCounts[item.date]?.[item.assigneeId || ""] > 1) {
            item.hasConflict = true;
        }
    });

    return result;
}

/**
 * CONTINUITY LOGIC
 * Helps replicate a schedule from one week to another.
 */

export interface CloneResult {
    newShifts: Partial<Shift>[]; // Payload to create new shifts
    newUserShifts: any[]; // Payload to create new assignments (TODO: Type properly)
}

/**
 * Generates the creation payloads needed to clone a source week's schedule to a target week.
 * 
 * @param sourceShifts List of shifts in the source week
 * @param sourceAssignments List of assignments in the source week
 * @param targetWeekKey The unique key for the target week (e.g. "2026-01-19")
 */
export function generateCloneCommands(
    sourceShifts: Shift[],
    sourceAssignments: UserShift[],
    targetWeekKey: string
): CloneResult {
    const newShifts: Partial<Shift>[] = [];
    const newUserShifts: any[] = [];

    // Map old Shift ID -> New Placeholder ID (to link assignments)

    const oldToTempId: Record<string, string> = {};

    sourceShifts.forEach(s => {
        // strict "1 Shift = 1 Week" means we MUST create a new Shift object for the target week.
        // We clone properties but set the new WeekKey.
        // We generate a temp ID to link assignments internally before saving
        const tempId = `temp_${Math.random().toString(36).substr(2, 9)}`;
        oldToTempId[s.id] = tempId;

        newShifts.push({
            // We don't set ID, backend will (or we send tempId if processed sequentially)
            // Ideally backend handles cloning, but if frontend does it:
            name: s.name,
            description: s.description,
            teamIds: s.teamIds, // Preserve team association
            color: s.color,
            maxMembers: s.maxMembers,
            schedule_data: s.schedule_data, // Copy the hourly slots
            weekKey: targetWeekKey,
            // Helper for correlation if needed
            // _tempId: tempId 
        });
    });

    sourceAssignments.forEach(ua => {
        // If we are cloning assignments too
        if (!ua.isActive) return;

        // Check if the shift they were on is being cloned
        // If the assignment was on a shift NOT in sourceShifts (shouldn't happen if data consistent), skip
        if (!oldToTempId[ua.shiftId]) return;

        // We need to associate this assignment with the NEW shift.
        // We also need to know WHICH DAY it was, to calculate the new date.
        const originalDate = new Date(ua.assignedAt);
        // Assuming Moday=0 or Sunday=0?
        // date-fns getDay(): Sunday=0, Monday=1
        // We'll store the getDay() value.
        const dayIndex = originalDate.getDay();

        newUserShifts.push({
            userId: ua.userId,
            _tempShiftIdLink: oldToTempId[ua.shiftId],
            teamId: ua.teamId,
            dayIndex: dayIndex
        });
    });

    return { newShifts, newUserShifts };
}

// ============================================================================
// RÈGLE 1: DÉTECTION DES CONFLITS D'ASSIGNATION
// Un employé ne peut pas être assigné à plus d'une team sur le même créneau
// ============================================================================

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
}

/**
 * Check if two time ranges overlap
 */
function doTimesOverlap(
    start1: string, end1: string,
    start2: string, end2: string,
    allowCrossDay: boolean = true
): boolean {
    const s1 = parseTimeToMinutes(start1);
    const e1 = parseTimeToMinutes(end1);
    const s2 = parseTimeToMinutes(start2);
    const e2 = parseTimeToMinutes(end2);

    // Handle cross-day shifts (end < start means it crosses midnight)
    const isCrossDay1 = e1 < s1;
    const isCrossDay2 = e2 < s2;

    if (isCrossDay1 || isCrossDay2) {
        if (!allowCrossDay) return false;
        // For cross-day, we need special handling
        // Shift 1: 22:00-06:00 is actually 22:00-24:00 + 00:00-06:00
        // For simplicity, we consider any overlap in a 24h window
        if (isCrossDay1 && isCrossDay2) {
            return true; // Both cross midnight, they overlap
        }
        if (isCrossDay1) {
            // s1=22:00, e1=06:00 -> overlaps with s2,e2 if s2 >= 22:00 OR e2 <= 06:00
            return s2 >= s1 || e2 <= e1 || s2 <= e1;
        }
        if (isCrossDay2) {
            return s1 >= s2 || e1 <= e2 || s1 <= e2;
        }
    }

    // Standard overlap check for same-day shifts
    return s1 < e2 && s2 < e1;
}

/**
 * Validates that no employee is assigned to multiple teams on the same time slot
 * Returns conflicts and a summary for UI display
 */
export function detectAssignmentConflicts(
    userShifts: UserShift[],
    shifts: Record<string, Shift>,
    employees: Record<string, EmployeeMini>,
    teams: Record<string, Team>
): ConflictDetectionResult {
    const conflicts: SlotConflict[] = [];

    // Group assignments by userId and date
    const userDateAssignments: Record<string, Array<{
        userShift: UserShift;
        shift: Shift;
        slots: Array<{ start: string; end: string }>;
    }>> = {};

    userShifts.forEach(us => {
        if (!us.isActive) return;

        const shift = shifts[us.shiftId];
        if (!shift) return;

        const d = new Date(us.assignedAt);
        if (isNaN(d.getTime())) return;

        const dateStr = format(d, "yyyy-MM-dd");
        const key = `${us.userId}_${dateStr}`;

        // Get slots for this day
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = days[d.getDay()] as keyof WeeklySchedule;
        const slots = shift.schedule_data?.[dayName] || [];

        if (!userDateAssignments[key]) {
            userDateAssignments[key] = [];
        }

        userDateAssignments[key].push({
            userShift: us,
            shift,
            slots: slots.map(s => ({ start: s.start, end: s.end }))
        });
    });

    // Check for overlaps within each user+date group
    Object.entries(userDateAssignments).forEach(([key, assignments]) => {
        if (assignments.length < 2) return; // No conflict possible

        const [userId, dateStr] = key.split("_");

        // Compare each pair of assignments
        for (let i = 0; i < assignments.length; i++) {
            for (let j = i + 1; j < assignments.length; j++) {
                const a1 = assignments[i];
                const a2 = assignments[j];

                // Check if any slots overlap
                for (const slot1 of a1.slots) {
                    for (const slot2 of a2.slots) {
                        if (doTimesOverlap(slot1.start, slot1.end, slot2.start, slot2.end)) {
                            // Conflict detected!
                            const employee = employees[userId];

                            conflicts.push({
                                date: dateStr,
                                slotStart: slot1.start,
                                slotEnd: slot1.end,
                                userId: userId,
                                userName: employee?.name || "Employé inconnu",
                                conflictingAssignments: [
                                    {
                                        shiftId: a1.shift.id,
                                        shiftName: a1.shift.name,
                                        teamId: a1.userShift.teamId || "unassigned",
                                        teamName: teams[a1.userShift.teamId || ""]?.name
                                    },
                                    {
                                        shiftId: a2.shift.id,
                                        shiftName: a2.shift.name,
                                        teamId: a2.userShift.teamId || "unassigned",
                                        teamName: teams[a2.userShift.teamId || ""]?.name
                                    }
                                ]
                            });
                        }
                    }
                }
            }
        }
    });

    const hasConflicts = conflicts.length > 0;
    const summary = hasConflicts
        ? `${conflicts.length} conflit(s) détecté(s). Un employé ne peut pas être assigné à plusieurs équipes sur le même créneau.`
        : "Aucun conflit d'assignation détecté.";

    return { hasConflicts, conflicts, summary };
}

/**
 * Validates a single assignment before creation
 * Returns true if assignment can be created, false with error details otherwise
 */
export function validateAssignmentBeforeCreate(
    newAssignment: { userId: string; shiftId: string; teamId?: string; assignedAt: string },
    existingUserShifts: UserShift[],
    shifts: Record<string, Shift>
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const shift = shifts[newAssignment.shiftId];
    if (!shift) {
        errors.push({
            code: 'CONFLICT_SAME_SLOT',
            message: 'Shift not found',
            userMessage: 'Le shift sélectionné n\'existe pas.',
            affectedAssignments: [],
            details: { shiftId: newAssignment.shiftId }
        });
        return { isValid: false, errors, warnings };
    }

    const d = new Date(newAssignment.assignedAt);
    const dateStr = format(d, "yyyy-MM-dd");
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = days[d.getDay()] as keyof WeeklySchedule;
    const newSlots = shift.schedule_data?.[dayName] || [];

    // Find existing assignments for this user on this date
    const existingOnSameDay = existingUserShifts.filter(us => {
        if (!us.isActive || us.userId !== newAssignment.userId) return false;
        const usDate = new Date(us.assignedAt);
        return format(usDate, "yyyy-MM-dd") === dateStr;
    });

    for (const existing of existingOnSameDay) {
        const existingShift = shifts[existing.shiftId];
        if (!existingShift) continue;

        const existingSlots = existingShift.schedule_data?.[dayName] || [];

        for (const newSlot of newSlots) {
            for (const existingSlot of existingSlots) {
                if (doTimesOverlap(newSlot.start, newSlot.end, existingSlot.start, existingSlot.end)) {
                    errors.push({
                        code: 'CONFLICT_SAME_SLOT',
                        message: `Conflict with existing assignment ${existing.id}`,
                        userMessage: `Cet employé est déjà assigné sur le créneau ${existingSlot.start}-${existingSlot.end} (${existingShift.name}). Impossible d'assigner deux équipes sur le même horaire.`,
                        affectedAssignments: [existing.id],
                        details: {
                            existingShiftId: existing.shiftId,
                            existingShiftName: existingShift.name,
                            conflictingSlot: `${existingSlot.start}-${existingSlot.end}`
                        }
                    });
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

// ============================================================================
// RÈGLE 2: VALIDATION CHECK-IN / CHECK-OUT
// Support multi-pointages par jour, détection paires invalides
// ============================================================================

/**
 * Validates check-in/check-out pairs for a user on a given day
 * Detects:
 * - Double check-ins without check-out
 * - Orphan check-outs
 * - Valid pairs (even cross-day)
 */
export function validateCheckInPairs(logs: AttendanceLog[]): CheckInPairValidationResult {
    // Sort by timestamp
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const pairs: CheckInPair[] = [];
    const orphanCheckIns: AttendanceLog[] = [];
    const orphanCheckOuts: AttendanceLog[] = [];

    let pendingCheckIn: AttendanceLog | null = null;

    for (const log of sortedLogs) {
        if (log.type === 'IN') {
            if (pendingCheckIn) {
                // Double check-in detected!
                orphanCheckIns.push(pendingCheckIn);
            }
            pendingCheckIn = log;
        } else if (log.type === 'OUT') {
            if (pendingCheckIn) {
                // Valid pair found
                const checkInTime = new Date(pendingCheckIn.timestamp);
                const checkOutTime = new Date(log.timestamp);
                const isCrossDay = checkInTime.toDateString() !== checkOutTime.toDateString();
                const durationMs = checkOutTime.getTime() - checkInTime.getTime();
                const durationMinutes = Math.round(durationMs / 60000);

                pairs.push({
                    checkIn: pendingCheckIn,
                    checkOut: log,
                    isValid: durationMinutes > 0, // Check-out must be after check-in
                    isCrossDay,
                    duration: durationMinutes,
                    error: durationMinutes <= 0 ? "Check-out avant check-in" : undefined
                });
                pendingCheckIn = null;
            } else {
                // Orphan check-out
                orphanCheckOuts.push(log);
            }
        }
    }

    // If there's still a pending check-in, it's orphan
    if (pendingCheckIn) {
        orphanCheckIns.push(pendingCheckIn);
    }

    const isValid = orphanCheckIns.length === 0 &&
        orphanCheckOuts.length === 0 &&
        pairs.every(p => p.isValid);

    return { pairs, orphanCheckIns, orphanCheckOuts, isValid };
}

// ============================================================================
// RÈGLE 3: SHIFTS CROSS-DAY (Traversant Minuit)
// ============================================================================

/**
 * Detects if a shift crosses midnight (e.g., 22:00 - 06:00)
 */
export function isCrossDayShift(startTime: string, endTime: string): boolean {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    return endMinutes < startMinutes;
}

/**
 * Validates that cross-day shifts are handled correctly
 * Returns warning if shift is cross-day (for user awareness, not error)
 */
export function validateCrossDayShift(
    shift: Shift
): ValidationWarning | null {
    const schedule = shift.schedule_data;
    if (!schedule) return null;

    const crossDaySlots: Array<{ day: string; start: string; end: string }> = [];

    const days: (keyof WeeklySchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
        const slots = schedule[day] || [];
        for (const slot of slots) {
            if (isCrossDayShift(slot.start, slot.end)) {
                crossDaySlots.push({ day, start: slot.start, end: slot.end });
            }
        }
    }

    if (crossDaySlots.length > 0) {
        return {
            code: 'CROSS_DAY_SHIFT',
            message: `Shift "${shift.name}" contains cross-day slots`,
            userMessage: `Le shift "${shift.name}" contient des créneaux traversant minuit (ex: ${crossDaySlots[0].start} - ${crossDaySlots[0].end}). Ces horaires sont valides et seront correctement gérés.`,
            details: { crossDaySlots }
        };
    }

    return null;
}

// ============================================================================
// RÈGLE 4: CHANGEMENT DE CONFIGURATION HORAIRES
// Détection et marquage des shifts hors config
// ============================================================================

/**
 * Checks if a time range is covered by day OR night configuration
 */
function isSlotCoveredByConfig(
    slotStart: string,
    slotEnd: string,
    settings: CompanySettings
): { isCovered: boolean; uncoveredRange?: TimeRange } {
    const dayStart = settings.planning_day_start || "08:00";
    const dayEnd = settings.planning_day_end || "16:00";
    const nightStart = settings.planning_night_start || "21:00";
    const nightEnd = settings.planning_night_end || "05:00";

    const slotS = parseTimeToMinutes(slotStart);
    const slotE = parseTimeToMinutes(slotEnd);
    const isCrossDay = slotE < slotS;

    // Check if slot falls within day range
    const dayS = parseTimeToMinutes(dayStart);
    const dayE = parseTimeToMinutes(dayEnd);
    const inDayRange = slotS >= dayS && slotE <= dayE && !isCrossDay;

    // Check if slot falls within night range (handles cross-midnight)
    const nightS = parseTimeToMinutes(nightStart);
    const nightE = parseTimeToMinutes(nightEnd);

    // Night range typically crosses midnight (e.g., 21:00 - 05:00)
    let inNightRange = false;
    if (isCrossDay) {
        // Slot crosses midnight - check against night config
        // Slot 22:00-06:00 should be covered by night 21:00-05:00? Depends on overlap
        inNightRange = slotS >= nightS || slotE <= nightE;
    } else {
        // Normal slot - check if it's in the night evening portion (before midnight)
        // or morning portion (after midnight)
        if (slotS >= nightS) {
            inNightRange = true; // Evening portion
        } else if (slotE <= nightE) {
            inNightRange = true; // Morning portion
        }
    }

    const isCovered = inDayRange || inNightRange;

    if (!isCovered) {
        return {
            isCovered: false,
            uncoveredRange: { start: slotStart, end: slotEnd }
        };
    }

    return { isCovered: true };
}

/**
 * Validates a shift against current configuration
 * Returns details about compatibility and recommendations
 */
export function validateShiftAgainstConfig(
    shift: Shift,
    settings: CompanySettings
): ShiftConfigValidation {
    const uncoveredSlots: TimeRange[] = [];
    const schedule = shift.schedule_data;

    if (schedule) {
        const days: (keyof WeeklySchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        for (const day of days) {
            const slots = schedule[day] || [];
            for (const slot of slots) {
                const result = isSlotCoveredByConfig(slot.start, slot.end, settings);
                if (!result.isCovered && result.uncoveredRange) {
                    // Avoid duplicates
                    const exists = uncoveredSlots.some(
                        s => s.start === result.uncoveredRange!.start && s.end === result.uncoveredRange!.end
                    );
                    if (!exists) {
                        uncoveredSlots.push(result.uncoveredRange);
                    }
                }
            }
        }
    }

    const isCompatible = uncoveredSlots.length === 0;
    let recommendation = "";

    if (!isCompatible) {
        const slotList = uncoveredSlots.map(s => `${s.start}-${s.end}`).join(", ");
        recommendation = `Le shift "${shift.name}" contient des horaires (${slotList}) qui ne sont plus couverts par la configuration actuelle. Veuillez modifier ou recréer ce shift.`;
    }

    return {
        shiftId: shift.id,
        shiftName: shift.name,
        isCompatible,
        isDisabled: !isCompatible,
        uncoveredSlots,
        recommendation
    };
}

/**
 * Validates all shifts against configuration and returns impacted ones
 */
export function detectConfigurationImpact(
    shifts: Record<string, Shift>,
    settings: CompanySettings
): ShiftConfigValidation[] {
    const results: ShiftConfigValidation[] = [];

    Object.values(shifts).forEach(shift => {
        const validation = validateShiftAgainstConfig(shift, settings);
        if (!validation.isCompatible) {
            results.push(validation);
        }
    });

    return results;
}

// ============================================================================
// ENHANCED COMPUTE SCHEDULE WITH VALIDATION
// ============================================================================

/**
 * Enhanced version of computeSchedule that includes all validation
 */
export function computeScheduleWithValidation(
    shifts: Record<string, Shift>,
    userShifts: UserShift[],
    employees: Record<string, EmployeeMini>,
    teams: Record<string, Team>,
    options: ScheduleOptions
): ComputeScheduleResult {
    // 1. Compute the base schedule using internal core function
    const schedule = _computeScheduleCore(shifts, userShifts, employees, teams, options);

    // 2. Detect assignment conflicts
    const conflicts = detectAssignmentConflicts(userShifts, shifts, employees, teams);

    // 3. Validate shifts against current config
    const disabledShifts = options.settings
        ? detectConfigurationImpact(shifts, options.settings)
        : [];

    // 4. Compile validation result
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Add conflict errors
    if (conflicts.hasConflicts) {
        conflicts.conflicts.forEach(c => {
            errors.push({
                code: 'CONFLICT_SAME_SLOT',
                message: `Conflict for ${c.userName} on ${c.date}`,
                userMessage: `${c.userName} est assigné(e) à plusieurs équipes sur le créneau ${c.slotStart}-${c.slotEnd} le ${c.date}.`,
                affectedAssignments: c.conflictingAssignments.map(a => a.shiftId),
                details: { conflict: c }
            });
        });
    }

    // Add config mismatch warnings
    disabledShifts.forEach(ds => {
        warnings.push({
            code: 'SHIFT_DISABLED',
            message: `Shift ${ds.shiftName} is out of configuration`,
            userMessage: ds.recommendation,
            details: { shiftId: ds.shiftId, uncoveredSlots: ds.uncoveredSlots }
        });
    });

    // Check for cross-day shifts (informational warning)
    Object.values(shifts).forEach(shift => {
        const crossDayWarning = validateCrossDayShift(shift);
        if (crossDayWarning) {
            warnings.push(crossDayWarning);
        }
    });

    // Mark schedule items with conflicts
    schedule.forEach((item: ComputedSchedule) => {
        const hasConflict = conflicts.conflicts.some(
            c => c.userId === item.assigneeId && c.date === item.date
        );
        if (hasConflict) {
            item.hasConflict = true;
        }
    });

    return {
        schedule,
        validation: {
            isValid: errors.length === 0,
            errors,
            warnings
        },
        disabledShifts,
        conflicts
    };
}

/**
 * PUBLIC API: Computes schedule with validation
 * Returns the schedule array directly for backward compatibility
 * Also performs all validations (conflicts, config mismatch) and logs warnings
 */
export function computeSchedule(
    shifts: Record<string, Shift>,
    userShifts: UserShift[],
    employees: Record<string, EmployeeMini>,
    teams: Record<string, Team>,
    options: ScheduleOptions
): ComputedSchedule[] {
    const result = computeScheduleWithValidation(shifts, userShifts, employees, teams, options);

    // Log validation warnings/errors for debugging
    if (!result.validation.isValid) {
        console.warn('[PlanningEngine] Validation errors detected:', result.validation.errors.map(e => e.userMessage));
    }
    if (result.validation.warnings.length > 0) {
        console.info('[PlanningEngine] Validation warnings:', result.validation.warnings.map(w => w.userMessage));
    }
    if (result.disabledShifts.length > 0) {
        console.warn('[PlanningEngine] Disabled shifts due to config mismatch:', result.disabledShifts.map(s => s.shiftName));
    }

    return result.schedule;
}

// Re-export types for convenience
export type {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    AttendanceLog,
    CheckInPair,
    CheckInPairValidationResult,
    ShiftConfigValidation,
    SlotConflict,
    ConflictDetectionResult,
    ComputeScheduleResult
};
