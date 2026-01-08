import { apiClient } from "./api";
import { SuccessResponse } from "./types";

export interface Device {
    device_id: string;
    device_name: string;
    device_type: "mobile" | "tablet" | "desktop";
    is_active: boolean;
    current_mode: string;
    last_seen: string;
    ip_address: string;
    location?: string;
}

export interface DeviceStats {
    totalDevices: number;
    activeDevices: number;
    offlineDevices: number;
    pendingValidation: number;
}

// ============================================================================
// DEVICES API
// ============================================================================

/**
 * Get all devices (admin)
 * GET /api/v1/mobile/admin/devices
 */
export const getDevices = async (): Promise<SuccessResponse<Device[]>> => {
    const response = await apiClient.get<SuccessResponse<Device[]>>("/mobile/admin/devices");
    return response.data;
};

/**
 * Get device by ID
 * GET /api/v1/mobile/admin/devices/:id
 */
export const getDevice = async (id: string): Promise<SuccessResponse<Device>> => {
    const response = await apiClient.get<SuccessResponse<Device>>(`/mobile/admin/devices/${id}`);
    return response.data;
};

/**
 * Activate a device
 * POST /api/v1/mobile/admin/devices/:id/activate
 */
export const activateDevice = async (id: string): Promise<SuccessResponse<void>> => {
    const response = await apiClient.post<SuccessResponse<void>>(`/mobile/admin/devices/${id}/activate`);
    return response.data;
};

/**
 * Deactivate a device
 * POST /api/v1/mobile/admin/devices/:id/deactivate
 */
export const deactivateDevice = async (id: string): Promise<SuccessResponse<void>> => {
    const response = await apiClient.post<SuccessResponse<void>>(`/mobile/admin/devices/${id}/deactivate`);
    return response.data;
};

/**
 * Get pending enrollments (Mocked for now if no endpoint exists explicitly for device validation queue,
 * or use /api/v1/mobile/enrollments/pending if that refers to facial enrollments - checking routes.go)
 * Route summary says: GET /api/v1/mobile/enrollments/pending
 */
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

export const getPendingEnrollments = async (): Promise<SuccessResponse<PendingEnrollment[]>> => {
    const response = await apiClient.get<SuccessResponse<PendingEnrollment[]>>("/mobile/enrollments/pending");
    return response.data;
};

export const validateEnrollment = async (id: string, approved: boolean): Promise<SuccessResponse<void>> => {
    // If approved, use validate endpoint? Or is there a reject?
    // Route: POST /api/v1/mobile/enrollments/pending/:id/validate
    // Route: DELETE /api/v1/mobile/enrollments/pending/:id
    if (approved) {
        const response = await apiClient.post<SuccessResponse<void>>(`/mobile/enrollments/pending/${id}/validate`);
        return response.data;
    } else {
        const response = await apiClient.delete<SuccessResponse<void>>(`/mobile/enrollments/pending/${id}`);
        return response.data;
    }
};
