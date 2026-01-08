// Service d'authentification
import { apiClient } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserResponse
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// AUTHENTICATION API
// ============================================================================

/**
 * Login user with email and password
 * POST /api/v1/auth/login
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

  // Store token and user if login successful
  if (response.data.success && response.data.data?.token) {
    localStorage.setItem('token', response.data.data.token);
    if (response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
  }

  return response.data;
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = async (credentials: RegisterRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/register', credentials);

  // Store token if registration successful
  if (response.data.success && response.data.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }

  return response.data;
};

/**
 * Logout current user
 * POST /api/v1/auth/logout
 */
export const logout = async (): Promise<SuccessResponse<void>> => {
  const response = await apiClient.post<SuccessResponse<void>>('/auth/logout');

  // Clear token and user from storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  return response.data;
};

/**
 * Refresh JWT token
 * POST /api/v1/auth/refresh
 * Note: Token is sent in Authorization header by interceptor
 */
export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await apiClient.post<{ token: string }>('/auth/refresh');

  // Update token in storage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

/**
 * Update user password
 * PUT /api/v1/auth/password
 */
export const updatePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<SuccessResponse<void>> => {
  const response = await apiClient.put<SuccessResponse<void>>('/auth/password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Get current authenticated user details
 * GET /api/v1/auth/profile
 */
export const getCurrentUser = async (): Promise<SuccessResponse<UserResponse>> => {
  const response = await apiClient.get<SuccessResponse<UserResponse>>('/auth/profile');
  return response.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { LoginRequest, RegisterRequest, LoginResponse, UserResponse };
