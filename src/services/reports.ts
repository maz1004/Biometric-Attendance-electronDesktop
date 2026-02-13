// Service de rapports (reports)
import { apiClient } from './api';
import type { ReportData, UserReportData, ExportReportParams } from './types/api-types';

// ============================================================================
// REPORTS API
// ============================================================================

/**
 * Generate report with specified parameters
 * Uses the real reports handler endpoint (GET /reports/generate)
 * Backend returns data matching ReportData structure directly
 */
export const generateReport = async (params: {
    start_date: string; // ISO 8601
    end_date: string; // ISO 8601
    type?: 'attendance' | 'performance' | 'planning' | 'summary';
    department?: string;
}): Promise<ReportData> => {
    const response = await apiClient.get('/reports/generate', {
        params: {
            start_date: params.start_date,
            end_date: params.end_date,
            type: params.type === 'summary' ? 'daily' : (params.type || 'daily'),
            department: params.department && params.department !== 'all' ? params.department : undefined,
        },
    });

    const data = response.data;

    // The backend returns ReportData directly with matching fields
    return {
        generated_at: data.generated_at || new Date().toISOString(),
        period: data.period || `${params.start_date} → ${params.end_date}`,
        summary: {
            total_users: data.summary?.total_users || 0,
            total_work_days: data.summary?.total_work_days || 0,
            average_attendance_rate: data.summary?.average_attendance_rate || 0,
            total_late_arrivals: data.summary?.total_late_arrivals || 0,
            total_absences: data.summary?.total_absences || 0,
        },
        users: (data.users || []).map((u: UserReportData) => ({
            user_id: u.user_id,
            user_name: u.user_name,
            department: u.department || '',
            efficiency_score: u.efficiency_score || 0,
            attendance_rate: u.attendance_rate || 0,
            present_days: u.present_days || 0,
            absent_days: u.absent_days || 0,
            late_arrivals: u.late_arrivals || 0,
            early_departures: u.early_departures || 0,
            total_work_hours: u.total_work_hours || '0h00',
        })),
    };
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
