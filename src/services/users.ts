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
  UserAttendanceStats,
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

/**
 * Upload user photo
 * POST /api/v1/admin/users/:id/photo
 */
export const uploadUserPhoto = async (id: string, photoData: string, fileName: string): Promise<{ photo_url: string }> => {
  const response = await apiClient.post<SuccessResponse<{ photo_url: string }>>(`/admin/users/${id}/photo`, {
    photo_data: photoData,
    file_name: fileName,
  });
  return response.data.data!;
};

/**
 * Upload user CV
 * POST /api/v1/admin/users/:id/cv
 */
export const uploadUserCV = async (id: string, cvData: string, fileName: string): Promise<{ cv_url: string }> => {
  const response = await apiClient.post<SuccessResponse<{ cv_url: string }>>(`/admin/users/${id}/cv`, {
    cv_data: cvData,
    file_name: fileName,
  });
  return response.data.data!;
};

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
 * POST /api/v1/admin/users/admin
 */
export const createAdmin = async (data: CreateAdminRequest): Promise<UserResponse> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/admin/users/admin', data);
  return response.data.data!;
};

/**
 * Create new employee user
 * POST /api/v1/admin/users/employee
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<UserResponse> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/admin/users/employee', data);
  return response.data.data!;
};

/**
 * Update existing user
 * PUT /api/v1/admin/users/:id
 */
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiClient.put<SuccessResponse<UserResponse>>(`/admin/users/${id}`, data);
  return response.data.data!;
};

/**
 * Delete user
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete<SuccessResponse<void>>(`/admin/users/${id}`);
  return;
};

/**
 * Activate user account
 * PUT /api/v1/admin/users/:id/activate
 */
export const activateUser = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/admin/users/${id}/activate`);
  return;
};

/**
 * Deactivate user account
 * PUT /api/v1/admin/users/:id/deactivate
 */
export const deactivateUser = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/admin/users/${id}/deactivate`);
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

/**
 * Get user attendance stats
 * GET /api/v1/users/:id/attendance/stats?period=month
 */
export const getUserAttendanceStats = async (
  id: string,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<UserAttendanceStats> => {
  const response = await apiClient.get<SuccessResponse<UserAttendanceStats>>(`/users/${id}/attendance/stats`, {
    params: { period }
  });
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
  UserAttendanceStats,
};
