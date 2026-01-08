import axios from "axios";
import { CreateShiftDTO, UpdateShiftCommand, UpdateTeamCommand, CreateTeamCommand, Shift, Team, UserShift } from "../features/planning/PlanningTypes";

const API_URL = "http://localhost:8080/api/v1/planning";

// --- FUNCTIONS ---

// SHIFTS
export async function getShifts(): Promise<Shift[]> {
  const res = await axios.get(`${API_URL}/shifts`);
  // Map snake_case to camelCase
  return res.data.map((s: any) => ({
    id: s.id,
    name: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    description: s.description,
    isActive: s.is_active,
    teamId: s.team_id,
    daysOfWeek: s.days_of_week || [],
    maxMembers: s.max_members,
    color: s.color
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
    color: s.color
  };
}

export async function createShift(data: CreateShiftDTO): Promise<Shift> {
  // Convert DTO camel to snake if needed? Backend usually expects JSON snake_case or we use `json:"tag"` in Go.
  // My Go structs usually use snake_case json tags.
  // Yes, UpdateShiftDTO in Go has `json:"start_time"`.
  // So I need to map REQUEST data to snake_case too.
  const payload = {
    name: data.name,
    description: data.description,
    start_time: data.start_time, // Wait, DTO in PlanningTypes matches snake?
    end_time: data.end_time,
    team_id: data.team_id,
    days_of_week: data.days_of_week,
    max_members: data.max_members
  };
  const res = await axios.post(`${API_URL}/shifts`, payload);
  // Return mapped
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
    color: s.color
  };
}

export async function updateShift(id: string, data: UpdateShiftCommand): Promise<Shift> {
  const payload = {
    name: data.name,
    start_time: data.start_time,
    end_time: data.end_time,
    days_of_week: data.days_of_week,
    max_members: data.max_members
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
    color: s.color
  };
}

export async function deleteShift(id: string): Promise<void> {
  await axios.delete(`${API_URL}/shifts/${id}`);
}

// TEAMS
export async function getTeams(): Promise<{ teams: Team[] }> {
  const res = await axios.get(`${API_URL}/teams`);
  // res.data might be array.
  const rawList = Array.isArray(res.data) ? res.data : (res.data.teams || []);
  const teams = rawList.map((t: any) => ({
    id: t.id,
    name: t.name,
    department: t.department,
    managerId: t.manager_id,
    memberIds: [] // Default empty until backend provides members
  }));
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
  return res.data;
}

// ASSIGNMENTS
export async function assignUserToShift(data: { user_id: string; shift_id: string; notes?: string; assigned_at?: string }): Promise<UserShift> {
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

// New: Global Assignments
export async function getAssignments(startDate: string, endDate: string): Promise<{ data: UserShift[] }> {
  const res = await axios.get(`${API_URL}/assignments`, {
    params: { start_date: startDate, end_date: endDate }
  });
  // raw data is array of UserShiftResponse
  const raw = res.data.data || [];
  const mapped = raw.map((u: any) => ({
    id: u.id,
    userId: u.user_id,
    shiftId: u.shift_id,
    assignedAt: u.assigned_at,
    isActive: u.is_active,
    notes: u.notes
  }));

  return { data: mapped };
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
  createTeam,
  updateTeam,
  deleteTeam,
  getAssignments
};
