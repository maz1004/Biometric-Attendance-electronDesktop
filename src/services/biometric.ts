// Service biométrique (enrollment & recognition)
import { apiClient } from './api';
import type {
  BiometricEnrollRequest,
  BiometricEnrollResponse,
  BiometricRecognizeRequest,
  BiometricRecognizeResponse,
  QualityCheckRequest,
  QualityCheckResponse,
} from './types/api-types';

// ============================================================================
// BIOMETRIC API
// ============================================================================

/**
 * Enroll user biometric data (face/iris)
 * POST /api/v1/biometric/enroll
 */
export const enroll = async (data: BiometricEnrollRequest): Promise<BiometricEnrollResponse> => {
  const response = await apiClient.post<BiometricEnrollResponse>('/biometric/enroll', data);
  return response.data;
};

/**
 * Recognize user from biometric data
 * POST /api/v1/biometric/recognize
 */
export const recognize = async (data: BiometricRecognizeRequest): Promise<BiometricRecognizeResponse> => {
  const response = await apiClient.post<BiometricRecognizeResponse>('/biometric/recognize', data);
  return response.data;
};

/**
 * Check quality of biometric image
 * POST /api/v1/biometric/quality
 */
export const checkQuality = async (data: QualityCheckRequest): Promise<QualityCheckResponse> => {
  const response = await apiClient.post<QualityCheckResponse>('/biometric/quality', data);
  return response.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert image file to base64 string
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert canvas to base64 string
 */
export const canvasToBase64 = (canvas: HTMLCanvasElement): string => {
  const dataUrl = canvas.toDataURL('image/png');
  // Remove data URL prefix
  return dataUrl.split(',')[1];
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  BiometricEnrollRequest,
  BiometricEnrollResponse,
  BiometricRecognizeRequest,
  BiometricRecognizeResponse,
  QualityCheckRequest,
  QualityCheckResponse,
};
