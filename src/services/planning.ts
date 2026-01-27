import { apiClient as axios } from "./api"; // Aliased to keep existing code working
import { CreateShiftDTO, UpdateShiftCommand, UpdateTeamCommand, CreateTeamCommand, Shift, Team, UserShift, Holiday, ShiftException, Schedule } from "../features/planning/types";

const API_URL = "/planning"; // Base URL is handled by apiClient, just need relative path from v1

// --- FUNCTIONS ---

// SHIFTS
export async function getShifts(weekKey?: string): Promise<Shift[]> {
  const params: any = { limit: 1000 };
  if (weekKey) {
    params.week_key = weekKey;
  }
  const res = await axios.get(`${API_URL}/shifts`, { params });
  // Handle paginated response structure
  const rawShifts = res.data.data || (Array.isArray(res.data) ? res.data : []);
  console.log("PlanningService.getShifts RAW IDs:", rawShifts.map((s: any) => s.id || s.ID)); // DEBUG
  return rawShifts.map((s: any) => ({
    id: s.id || s.ID, // Try both cases
    name: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description,
    isActive: s.is_active,
    teamId: s.team_id,
    daysOfWeek: s.days_of_week || [],
    maxMembers: s.max_members,
    color: s.color,
    schedule_data: s.schedule_data || {},
    weekKey: s.week_key,
    teamIds: s.team_ids || []
  }));
}

export async function getShift(id: string): Promise<Shift> {
  const res = await axios.get(`${API_URL}/shifts/${id}`);
  const s = res.data;
  return {
    id: s.id,
    name: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description,
    isActive: s.is_active,
    teamId: s.team_id,
    daysOfWeek: s.days_of_week || [],
    maxMembers: s.max_members,
    color: s.color,
    schedule_data: s.schedule_data || {},
    weekKey: s.week_key,
    teamIds: s.team_ids || []
  };
}

export async function createShift(data: CreateShiftDTO): Promise<Shift> {
  const payload = {
    name: data.name,
    description: data.description,
    week_key: data.week_key, // REQUIRED
    schedule_data: data.schedule_data,
    color: data.color
    // Legacy fields ignored by backend new logic: start_time, end_time, days_of_week, team_id
  };
  const res = await axios.post(`${API_URL}/shifts`, payload);

  const s = res.data;
  return {
    id: s.id,
    name: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description,
    isActive: s.is_active,
    teamId: s.team_id,
    daysOfWeek: s.days_of_week || [],
    maxMembers: s.max_members,
    color: s.color,
    schedule_data: s.schedule_data || {},
    weekKey: s.week_key,
    teamIds: s.team_ids || []
  };
}

export async function updateShift(id: string, data: UpdateShiftCommand): Promise<Shift> {
  const payload = {
    id: id,
    name: data.name,
    description: data.description,
    schedule_data: data.schedule_data,
    color: data.color
  };
  const res = await axios.put(`${API_URL}/shifts/${id}`, payload);
  const s = res.data;
  return {
    id: s.id,
    name: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description,
    isActive: s.is_active,
    teamId: s.team_id,
    daysOfWeek: s.days_of_week || [],
    maxMembers: s.max_members,
    color: s.color,
    schedule_data: s.schedule_data || {},
    weekKey: s.week_key,
    teamIds: s.team_ids || []
  };
}

export async function updateShiftTeams(shiftId: string, teamIds: string[]): Promise<void> {
  await axios.put(`${API_URL}/shifts/${shiftId}/teams`, { shift_id: shiftId, team_ids: teamIds });
}

export async function deleteShift(id: string): Promise<void> {
  await axios.delete(`${API_URL}/shifts/${id}`);
}

