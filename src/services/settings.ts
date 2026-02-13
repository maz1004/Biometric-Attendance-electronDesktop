// Service de paramètres (settings)
import { apiClient } from './api';
import type { SuccessResponse } from './types';

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface CompanySettings {
    id: string;
    company_name: string;
    company_logo?: string;
    language: string;
    currency: string;
    // Logic Configuration
    enable_planning_based_attendance: boolean;
    enable_global_late_tracking: boolean;

    // Thresholds
    late_threshold_minutes: number;
    early_departure_threshold_minutes: number;
    // Planning Configuration
    planning_day_start?: string;
    planning_day_end?: string;
    planning_night_start?: string;
    planning_night_end?: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateSettingsRequest {
    company_name?: string;
    company_logo?: string;
    language?: string;
    currency?: string;
    // Logic Configuration
    enable_planning_based_attendance?: boolean;
    enable_global_late_tracking?: boolean;

    late_threshold_minutes?: number;
    early_departure_threshold_minutes?: number;
    // Planning Configuration
    planning_day_start?: string;
    planning_day_end?: string;
    planning_night_start?: string;
    planning_night_end?: string;
}

// ============================================================================
// SETTINGS API
// ============================================================================

/**
 * Get company settings
 * GET /api/v1/settings
 */
export const getSettings = async (): Promise<CompanySettings> => {
    const response = await apiClient.get<CompanySettings>('/settings');
    return response.data;
};

/**
 * Update company settings
 * PUT /api/v1/settings
 */
export const updateSettings = async (data: UpdateSettingsRequest): Promise<SuccessResponse<CompanySettings>> => {
    const response = await apiClient.put<SuccessResponse<CompanySettings>>('/settings', data);
    return response.data;
};
