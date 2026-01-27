import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { HiArrowDownTray } from "react-icons/hi2";
import Button from "../../../ui/Button";
import SpinnerMini from "../../../ui/SpinnerMini";
import { EmployeeHistoryDoc } from "../../reports/export/pdf/documents/EmployeeHistoryDoc";
import { useEmployeeHistory } from "../../reports/export/hooks/useEmployeeHistory";
import { adaptUserToEmployeeExport } from "../../reports/export/adapters/employeeAdapter";
import { adaptAttendanceRecordsToExportable } from "../../reports/export/adapters/attendanceAdapter";
import { ColumnDefinition } from "../../reports/export/types";

interface EmployeeExportButtonProps {
    employeeId: string;
}

export const EmployeeExportButton: React.FC<EmployeeExportButtonProps> = ({ employeeId }) => {
    const { user, history, isLoading } = useEmployeeHistory(employeeId);

    if (isLoading) {
        return (
            <Button variation="secondary" size="small" disabled>
                <SpinnerMini /> Loading...
            </Button>
        );
    }

    if (!user) return null;

    const exportEmployee = adaptUserToEmployeeExport(user);

    // Map raw history to AttendanceRecord-like structure
    const mappedHistory = history.map((r: any) => ({
        id: r.id,
        employeeId: r.user_id,
        fullName: r.user_name || "N/A",
        department: "N/A",
        dateISO: (r.timestamp || r.date || "").split('T')[0],
        checkIn: r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : undefined,
        checkOut: r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : undefined,
        status: r.status,
        justification: r.justification || r.notes,
        deviceId: r.location
    }));

    // Use adapter to create base Exportable
    const exportableData = adaptAttendanceRecordsToExportable(
        mappedHistory,
        "Last 3 Months",
        user.department || "N/A"
    );

    // Inject employee profile into meta for the specific Doc header
    exportableData.meta = {
        ...exportableData.meta,
        employee: exportEmployee
    };

    // Define columns for the PDF
    const columns: ColumnDefinition<any>[] = [
        { header: "Date", field: "dateISO", width: "20%" },
        { header: "Entrée", field: "checkIn", width: "15%" },
        { header: "Sortie", field: "checkOut", width: "15%" },
        { header: "Statut", field: "status", width: "20%" },
        { header: "Note / Justif", field: "justification", width: "30%" },
    ];

    return (
        <PDFDownloadLink
            document={
                <EmployeeHistoryDoc
                    data={exportableData}
                    columns={columns}
                />
            }
            fileName={`fiche_${exportEmployee.employeeId}_${new Date().toISOString().slice(0, 10)}.pdf`}
            style={{ textDecoration: 'none' }}
        >
            {({ loading }) => (
                <Button variation="secondary" size="small" disabled={loading}>
                    <HiArrowDownTray />
                    {loading ? " Génération..." : " Exporter PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    );
};
