// Service de gestion des employés
import { apiClient } from './api';
import type {
  UserResponse,
  GetUsersResponse,
  CreateEmployeeRequest,
  UpdateUserRequest,
  Justification,
  JustifyAbsenceRequest,
} from './types/api-types';

import { Employee } from '../features/employees/EmployeeTypes';
import { API_BASE_URL } from './config/api';
import type { SuccessResponse } from './types';

// ============================================================================
// HELPERS
// ============================================================================

const getFullUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// ============================================================================
// DATA MAPPING (API -> Frontend Domain)
// ============================================================================

const mapApiUserToEmployee = (user: UserResponse): Employee => {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    department: user.department || "N/A",
    role: user.role === 'admin' || user.role === 'rh' ? 'manager' : 'employee',
    enrolled: user.enrolled,
    status: user.is_active ? 'active' : 'inactive',
    createdAt: user.created_at,
    avatar: getFullUrl(user.profile_photo),
    cv: getFullUrl(user.cv_url),
    phoneNumber: user.phone_number,
    dateOfBirth: user.date_of_birth,
    stats: user.stats ? {
      presenceRatePct: user.stats.total_days > 0
        ? Math.round((user.stats.present_days / user.stats.total_days) * 100)
        : 0,
      lateCount30d: user.stats.late_days || 0,
      absenceCount30d: user.stats.absent_days || 0,
      efficiencyScore: user.stats.total_days > 0
        ? Math.round((user.stats.present_days / user.stats.total_days) * 100)
        : 0,
    } : undefined
  };
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  UserResponse,
  GetUsersResponse,
  CreateEmployeeRequest,
  UpdateUserRequest as UpdateEmployeeRequest,
};

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
  role?: string;
}): Promise<{ users: Employee[]; total: number }> => {
  const response = await apiClient.get<SuccessResponse<GetUsersResponse>>('/users', {
    params: { ...params },
  });

  const rawData = response.data.data!;
  return {
    users: rawData.users.map(mapApiUserToEmployee),
    total: rawData.total
  };
};

/**
 * Get single employee by ID
 * GET /api/v1/users/:id
 */
export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.get<SuccessResponse<UserResponse>>(`/users/${id}`);
  return mapApiUserToEmployee(response.data.data!);
};

/**
 * Create new employee
 * POST /api/v1/admin/users/employee
 */
export const createEmployee = async (data: CreateEmployeeRequest): Promise<Employee> => {
  const response = await apiClient.post<SuccessResponse<UserResponse>>('/admin/users/employee', data);
  return mapApiUserToEmployee(response.data.data!);
};

/**
 * Update employee
 * PUT /api/v1/admin/users/:id
 */
export const updateEmployee = async (id: string, data: UpdateUserRequest): Promise<Employee> => {
  const response = await apiClient.put<SuccessResponse<UserResponse>>(`/admin/users/${id}`, data);
  return mapApiUserToEmployee(response.data.data!);
};

/**
 * Delete employee
 * DELETE /api/v1/admin/users/:id
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete<SuccessResponse<void>>(`/admin/users/${id}`);
  return;
};

/**
 * Activate employee account
 * PUT /api/v1/admin/users/:id/activate
 */
export const activateEmployee = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/admin/users/${id}/activate`);
  return;
};

/**
 * Deactivate employee account
 * PUT /api/v1/admin/users/:id/deactivate
 */
export const deactivateEmployee = async (id: string): Promise<void> => {
  await apiClient.put<SuccessResponse<void>>(`/admin/users/${id}/deactivate`);
  return;
};

/**
 * Enroll user face (Separated from profile photo)
 * POST /api/v1/admin/users/:id/enroll
 */
export const enrollFace = async (id: string, faceTemplate: string): Promise<void> => {
  await apiClient.post<SuccessResponse<void>>(`/admin/users/${id}/enroll`, { face_template: faceTemplate });
  return;
};

/**
 * Get absence justifications for a user
 * GET /api/v1/users/:id/absences/justifications
 */
export const getJustifications = async (userId: string): Promise<Justification[]> => {
  const response = await apiClient.get<SuccessResponse<Justification[]>>(`/users/${userId}/absences/justifications`);
  return response.data.data!;
};

/**
 * Submit an absence justification
 * POST /api/v1/users/:id/absences/justify
 */
export const justifyAbsence = async (userId: string, data: JustifyAbsenceRequest): Promise<Justification> => {
  const response = await apiClient.post<SuccessResponse<Justification>>(`/users/${userId}/absences/justify`, data);
  return response.data.data!;
};
