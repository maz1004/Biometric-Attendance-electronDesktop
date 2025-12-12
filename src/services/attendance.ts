// Service de gestion des présences (attendance)
import { apiClient } from './api';
import type {
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  AttendanceRecord,
  AttendanceHistory,
  AttendanceStatus,
} from './types/api-types';

// ============================================================================
// ATTENDANCE API
// ============================================================================

/**
 * Check in user for a shift
 * POST /api/v1/attendance/checkin
 */
export const checkIn = async (data: CheckInRequest): Promise<CheckInResponse> => {
  const response = await apiClient.post<CheckInResponse>('/attendance/checkin', data);
  return response.data;
};

/**
 * Check out user from a shift
 * POST /api/v1/attendance/checkout
 */
export const checkOut = async (data: CheckOutRequest): Promise<CheckOutResponse> => {
  const response = await apiClient.post<CheckOutResponse>('/attendance/checkout', data);
  return response.data;
};

/**
 * Get attendance history for a user
 * GET /api/v1/attendance/history?user_id=&start_date=&end_date=
 */
export const getHistory = async (params: {
  user_id?: string;
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
}): Promise<AttendanceHistory> => {
  const response = await apiClient.get<AttendanceHistory>('/attendance/history', { params });
  return response.data;
};

/**
 * Get current attendance status for a user
 * GET /api/v1/attendance/user/:id/status
 */
export const getUserStatus = async (userId: string): Promise<AttendanceStatus> => {
  const response = await apiClient.get<AttendanceStatus>(`/attendance/user/${userId}/status`);
  return response.data;
};

/**
 * Get attendance records with filters
 * This is a helper function for the UI - maps to getHistory with filters
 */
export interface GetAttendanceParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

export const getAttendance = async (params: GetAttendanceParams) => {
  // Map to getHistory endpoint with query params
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);

  const response = await apiClient.get(`/attendance/history?${queryParams.toString()}`);
  return response;
};

/**
 * Validate attendance anomaly (for manual corrections)
 */
export const validateAnomaly = async (id: string, validated: boolean, justification?: string) => {
  const response = await apiClient.put(`/attendance/${id}/validate`, {
    validated,
    justification,
  });
  return response.data;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  AttendanceRecord,
  AttendanceHistory,
  AttendanceStatus,
};
