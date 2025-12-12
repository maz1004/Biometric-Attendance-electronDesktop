export type WeekKey = string; // e.g. "2025-11-03" (Monday ISO)
export type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Mon..Sun

export type EmployeeMini = {
  id: string;
  name: string;
  department?: string;
  avatar?: string;
};

export type Team = {
  id: string;
  name: string;
  color?: string;
  memberIds: string[]; // users in the team
};

export type Shift = {
  id: string;
  name: string;
  start: string; // "08:00"
  end: string; // "16:00"
  daysActive: DayKey[]; // active days in week
  teamIds: string[]; // attached teams
  extraMemberIds: string[]; // optional ad-hoc users (not in teams)
};

export type PlanningState = {
  week: WeekKey;
  employees: Record<string, EmployeeMini>;
  teams: Record<string, Team>;
  shifts: Record<string, Shift>;
};
