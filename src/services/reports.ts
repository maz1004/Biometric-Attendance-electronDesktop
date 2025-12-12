// Service de rapports (reports)
import { apiClient } from './api';
import type { ReportData, ExportReportParams } from './types/api-types';

// ============================================================================
// REPORTS API
// ============================================================================

/**
 * Generate report with specified parameters
 * GET /api/v1/reports/generate?start_date=&end_date=&type=&department=
 */
export const generateReport = async (params: {
    start_date: string; // ISO 8601
    end_date: string; // ISO 8601
    type?: 'attendance' | 'performance' | 'planning' | 'summary';
    department?: string;
}): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>('/reports/generate', { params });
    return response.data;
};

/**
 * Export report as PDF or Excel
 * GET /api/v1/reports/export?start_date=&end_date=&format=pdf|excel
 * Returns: File download (Blob)
 */
export const exportReport = async (params: ExportReportParams): Promise<Blob> => {
    const response = await apiClient.get('/reports/export', {
        params,
        responseType: 'blob', // Important for file download
    });
    return response.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download exported report file
 */
export const downloadReport = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Generate filename for report export
 */
export const generateReportFilename = (
    type: string,
    format: 'pdf' | 'excel',
    startDate: string,
    endDate: string
): string => {
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const dateRange = `${startDate}_to_${endDate}`;
    return `${type}_report_${dateRange}.${extension}`;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ReportData, ExportReportParams };
