// Types partagés pour les services API

// Base success response from backend
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  count?: number;
}

// Base error response from backend
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: string;
  code?: number;
}

// Generic API response (can be success or error)
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

// Types pour la pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  next_offset?: number;
}

