// Service de gestion des employés
import { apiClient } from './api';
import type {
  UserResponse,
  GetUsersResponse,
  CreateEmployeeRequest,
  UpdateUserRequest,
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// EMPLOYEES API (Wrapper around Users API)
// ============================================================================

/**
 * Get all employees (users with role='employee')
 * GET /api/v1/users?role=employee
 */
export const getEmployees = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}): Promise<GetUsersResponse> => {
  const response = await apiClient.get<SuccessResponse<GetUsersResponse>>('/users', {
    params: { ...params, role: 'employee' },
  });
  // Backend wraps in { success, message, data }
  return response.data.data!;
};

/**
 * Get single employee by ID
 * GET /api/v1/users/:id
 */
export const getEmployee = async (id: string): Promise<UserResponse> => {
  const response = await apiClient.get<SuccessResponse<UserResponse>>(`/users/${id}`);
  return response.data.data!;
};

/**
 * Create new employee
 * POST /api/v1/users/employee
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<UserResponse> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/users/employee', data);
  return response.data.data!;
};

/**
 * Update employee
 * PUT /api/v1/users/:id
 */
export const updateEmployee = async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiClient.put<SuccessResponse<UserResponse>>(`/users/${id}`, data);
  return response.data.data!;
};

/**
 * Delete employee
 * DELETE /api/v1/users/:id
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete<SuccessResponse<void>>(`/users/${id}`);
  return;
};

/**
 * Activate employee account
 * PUT /api/v1/users/:id/activate
 */
export const activateEmployee = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/users/${id}/activate`);
  return;
};

/**
 * Deactivate employee account
 * PUT /api/v1/users/:id/deactivate
 */
export const deactivateEmployee = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/users/${id}/deactivate`);
  return;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  UserResponse as Employee,
  GetUsersResponse as GetEmployeesResponse,
  CreateEmployeeRequest,
  UpdateUserRequest as UpdateEmployeeRequest,
};
