// Service de rapports (reports)
import { apiClient } from './api';
import type { ReportData, UserReportData, ExportReportParams, GetReportsResponse } from './types/api-types';

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
    type?: 'attendance' | 'planning' | 'summary' | 'personal_employee';
    department?: string;
    status?: string;
    employee_id?: string;
    team_ids?: string[];
    user_ids?: string[];
    site_id?: string;
}): Promise<ReportData> => {
    const response = await apiClient.get('/reports/generate', {
        params: {
            start_date: params.start_date,
            end_date: params.end_date,
            type: params.type === 'summary' ? 'daily' : (params.type === 'personal_employee' ? 'custom' : (params.type || 'daily')),
            department: params.department && params.department !== 'all' ? params.department : undefined,
            status: params.status && params.status !== 'all' ? params.status : undefined,
            employee_id: params.employee_id,
            "team_ids[]": params.team_ids,
            "user_ids[]": params.user_ids,
            site_id: params.site_id && params.site_id !== 'local' ? params.site_id : undefined,
        },
    });

    const data = response.data;

    // The backend returns ReportData directly with matching fields
    return {
        type: data.type || params.type,
        generated_at: data.generated_at || new Date().toISOString(),
        period: data.period || `${params.start_date} → ${params.end_date}`,
        summary: {
            total_users: data.summary?.total_users || 0,
            total_work_days: data.summary?.total_work_days || 0,
            average_attendance_rate: data.summary?.average_attendance_rate || 0,
            total_late_arrivals: data.summary?.total_late_arrivals || 0,
            total_early_departures: data.summary?.total_early_departures || 0,
            total_absences: data.summary?.total_absences || 0,
        },
        users: (data.users || []).map((u: UserReportData) => ({
            user_id: u.user_id,
            user_name: u.user_name,
            department: u.department || '',
            profession: u.profession || '',
            email: u.email || '',
            phone: u.phone || '',
            efficiency_score: u.efficiency_score || 0,
            attendance_rate: u.attendance_rate || 0,
            present_days: u.present_days || 0,
            absent_days: u.absent_days || 0,
            late_arrivals: u.late_arrivals || 0,
            early_departures: u.early_departures || 0,
            total_work_hours: u.total_work_hours || '0h00',
            daily_records: u.daily_records || [],
        })),
        attendance_logs: data.attendance_logs || [],
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

/**
 * Get Reports History
 * GET /api/v1/reports/history
 */
export const getReportsHistory = async (params: {
    page?: number;
    limit?: number;
    type?: string;
    start_date?: string;
    end_date?: string;
    genre?: string;
    employee_id?: string;
    model_ids?: string[];
}): Promise<GetReportsResponse> => {
    const response = await apiClient.get('/reports/history', {
        params: {
            ...params,
            model_ids: undefined,
            "model_ids[]": params.model_ids,
        }
    });
    return response.data;
};

/**
 * Delete a report from history
 * DELETE /api/v1/reports/history/:id
 */
export const deleteReport = async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/history/${id}`);
};

/**
 * Download a specific report from history
 * GET /api/v1/reports/history/:id/download
 */
export const downloadReportFile = async (id: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/reports/history/${id}/download`, {
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Rename a report in history
 * PATCH /api/v1/reports/history/:id
 */
export const renameReport = async (id: string, newName: string): Promise<void> => {
    await apiClient.patch(`/reports/history/${id}`, { file_name: newName });
};

/**
 * Save a client-generated report (PDF) to history
 * POST /api/v1/reports/history
 */
export const saveReport = async (file: Blob, metadata: {
    type: string;
    format: string; // 'pdf' | 'xlsx'
    start_date: string;
    end_date: string;
    department?: string;
    filename?: string;
}): Promise<void> => {
    const formData = new FormData();
    // Pass filename to FormData so backend sees it instead of "blob"
    formData.append('file', file, metadata.filename || 'report.pdf');
    formData.append('type', metadata.type);
    formData.append('format', metadata.format);
    formData.append('start_date', metadata.start_date);
    formData.append('end_date', metadata.end_date);
    if (metadata.department) formData.append('department', metadata.department);

    await apiClient.post('/reports/history', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        } as any
    });
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
 * Sanitize a string for use in filenames
 */
const sanitizeFilename = (str: string): string => {
    return str.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').trim();
};

/**
 * Generate context-aware filename for report export
 */
export const generateReportFilename = (
    type: string,
    format: 'pdf' | 'excel' | 'xlsx' | 'docx',
    startDate: string,
    endDate: string,
    context?: {
        employeeName?: string;
        modelNames?: string[];
        department?: string;
        genre?: string;
        companyName?: string;
    }
): string => {
    const extension = format === 'pdf' ? 'pdf' : format === 'docx' ? 'doc' : 'xlsx';
    const dateStr = startDate === endDate ? startDate : `${startDate}_au_${endDate}`;

    let filename = '';

    switch (type) {
        case 'personal_employee':
        case 'custom': {
            const name = context?.employeeName ? sanitizeFilename(context.employeeName) : 'Employe';
            filename = `Report_Personal_${name}_${dateStr}`;
            break;
        }
        case 'planning': {
            const models = context?.modelNames?.length
                ? sanitizeFilename(context.modelNames.join('-'))
                : 'Global';
            filename = `Planning_${models}_${dateStr}`;
            break;
        }
        case 'attendance': {
            const dept = context?.department && context.department !== 'all'
                ? sanitizeFilename(context.department)
                : 'Global';
            filename = `Presence_${dept}_${dateStr}`;
            break;
        }
        case 'summary':
        case 'daily':
        case 'weekly':
        case 'monthly': {
            const genreLabel = context?.genre || type;
            const dept = context?.department && context.department !== 'all'
                ? sanitizeFilename(context.department)
                : 'Global';
            filename = `Resume_${sanitizeFilename(genreLabel)}_${dept}_${dateStr}`;
            break;
        }
        default:
            filename = `Rapport_${type}_${dateStr}`;
    }

    // Prepend company name if available
    if (context?.companyName) {
        filename = `${sanitizeFilename(context.companyName)}_${filename}`;
    }

    return `${filename}.${extension}`;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ReportData, ExportReportParams };
