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
    timezone: string;
    date_format: string;
    time_format: string;
    language: string;
    currency: string;
    working_hours_start: string;
    working_hours_end: string;
    late_threshold_minutes: number;
    early_departure_threshold_minutes: number;
    created_at: string;
    updated_at: string;
}

export interface UpdateSettingsRequest {
    company_name?: string;
    company_logo?: string;
    timezone?: string;
    date_format?: string;
    time_format?: string;
    language?: string;
    currency?: string;
    working_hours_start?: string;
    working_hours_end?: string;
    late_threshold_minutes?: number;
    early_departure_threshold_minutes?: number;
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
