// Service de santé et statistiques système
import { apiClient } from './api';
import type { HealthResponse, StatsOverview } from './types/api-types';

// ============================================================================
// HEALTH & STATS API
// ============================================================================

/**
 * Check system health
 * GET /health (no /api/v1 prefix)
 */
export const getHealth = async (): Promise<HealthResponse> => {
  // Note: health endpoint is at root level, not under /api/v1
  const response = await apiClient.get<HealthResponse>('/health', {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  });
  return response.data;
};

/**
 * Get system statistics overview
 * GET /api/v1/stats/overview
 */
export const getStats = async (): Promise<StatsOverview> => {
  const response = await apiClient.get<StatsOverview>('/stats/overview');
  return response.data;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { HealthResponse, StatsOverview };
