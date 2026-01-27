import { PdfLayout } from "../core/PdfLayout";
import { PdfTable } from "../core/PdfTable";
import { EmployeeInfoBlock } from "../blocks/EmployeeInfoBlock";
import { Exportable, ColumnDefinition, ReportMeta } from "../../types";
import { EmployeeExportModel } from "../../adapters/employeeAdapter";

interface EmployeeHistoryDocProps<T> {
    data: Exportable<T>;
    columns: ColumnDefinition<T>[];
}

/**
 * EmployeeHistoryDoc
 * A specific report document for an individual employee's history.
 * Includes the Employee Profile Block at the top.
 */
export const EmployeeHistoryDoc = <T extends any>({ data, columns }: EmployeeHistoryDocProps<T>) => {
    // Extract employee data from meta
    const employee = data.meta?.employee as EmployeeExportModel | undefined;

    const reportMeta: ReportMeta = {
        companyName: (data.meta?.companyName as string) || "Company",
        reportDate: (data.meta?.reportDate as string) || new Date().toISOString(),
        reportType: (data.meta?.reportType as string) || "Fiche Employé",
        period: data.meta?.period as string,
        generatedBy: data.meta?.generatedBy as string,
    };

    return (
        <PdfLayout
            title={`Fiche de Pointage`}
            subtitle={employee ? `${employee.fullName} - ${reportMeta.period || ""}` : undefined}
            meta={reportMeta}
        >
            {employee && <EmployeeInfoBlock employee={employee} />}

            <PdfTable
                data={data.rows}
                columns={columns}
            />
        </PdfLayout>
    );
};
