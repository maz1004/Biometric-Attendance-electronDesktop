export type WeekKey = string; // e.g. "2025-11-03" (Monday ISO)
export type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon..Sun

export interface EmployeeMini {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "15:04:05"
  endTime: string;   // "15:04:05"
  description?: string;
  daysOfWeek: number[]; // 1-7
  teamId?: string;
  isActive: boolean;
  color?: string; // Frontend cosmetic
  maxMembers?: number;
}

export interface UserShift {
  id: string;
  userId: string;
  shiftId: string;
  assignedAt: string; // ISO Date of the assignment target (e.g. "2023-10-27")
  isActive: boolean;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  managerId?: string;
  memberIds: string[]; // Front-end derived helper
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
  start_time: string;
  end_time: string;
  team_id?: string;
  days_of_week: number[];
  max_members: number;
}

export interface UpdateShiftCommand {
  name?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  max_members?: number;
}

export interface CreateTeamCommand {
  name: string;
  department: string;
  manager_id?: string;
}

export interface UpdateTeamCommand {
  name?: string;
}
