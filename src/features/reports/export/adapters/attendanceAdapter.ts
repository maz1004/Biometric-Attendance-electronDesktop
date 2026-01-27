import { AttendanceRecord } from "../../../attendance/AttendanceTypes";
import { ReportData, UserReportData } from "../../../../services/types/api-types";
import { Exportable } from "../types";

/**
 * Adapter for the "Attendance Page" list export.
 * Transforms raw attendance records into an Exportable structure.
 */
export const adaptAttendanceRecordsToExportable = (
    records: AttendanceRecord[],
    period: string,
    department: string
): Exportable<AttendanceRecord> => {
    return {
        rows: records,
        meta: {
            reportType: "Rapport de Pointage",
            companyName: "Biometric Attendance System", // Could be dynamic
            reportDate: new Date().toLocaleDateString('fr-FR'),
            period,
            department,
            generatedBy: "System", // Could be current user
        }
    };
};

/**
 * Adapter for the "Reports Page" global summary export.
 * Transforms the ReportData API response into an Exportable structure.
 * Rows = User List
 * Meta = Global Summary + Context
 */
export const adaptReportDataToExportable = (data: ReportData): Exportable<UserReportData> => {
    return {
        rows: data.users,
        meta: {
            reportType: "Rapport de Présence",
            companyName: "Biometric Attendance System",
            reportDate: new Date(data.generated_at).toLocaleDateString('fr-FR'),
            // We pass the summary object into meta so it can be used by SummaryStatsBlock
            summary: data.summary,
            period: data.period,
            generatedBy: "System",
        }
    };
};
