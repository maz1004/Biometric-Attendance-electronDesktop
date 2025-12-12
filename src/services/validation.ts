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

export const getPendingValidations = async (): Promise<ManualValidationRequest[]> => {
    const response = await api.get<ValidationListResponse>("/biometric/hr/validations/pending?limit=20");
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
