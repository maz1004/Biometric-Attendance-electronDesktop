import { PdfLayout } from "../core/PdfLayout";
import { PdfTable } from "../core/PdfTable";
import { SummaryStatsBlock } from "../blocks/SummaryStatsBlock";
import { Exportable, ColumnDefinition, ReportMeta } from "../../types";
import { ReportSummary } from "../../../../../services/types/api-types";

interface GenericAttendanceDocProps<T> {
    data: Exportable<T>;
    columns: ColumnDefinition<T>[];
}

/**
 * GenericAttendanceDoc
 * A flexible report document for listing data with an optional summary block.
 * Can be used for:
 * - Daily/Monthly/Weekly Attendance Reports (Summary + List of Users)
 * - Attendance Lists (List of Records)
 */
export const GenericAttendanceDoc = <T extends any>({ data, columns }: GenericAttendanceDocProps<T>) => {
    // Cast meta to expected shape to check for summary
    const summary = data.meta?.summary as ReportSummary | undefined;

    // Ensure strict meta for Layout
    const reportMeta: ReportMeta = {
        companyName: (data.meta?.companyName as string) || "Company",
        reportDate: (data.meta?.reportDate as string) || new Date().toISOString(),
        reportType: (data.meta?.reportType as string) || "Report",
        period: data.meta?.period as string,
        generatedBy: data.meta?.generatedBy as string,
    };

    return (
        <PdfLayout
            title={reportMeta.reportType}
            subtitle={reportMeta.period ? `Période: ${reportMeta.period}` : undefined}
            meta={reportMeta}
        >
            {summary && <SummaryStatsBlock summary={summary} />}

            <PdfTable
                data={data.rows}
                columns={columns}
            />
        </PdfLayout>
    );
};
