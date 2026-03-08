import { apiClient as api } from "./api";

export interface ManualValidationRequest {
    id: string;
    user_id: string | null;
    captured_image: string; // Base64
    similarity_score: number;
    submission_timestamp: string;
    device_info: {
        name: string;
    };
}

export interface ValidationCountResponse {
    success: boolean;
    count: number;
}

export interface ValidationListResponse {
    data: ManualValidationRequest[];
}

export const getValidationCount = async (): Promise<number> => {
    const response = await api.get<ValidationCountResponse>("/biometric/hr/validations/count");
    return response.data.count;
};

/**
 * Obtenir les validations manuelles récupérées par statut
 * GET /api/v1/biometric/hr/validations/pending?status={status}
 */
export const getPendingValidations = async (status: string = "pending", limit: number = 50, offset: number = 0): Promise<ManualValidationRequest[]> => {
    let apiStatus = status;
    if (status === "accepted") apiStatus = "approved";

    const response = await api.get<ValidationListResponse>('/biometric/hr/validations/pending', {
        params: { limit, offset, status: apiStatus }
    });
    return response.data.data;
};

export const approveValidation = async (id: string, reviewedBy: string, selectedUserId?: string) => {
    return api.post(`/biometric/hr/validations/${id}/approve`, {
        reviewed_by: reviewedBy,
        selected_user_id: selectedUserId,
    });
};

export const rejectValidation = async (id: string, reviewedBy: string, reason: string) => {
    return api.post(`/biometric/hr/validations/${id}/reject`, {
        reviewed_by: reviewedBy,
        reason,
    });
};