// TEAMS
export async function getTeams(): Promise<{ teams: Team[] }> {
  const res = await axios.get(`${API_URL}/teams`);

  // Handle PaginatedResponse (data), legacy object (teams), or direct array
  const rawList = Array.isArray(res.data)
    ? res.data
    : (res.data.data || res.data.teams || []);

  let teams: Team[] = rawList.map((t: any) => ({
    id: t.id,
    name: t.name,
    department: t.department,
    managerId: t.manager_id,
    memberIds: [],
    color: t.color
  }));

  // Populate Members (Parallel Fetch)
  // Note: This is a temporary solution for the frontend. Ideally backend returns this.
  const memberPromises = teams.map(async (team) => {
    try {
      const mRes = await axios.get(`${API_URL}/teams/${team.id}/members`);
      // Expecting { members: [...] } or array
      const raw = mRes.data;
      const members = Array.isArray(raw)
        ? raw
        : (raw.members || raw.data || []);

      team.memberIds = members.map((m: any) => m.id || m.userId || m.user_id || m.UserID);
    } catch (e) {
      console.warn(`Failed to fetch members for team ${team.id}`, e);
    }
  });

  await Promise.all(memberPromises);

  return { teams };
}

export async function getTeam(id: string): Promise<Team> {
  const res = await axios.get(`${API_URL}/teams/${id}`);
  const t = res.data;
  return {
    id: t.id,
    name: t.name,
    department: t.department,
    managerId: t.manager_id,
    memberIds: []
  };
}

export async function createTeam(data: CreateTeamCommand): Promise<Team> {
  const payload = {
    name: data.name,
    department: data.department,
    manager_id: data.manager_id
  };
  const res = await axios.post(`${API_URL}/teams`, payload);
  const t = res.data;
  return {
    id: t.id,
    name: t.name,
    department: t.department,
    managerId: t.manager_id,
    memberIds: []
  };
}

export async function updateTeam(id: string, data: UpdateTeamCommand): Promise<Team> {
  const res = await axios.put(`${API_URL}/teams/${id}`, data);
  const t = res.data;
  return {
    id: t.id,
    name: t.name,
    department: t.department,
    managerId: t.manager_id,
    memberIds: []
  };
}

export async function deleteTeam(id: string): Promise<void> {
  await axios.delete(`${API_URL}/teams/${id}`);
}

export async function getTeamMembers(id: string): Promise<any[]> {
  const res = await axios.get(`${API_URL}/teams/${id}/members`);
  return Array.isArray(res.data) ? res.data : (res.data.data || []);
}

// ASSIGNMENTS
export async function addMemberToTeam(teamId: string, userId: string): Promise<void> {
  await axios.post(`${API_URL}/teams/${teamId}/members`, { team_id: teamId, user_id: userId });
}

export async function removeMemberFromTeam(teamId: string, userId: string): Promise<void> {
  // Sending body with DELETE for Command pattern compatibility
  await axios.delete(`${API_URL}/teams/${teamId}/members`, { data: { user_id: userId } });
}

export async function assignUserToShift(data: { user_id: string; shift_id: string; notes?: string; assigned_at?: string; skip_if_exists?: boolean }): Promise<UserShift> {
  const res = await axios.post(`${API_URL}/shifts/assign`, data);
  const u = res.data;
  return {
    id: u.id,
    userId: u.user_id,
    shiftId: u.shift_id,
    assignedAt: u.assigned_at,
    isActive: u.is_active,
    notes: u.notes
  };
}

export async function unassignUserFromShift(data: { user_id: string; shift_id: string }): Promise<void> {
  await axios.delete(`${API_URL}/shifts/unassign`, { data });
}

export async function getUserShifts(userId: string): Promise<UserShift[]> {
  const res = await axios.get(`${API_URL}/users/${userId}/shifts`);
  return res.data.map((u: any) => ({
    id: u.id,
    userId: u.user_id,
    shiftId: u.shift_id,
    assignedAt: u.assigned_at,
    isActive: u.is_active,
    notes: u.notes
  }));
}

// New: Create Assignment (apply template to specific day/time)
export async function createAssignment(data: {
  team_id?: string;
  user_id?: string;
  shift_id?: string;
  date?: string;
  start_time: string;
  end_time: string;
  assigned_type?: 'team' | 'employee';
  assigned_id?: string;
}): Promise<any> {
  const payload = {
    team_id: data.team_id || data.assigned_id,
    start_time: data.start_time,
    end_time: data.end_time,
    days_of_week: data.date ? [new Date(data.date).getDay()] : [],
    name: `Assignment ${data.start_time}-${data.end_time}`,
    date: data.date, // Added missing date field
    assigned_id: data.assigned_id, // Added missing assigned_id
    assigned_type: data.assigned_type, // Added missing assigned_type
    shift_id: data.shift_id // Added missing shift_id
  };
  const res = await axios.post(`${API_URL}/assignments`, payload);
  return res.data;
}

