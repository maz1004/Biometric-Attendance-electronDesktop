// Service de gestion des appareils (devices)
import { apiClient } from './api';
import type {
    Device,
    DevicesResponse,
    RegisterDeviceRequest,
} from './types/api-types';
import type { SuccessResponse } from './types';

export interface PendingEnrollment {
    id: string;
    user_id: string;
    user_name: string;
    device_id: string;
    device_name: string;
    device_type: string;
    face_image: string;
    quality_score: number;
    status: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// DEVICES API
// ============================================================================

/**
 * Get all devices
 * GET /api/v1/admin/devices
 */
export const getDevices = async (): Promise<DevicesResponse> => {
    const response = await apiClient.get<DevicesResponse>('/admin/devices');
    return response.data;
};

/**
 * Get single device by ID
 * GET /api/v1/admin/devices/:id
 */
export const getDevice = async (id: string): Promise<Device> => {
    const response = await apiClient.get<Device>(`/admin/devices/${id}`);
    return response.data;
};

/**
 * Register new device
 * POST /api/v1/admin/devices/register
 */
export const registerDevice = async (data: RegisterDeviceRequest): Promise<SuccessResponse<Device>> => {
    const response = await apiClient.post<SuccessResponse<Device>>('/admin/devices/register', data);
    return response.data;
};

/**
 * Update device
 * PUT /api/v1/admin/devices/:id/details
 */
export const updateDevice = async (id: string, data: Partial<RegisterDeviceRequest>): Promise<SuccessResponse<Device>> => {
    const response = await apiClient.put<SuccessResponse<Device>>(`/admin/devices/${id}/details`, data);
    return response.data;
};

/**
 * Delete device
 * DELETE /api/v1/admin/devices/:id
 */
export const deleteDevice = async (id: string): Promise<SuccessResponse<void>> => {
    const response = await apiClient.delete<SuccessResponse<void>>(`/admin/devices/${id}`);
    return response.data;
};


export const setDeviceMode = async (id: string, mode: 'enrollment' | 'recognition'): Promise<void> => {
    await apiClient.post(`/admin/devices/${id}/mode`, { mode });
};

/**
 * Sync device
 * POST /api/v1/admin/devices/:id/sync
 */
export const syncDevice = async (id: string): Promise<void> => {
    await apiClient.post(`/admin/devices/${id}/sync`);
};

/**
 * Resolve device conflict or authorize replacement
 * POST /api/v1/admin/devices/:id/resolve
 */
export const resolveConflict = async (id: string, resolution: 'approve_replacement' | 'block_device' | 'blacklist_device'): Promise<void> => {
    await apiClient.post(`/admin/devices/${id}/resolve`, { resolution });
};

/**
 * Blacklist IP address
 * POST /api/v1/admin/devices/blacklist-ip
 */
export const blockIP = async (ip: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/devices/blacklist-ip`, { ip, reason });
};

/**
 * Update device details
 * PUT /api/v1/admin/devices/:id/details
 */
export const updateDeviceDetails = async (id: string, name: string, location: string): Promise<void> => {
    await apiClient.put(`/admin/devices/${id}/details`, { name, location });
};

/**
 * Get pending enrollments
 * GET /api/v1/admin/enrollments/pending
 */
export const getPendingEnrollments = async (): Promise<SuccessResponse<PendingEnrollment[]>> => {
    const response = await apiClient.get<SuccessResponse<PendingEnrollment[]>>("/admin/enrollments/pending");
    return response.data;
};

/**
 * Validate enrollment
 * POST /api/v1/admin/enrollments/pending/:id/validate
 */
export const validateEnrollment = async (id: string, approved: boolean): Promise<SuccessResponse<void>> => {
    if (approved) {
        const response = await apiClient.post<SuccessResponse<void>>(`/admin/enrollments/pending/${id}/validate`);
        return response.data;
    } else {
        const response = await apiClient.delete<SuccessResponse<void>>(`/admin/enrollments/pending/${id}`);
        return response.data;
    }
};

/**
 * Deactivate a device (Admin)
 * POST /api/v1/admin/devices/live/:id/deactivate
 */
export const deactivateDevice = async (id: string): Promise<SuccessResponse<void>> => {
    const response = await apiClient.post<SuccessResponse<void>>(`/admin/devices/live/${id}/deactivate`);
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
