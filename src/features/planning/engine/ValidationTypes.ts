/**
 * VALIDATION TYPES
 * Types for PlanningEngine validation results and error handling.
 */

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export type ValidationErrorCode =
    | 'CONFLICT_SAME_SLOT'      // Employee assigned to multiple teams on same slot
    | 'INVALID_CHECKIN_PAIR'    // Check-in without valid check-out
    | 'SHIFT_OUT_OF_CONFIG'     // Shift hours not covered by current configuration
    | 'DOUBLE_CHECKIN'          // Multiple check-ins without check-out
    | 'ORPHAN_CHECKOUT';        // Check-out without preceding check-in

export type ValidationWarningCode =
    | 'CROSS_DAY_SHIFT'         // Shift spans across midnight
    | 'UNCOVERED_HOURS'         // Some hours not covered by any config
    | 'SHIFT_DISABLED';         // Shift marked as disabled due to config change

export interface ValidationError {
    code: ValidationErrorCode;
    message: string;
    userMessage: string; // Human-readable message for modal display
    affectedAssignments: string[];
    details: Record<string, unknown>;
}

export interface ValidationWarning {
    code: ValidationWarningCode;
    message: string;
    userMessage: string;
    details: Record<string, unknown>;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

// ============================================================================
// CHECK-IN / CHECK-OUT PAIR VALIDATION
// ============================================================================

export interface AttendanceLog {
    id: string;
    timestamp: string;   // ISO timestamp
    type: 'IN' | 'OUT';
    userId: string;
    deviceId?: string;
}

export interface CheckInPair {
    checkIn: AttendanceLog;
    checkOut?: AttendanceLog;
    isValid: boolean;
    isCrossDay: boolean;   // Check-in and check-out on different days
    error?: string;
    duration?: number;     // Duration in minutes
}

export interface CheckInPairValidationResult {
    pairs: CheckInPair[];
    orphanCheckIns: AttendanceLog[];   // Check-ins without corresponding check-out
    orphanCheckOuts: AttendanceLog[];  // Check-outs without preceding check-in
    isValid: boolean;
}

// ============================================================================
// SHIFT CONFIGURATION VALIDATION
// ============================================================================

export interface TimeRange {
    start: string;  // HH:mm
    end: string;    // HH:mm
}

export interface ShiftConfigValidation {
    shiftId: string;
    shiftName: string;
    isCompatible: boolean;
    isDisabled: boolean;
    uncoveredSlots: TimeRange[];
    recommendation: string;  // User-friendly suggestion
}

export interface ConfigChangeImpact {
    affectedShifts: ShiftConfigValidation[];
    requiresUserAction: boolean;
    summary: string;
}

// ============================================================================
// ASSIGNMENT CONFLICT DETECTION
// ============================================================================

export interface SlotConflict {
    date: string;           // YYYY-MM-DD
    slotStart: string;      // HH:mm
    slotEnd: string;        // HH:mm
    userId: string;
    userName: string;
    conflictingAssignments: Array<{
        shiftId: string;
        shiftName: string;
        teamId: string;
        teamName?: string;
    }>;
}

export interface ConflictDetectionResult {
    hasConflicts: boolean;
    conflicts: SlotConflict[];
    summary: string;
}

// ============================================================================
// COMPUTED SCHEDULE RESULT (ENHANCED)
// ============================================================================

export interface ComputeScheduleResult {
    schedule: import('../types').ComputedSchedule[];
    validation: ValidationResult;
    disabledShifts: ShiftConfigValidation[];
    conflicts: ConflictDetectionResult;
}
