export type WeekKey = string; // e.g. "2025-11-03" (Monday ISO)
export type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon..Sun

export interface EmployeeMini {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string;   // HH:MM
  assigned_id?: string; // UUID of Team or Employee
  assigned_type?: 'team' | 'employee';
  color?: string;
  is_checkout?: boolean; // True for checkout-only markers (zero-duration, rendered as hollow)
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  description?: string;
  schedule_data: WeeklySchedule;
  color?: string; // Template color for display
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  description?: string;
  schedule_data?: WeeklySchedule; // Made optional as it might come from template
  template_id?: string; // Link to template
  color?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
  weekKey?: string;
  teamIds?: string[];

  // Compatibility fields
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  teamId?: string; // specific default team
  isActive?: boolean;
  maxMembers?: number;

  // Archiving (Phase 4)
  is_archived?: boolean; // Shift archived due to settings incompatibility
  archived_at?: string;  // When it was archived
  archived_reason?: string; // Why it was archived
}

/**
 * Result of checking if a shift is compatible with current settings
 */
export interface ShiftCompatibility {
  shiftId: string;
  shiftName: string;
  isCompatible: boolean;
  issue?: 'OUT_OF_DAY_RANGE' | 'OUT_OF_NIGHT_RANGE' | 'STRADDLES_BOUNDARY';
  currentRange: string;  // e.g., "08:00 - 16:00"
  settingsRange: string; // e.g., "07:00 - 19:00"
  suggestedAction: 'KEEP' | 'ARCHIVE' | 'ADJUST';
}


export interface UserShift {
  id: string;
  userId: string;
  shiftId: string;
  teamId?: string;
  startTime?: string;  // NEW: Time slot start (e.g., "08:00")
  endTime?: string;    // NEW: Time slot end (e.g., "16:00")
  assignedAt: string;
  isActive: boolean;
  notes?: string;
  shiftName?: string;
  userName?: string;
  color?: string; // from backend DTO
  is_placeholder?: boolean;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  managerId?: string;
  memberIds: string[];
  color?: string;
  display_order?: number;
  is_active?: boolean;
}

export type PlanningState = {
  week: WeekKey;
  employees: Record<string, EmployeeMini>;
  teams: Record<string, Team>;
  shifts: Record<string, Shift>;
};

export interface CreateShiftDTO {
  name: string;
  description?: string;
  schedule_data: WeeklySchedule;
  color?: string;
  week_key: string;
  user_id?: string;
  template_id?: string; // Link to source template
}

export interface UpdateShiftCommand {
  id: string; // ID is required in backend binding? No, Param handles ID usually, but cmd struct has ID. Let's make it optional or match usage.
  name?: string;
  description?: string;
  schedule_data?: WeeklySchedule;
  color?: string;
}

export interface CreateTeamCommand {
  name: string;
  department: string;
  manager_id?: string;
  color?: string;
}

export type ViewContext =
  | { type: 'GLOBAL_DEFAULT' }
  | { type: 'TEAM'; teamId: string }
  | { type: 'USER_LIST'; userIds: string[] };

export interface UpdateTeamCommand {
  name?: string;
  department?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  type: 'NATIONAL' | 'RELIGIOUS' | 'OTHER';
  created_at?: string;
  updated_at?: string;
}

export interface ShiftException {
  id: string;
  user_id: string;
  team_id?: string;
  type: 'LEAVE' | 'SICK' | 'REMOTE' | 'OVERRIDE';
  start_date: string; // ISO Timestamp
  end_date: string;   // ISO Timestamp
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at?: string;
  updated_at?: string;
}

export type PlanningException = ShiftException | Holiday;

export interface Schedule {
  id: string;
  team_id?: string;
  user_id?: string;
  shift_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export interface ComputedSchedule {
  id: string; // Unique ID (e.g. shiftId-date)
  date: string; // YYYY-MM-DD
  teamId?: string;
  userId?: string;
  shiftId: string;
  shiftName: string; // Denormalized for display
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  source: 'RULE' | 'EXCEPTION' | 'OVERRIDE';
  hasConflict?: boolean;
  color?: string; // Derived from Shift or Team
  assigneeId?: string;
  assigneeName?: string;
  assigneeType?: 'TEAM' | 'USER';
  isPlaceholder?: boolean; // True if day has no assignments but is linked to template
  isMissingCheckout?: boolean; // True if employee checked in but hasn't checked out yet
  isCheckoutMarker?: boolean; // True for checkout-only markers (rendered as hollow dots)
}

