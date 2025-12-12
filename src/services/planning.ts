// Service de planification (planning - teams & shifts)
import { apiClient } from './api';
import type {
  TeamsListResponse,
  TeamResponse,
  TeamMembersResponse,
  ShiftsListResponse,
  ShiftResponse,
  UserShiftsResponse,
  PlanningDashboardResponse,
  CreateShiftCommand,
  UpdateShiftCommand,
  AssignUserToShiftCommand,
  UnassignUserFromShiftCommand,
  CreateTeamCommand,
  UpdateTeamCommand,
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// PLANNING - TEAMS API
// ============================================================================

/**
 * Get all teams
 * GET /api/v1/planning/teams
 */
export const getTeams = async (): Promise<TeamsListResponse> => {
  const response = await apiClient.get<TeamsListResponse>('/planning/teams');
  return response.data;
};

/**
 * Get single team by ID
 * GET /api/v1/planning/teams/:id
 */
export const getTeam = async (id: string): Promise<TeamResponse> => {
  const response = await apiClient.get<TeamResponse>(`/planning/teams/${id}`);
  return response.data;
};

/**
 * Get team members
 * GET /api/v1/planning/teams/:id/members
 */
export const getTeamMembers = async (id: string): Promise<TeamMembersResponse> => {
  const response = await apiClient.get<TeamMembersResponse>(`/planning/teams/${id}/members`);
  return response.data;
};

/**
 * Create new team (admin only)
 * POST /api/v1/admin/planning/teams
 */
export const createTeam = async (data: CreateTeamCommand): Promise<SuccessResponse<TeamResponse>> => {
  const response = await apiClient.post<SuccessResponse<TeamResponse>>('/admin/planning/teams', data);
  return response.data;
};

/**
 * Update team (admin only)
 * PUT /api/v1/admin/planning/teams/:id
 */
export const updateTeam = async (id: string, data: UpdateTeamCommand): Promise<SuccessResponse<TeamResponse>> => {
  const response = await apiClient.put<SuccessResponse<TeamResponse>>(`/admin/planning/teams/${id}`, data);
  return response.data;
};

/**
 * Delete team (admin only)
 * DELETE /api/v1/admin/planning/teams/:id
 */
export const deleteTeam = async (id: string): Promise<SuccessResponse<void>> => {
  const response = await apiClient.delete<SuccessResponse<void>>(`/admin/planning/teams/${id}`);
  return response.data;
};

// ============================================================================
// PLANNING - SHIFTS API
// ============================================================================

/**
 * Get all shifts
 * GET /api/v1/planning/shifts
 */
export const getShifts = async (): Promise<ShiftsListResponse> => {
  const response = await apiClient.get<ShiftsListResponse>('/planning/shifts');
  return response.data;
};

/**
 * Get single shift by ID
 * GET /api/v1/planning/shifts/:id
 */
export const getShift = async (id: string): Promise<ShiftResponse> => {
  const response = await apiClient.get<ShiftResponse>(`/planning/shifts/${id}`);
  return response.data;
};

/**
 * Get user's assigned shifts
 * GET /api/v1/planning/users/:id/shifts
 */
export const getUserShifts = async (userId: string): Promise<UserShiftsResponse> => {
  const response = await apiClient.get<UserShiftsResponse>(`/planning/users/${userId}/shifts`);
  return response.data;
};

/**
 * Create new shift (admin only)
 * POST /api/v1/admin/planning/shifts
 */
export const createShift = async (data: CreateShiftCommand): Promise<SuccessResponse<ShiftResponse>> => {
  const response = await apiClient.post<SuccessResponse<ShiftResponse>>('/admin/planning/shifts', data);
  return response.data;
};

/**
 * Update shift (admin only)
 * PUT /api/v1/admin/planning/shifts/:id
 */
export const updateShift = async (id: string, data: UpdateShiftCommand): Promise<SuccessResponse<ShiftResponse>> => {
  const response = await apiClient.put<SuccessResponse<ShiftResponse>>(`/admin/planning/shifts/${id}`, data);
  return response.data;
};

/**
 * Delete shift (admin only)
 * DELETE /api/v1/admin/planning/shifts/:id
 */
export const deleteShift = async (id: string): Promise<SuccessResponse<void>> => {
  const response = await apiClient.delete<SuccessResponse<void>>(`/admin/planning/shifts/${id}`);
  return response.data;
};

/**
 * Assign user to shift (admin only)
 * POST /api/v1/admin/planning/shifts/assign
 */
export const assignUserToShift = async (data: AssignUserToShiftCommand): Promise<SuccessResponse<void>> => {
  const response = await apiClient.post<SuccessResponse<void>>('/admin/planning/shifts/assign', data);
  return response.data;
};

/**
 * Unassign user from shift (admin only)
 * DELETE /api/v1/admin/planning/shifts/unassign
 */
export const unassignUserFromShift = async (data: UnassignUserFromShiftCommand): Promise<SuccessResponse<void>> => {
  const response = await apiClient.delete<SuccessResponse<void>>('/admin/planning/shifts/unassign', { data });
  return response.data;
};

// ============================================================================
// PLANNING - DASHBOARD API
// ============================================================================

/**
 * Get planning dashboard with stats and overview
 * GET /api/v1/planning/dashboard
 */
export const getDashboard = async (): Promise<PlanningDashboardResponse> => {
  const response = await apiClient.get<PlanningDashboardResponse>('/planning/dashboard');
  return response.data;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  TeamsListResponse,
  TeamResponse,
  TeamMembersResponse,
  ShiftsListResponse,
  ShiftResponse,
  UserShiftsResponse,
  PlanningDashboardResponse,
  CreateShiftCommand,
  UpdateShiftCommand,
  AssignUserToShiftCommand,
  UnassignUserFromShiftCommand,
  CreateTeamCommand,
  UpdateTeamCommand,
};
