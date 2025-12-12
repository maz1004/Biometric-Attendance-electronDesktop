// Service de gestion des utilisateurs
import { apiClient } from './api';
import type {
  UserResponse,
  GetUsersResponse,
  CreateAdminRequest,
  CreateEmployeeRequest,
  UpdateUserRequest,
  UserStatus,
  UserActivity,
  UserActivityResponse,
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

/**
 * Get paginated list of users
 * GET /api/v1/users?page=1&limit=10&search=&role=&status=
 */
export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'rh' | 'employee';
  status?: 'active' | 'inactive';
}): Promise<GetUsersResponse> => {
  const response = await apiClient.get<SuccessResponse<GetUsersResponse>>('/users', { params });
  // Backend wraps response in { success, message, data }
  return response.data.data!;
};

/**
 * Get single user by ID
 * GET /api/v1/users/:id
 */
export const getUser = async (id: string): Promise<UserResponse> => {
  const response = await apiClient.get<SuccessResponse<UserResponse>>(`/users/${id}`);
  return response.data.data!;
};

/**
 * Create new admin user
 * POST /api/v1/users/admin
 */
export const createAdmin = async (data: CreateAdminRequest): Promise<UserResponse> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/users/admin', data);
  return response.data.data!;
};

/**
 * Create new employee user
 * POST /api/v1/users/employee
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<UserResponse> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/users/employee', data);
  return response.data.data!;
};

/**
 * Update existing user
 * PUT /api/v1/users/:id
 */
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiClient.put<SuccessResponse<UserResponse>>(`/users/${id}`, data);
  return response.data.data!;
};

/**
 * Delete user
 * DELETE /api/v1/users/:id
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete<SuccessResponse<void>>(`/users/${id}`);
  return;
};

/**
 * Activate user account
 * PUT /api/v1/users/:id/activate
 */
export const activateUser = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/users/${id}/activate`);
  return;
};

/**
 * Deactivate user account
 * PUT /api/v1/users/:id/deactivate
 */
export const deactivateUser = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/users/${id}/deactivate`);
  return;
};

/**
 * Get user status and permissions
 * GET /api/v1/users/:id/status
 */
export const getUserStatus = async (id: string): Promise<UserStatus> => {
  const response = await apiClient.get<SuccessResponse<UserStatus>>(`/users/${id}/status`);
  return response.data.data!;
};

/**
 * Get user activity history
 * GET /api/v1/users/:id/activity?page=1&limit=10
 */
export const getUserActivity = async (
  id: string,
  params?: { page?: number; limit?: number }
): Promise<UserActivityResponse> => {
  const response = await apiClient.get<SuccessResponse<UserActivityResponse>>(`/users/${id}/activity`, { params });
  return response.data.data!;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  UserResponse,
  GetUsersResponse,
  CreateAdminRequest,
  CreateEmployeeRequest,
  UpdateUserRequest,
  UserStatus,
  UserActivity,
  UserActivityResponse,
};