// New: Global Assignments
export async function getAssignments(startDate: string, endDate: string): Promise<{ data: UserShift[] }> {
  try {
    const res = await axios.get(`${API_URL}/assignments`, {
      params: { start_date: startDate, end_date: endDate }
    });
    // raw data is array of UserShiftResponse
    const raw = res.data.data || [];
    console.log("PlanningService.getAssignments RAW:", raw);

    const mapped = raw.map((u: any) => ({
      id: u.id,
      userId: u.user_id,
      shiftId: u.shift_id,
      startTime: u.start_time,   // NEW: Time slot from backend
      endTime: u.end_time,       // NEW: Time slot from backend
      assignedAt: u.assigned_at ? u.assigned_at.substring(0, 10) : "",
      isActive: u.is_active,
      notes: u.notes,
      shiftName: u.shift_name,
      userName: u.user_name
    }));

    return { data: mapped };
  } catch (err) {
    console.error("PlanningService.getAssignments ERROR:", err);
    return { data: [] };
  }
}

export async function getDashboard(): Promise<any> {
  const res = await axios.get(`${API_URL}/stats`);
  return res.data;
}

export const PlanningService = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  assignUserToShift,
  getUserShifts,
  unassignUserFromShift,
  getTeams,
  getTeamMembers,
  createTeam,
  updateTeam,
  deleteTeam,
  getAssignments,
  createAssignment,
  createAssignmentsBatch: async (data: { assignments: any[]; overwrite?: boolean }) => {
    return axios.post(`${API_URL}/assignments/batch`, data);
  },
  updateShiftTeams,

  // Holidays
  getHolidays: async (): Promise<Holiday[]> => {
    const res = await axios.get(`${API_URL}/holidays`);
    return res.data;
  },
  createHoliday: async (data: any): Promise<Holiday> => {
    const res = await axios.post(`${API_URL}/holidays`, data);
    return res.data;
  },
  updateHoliday: async (id: string, data: any): Promise<Holiday> => {
    const res = await axios.put(`${API_URL}/holidays/${id}`, data);
    return res.data;
  },
  deleteHoliday: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/holidays/${id}`);
  },

  // Exceptions
  getExceptions: async (params?: any): Promise<ShiftException[]> => {
    const res = await axios.get(`${API_URL}/exceptions`, { params });
    return res.data;
  },
  createException: async (data: any): Promise<ShiftException> => {
    const res = await axios.post(`${API_URL}/exceptions`, data);
    return res.data;
  },
  updateException: async (id: string, data: any): Promise<ShiftException> => {
    const res = await axios.put(`${API_URL}/exceptions/${id}`, data);
    return res.data;
  },
  deleteException: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/exceptions/${id}`);
  },

  // Schedules (Strategic)
  getSchedules: async (startDate: string, endDate: string, targetType?: 'TEAM' | 'USER', targetId?: string): Promise<Schedule[]> => {
    // Not implemented in backend yet or uses Assignments logic?
    // For now, return empty or implement if backend has endpoint.
    // Backend has `ScheduleRecord` but no dedicated CRUD controller for "Schedules" aggregate yet, 
    // mostly managed via Assignments (UserShifts). 
    // Let's keep it empty or log warning until backend is ready for this specific aggregate if distinct.
    console.warn("getSchedules not fully implemented in backend");
    return [];
  },
  createSchedule: async (data: { team_id?: string, user_id?: string, shift_id: string, start_date: string, end_date: string }): Promise<Schedule> => {
    // This maps to "Strategic Assignment" which we might handle via CreateAssignmentsBatch or similar.
    // For now, throw or implement if we added endpoint.
    // I did not add POST /planning/schedules. 
    // I added /assignments.
    console.warn("createSchedule not implemented");
    throw new Error("createSchedule not implemented");
  }
};
