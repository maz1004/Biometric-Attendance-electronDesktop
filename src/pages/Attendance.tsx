import styled from "styled-components";
import { useAttendance } from "../features/attendance/useAttendance";
import { AttendanceRow, DayAgg } from "../features/attendance/AttendanceTypes";
import AttendanceHeaderBar from "../features/attendance/AttendanceHeaderBar";
import AttendanceTable from "../features/attendance/AttendanceTable";
import Button from "../ui/Button";
import AttendanceHeatmap from "../features/attendance/AttendanceHeatmap";

// New Export Imports
import { PDFDownloadLink } from "@react-pdf/renderer";
import { GenericAttendanceDoc } from "../features/reports/export/pdf/documents/GenericAttendanceDoc";
import { adaptAttendanceRecordsToExportable } from "../features/reports/export/adapters/attendanceAdapter";
import { ColumnDefinition } from "../features/reports/export/types";
import { generateCSV } from "../features/reports/export/csv/csvGenerator";

const Section = styled.section`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const Sub = styled.div`
  font-size: 1.3rem;
  color: var(--color-text-dim);
`;

const Head = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const Aside = styled.div`
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px dashed var(--color-toolbar-input-border);
  border-radius: var(--border-radius-md);
`;

// Define columns for Attendance List Export
const attendanceColumns: ColumnDefinition<AttendanceRow>[] = [
  { header: "Nom", field: "fullName", width: "20%" },
  { header: "Département", field: "department", width: "15%" },
  { header: "Date", field: "dateISO", width: "15%" },
  { header: "Entrée", field: "checkIn", width: "10%", format: (v) => v || '-' },
  { header: "Sortie", field: "checkOut", width: "10%", format: (v) => v || '-' },
  { header: "Statut", field: "status", width: "10%" },
  { header: "Justification", field: "justification", width: "20%", format: (v) => v || '' },
];

export default function Attendance(): JSX.Element {
  const at = useAttendance();

  // simple day aggregations for heatmap (present count only)
  const dayAgg: DayAgg[] = Array.from(new Set(at.list.map((r: AttendanceRow) => r.dateISO))).map(
    (dateISO: string) => ({
      dateISO,
      presentCount: at.list.filter(
        (r: AttendanceRow) => r.dateISO === dateISO && r.status === "present"
      ).length,
    })
  );

  const handleExportCSV = () => {
    const csvData = generateCSV(at.allInWindow, [
      ...attendanceColumns,
      // Add extra columns specific to CSV if needed? Or just use the same.
      // The previous CSV export had meta in the CSV file itself (top rows).
      // Standard CSV generators usually just do headers + rows.
      // If we want metadata at the top, we might need to prepend it to the string manually or support it in generator.
      // For now, let's stick to standard CSV (Header + Rows).
    ]);

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pdfData = adaptAttendanceRecordsToExportable(at.allInWindow, at.period, at.department);

  return (
    <Section>
      <Head>
        <Title>Attendance</Title>
        <Sub>
          Presence, lateness, absences — filter by day/week/month and validate
          anomalies.
        </Sub>
      </Head>

      <AttendanceHeaderBar
        search={at.search}
        onSearch={at.setSearch}
        period={at.period}
        onPeriod={at.setPeriod}
        sortBy={at.sortBy}
        onSort={at.setSortBy}
        page={at.page}
        totalPages={at.totalPages}
        onPrev={at.gotoPrev}
        onNext={at.gotoNext}
        department={at.department}
        status={at.status}
        onFiltersApply={({ department, status }) => {
          at.setDepartment(department);
          at.setStatus(status);
        }}
      />

      <AttendanceTable rows={at.list} />

      <Aside>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 600 }}>Monthly heatmap (present only)</div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <Button
              size="small"
              variation="secondary"
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>

            <PDFDownloadLink
              document={
                <GenericAttendanceDoc
                  data={pdfData}
                  columns={attendanceColumns}
                />
              }
              fileName={`attendance_export_${new Date().toISOString().slice(0, 10)}.pdf`}
            >
              {({ loading }) => (
                <Button size="small" variation="secondary" disabled={loading}>
                  {loading ? "Exporting..." : "Export PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <AttendanceHeatmap data={dayAgg} />
      </Aside>
    </Section>
  );
}
