// Service de gestion des appareils (devices)
import { apiClient } from './api';
import type {
    Device,
    DevicesResponse,
    RegisterDeviceRequest,
} from './types/api-types';
import type { SuccessResponse } from './types';

// ============================================================================
// DEVICES API
// ============================================================================

/**
 * Get all devices
 * GET /api/v1/devices
 */
export const getDevices = async (): Promise<DevicesResponse> => {
    const response = await apiClient.get<DevicesResponse>('/devices');
    return response.data;
};

/**
 * Get single device by ID
 * GET /api/v1/devices/:id
 */
export const getDevice = async (id: string): Promise<Device> => {
    const response = await apiClient.get<Device>(`/devices/${id}`);
    return response.data;
};

/**
 * Register new device
 * POST /api/v1/devices
 */
export const registerDevice = async (data: RegisterDeviceRequest): Promise<SuccessResponse<Device>> => {
    const response = await apiClient.post<SuccessResponse<Device>>('/devices', data);
    return response.data;
};

/**
 * Update device
 * PUT /api/v1/devices/:id
 */
export const updateDevice = async (id: string, data: Partial<RegisterDeviceRequest>): Promise<SuccessResponse<Device>> => {
    const response = await apiClient.put<SuccessResponse<Device>>(`/devices/${id}`, data);
    return response.data;
};

/**
 * Delete device
 * DELETE /api/v1/devices/:id
 */
export const deleteDevice = async (id: string): Promise<SuccessResponse<void>> => {
    const response = await apiClient.delete<SuccessResponse<void>>(`/devices/${id}`);
    return response.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get device status color
 */
export const getDeviceStatusColor = (lastSeen: string): 'online' | 'offline' | 'error' => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

    if (diffMinutes < 5) return 'online';
    if (diffMinutes < 30) return 'offline';
    return 'error';
};

/**
 * Format last seen time
 */
export const formatLastSeen = (lastSeen: string): string => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
    Device,
    DevicesResponse,
    RegisterDeviceRequest,
};
