import { useState } from "react";
import styled from "styled-components";
import { ReportData, UserReportData } from "../../services/types/api-types";
import { ColumnDefinition } from "./export/types";
import { adaptReportDataToExportable } from "./export/adapters/attendanceAdapter";
import { GenericAttendanceDoc } from "./export/pdf/documents/GenericAttendanceDoc";
import Button from "../../ui/Button";
import { HiDownload, HiEye } from "react-icons/hi";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

const Container = styled.div`
  background: var(--color-bg-elevated);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-card);
  display: grid;
  gap: 1.6rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div`
  background: var(--color-bg-main);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-dim);
`;

const SummaryValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-strong);
`;

const ViewerContainer = styled.div`
  height: 600px;
  width: 100%;
  margin-top: 1rem;
  border: 1px solid var(--color-border-card);
`;

interface ReportPreviewProps {
    data: ReportData;
}

// Define strict columns for the report table
const reportColumns: ColumnDefinition<UserReportData>[] = [
    { header: "Nom", field: "user_name", width: "25%" },
    { header: "Département", field: "department", width: "20%" },
    {
        header: "Présence",
        width: "15%",
        align: "right",
        format: (_, row) => `${row.present_days}j (${row.attendance_rate.toFixed(0)}%)`
    },
    { header: "Retards", field: "late_arrivals", width: "10%", align: "center" },
    { header: "Absences", field: "absent_days", width: "10%", align: "center", format: (v) => `${v}j` },
    { header: "Heures", field: "total_work_hours", width: "10%", align: "right" },
];

export default function ReportPreview({ data }: ReportPreviewProps) {
    const [showPreview, setShowPreview] = useState(false);

    if (!data) return null;

    // Transform API data to Exportable format
    const exportData = adaptReportDataToExportable(data);

    return (
        <Container>
            <Header>
                <Title>Report Preview</Title>
                <div style={{ display: "flex", gap: "0.8rem" }}>
                    <Button variation="secondary" size="small" onClick={() => setShowPreview(!showPreview)}>
                        <HiEye /> {showPreview ? "Hide Preview" : "Show PDF Preview"}
                    </Button>

                    <PDFDownloadLink
                        document={
                            <GenericAttendanceDoc
                                data={exportData}
                                columns={reportColumns}
                            />
                        }
                        fileName={`attendance_report_${data.period.replace(/\s/g, '_')}.pdf`}
                    >
                        {({ loading }) => (
                            <Button variation="primary" size="small" disabled={loading}>
                                <HiDownload /> {loading ? "Generating..." : "Download PDF"}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </Header>

            <div>
                <p><strong>Period:</strong> {data.period}</p>
                <p><strong>Generated At:</strong> {new Date(data.generated_at).toLocaleString()}</p>
            </div>

            <SummaryGrid>
                <SummaryCard>
                    <SummaryLabel>Total Users</SummaryLabel>
                    <SummaryValue>{data.summary.total_users}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Attendance Rate</SummaryLabel>
                    <SummaryValue>{data.summary.average_attendance_rate.toFixed(1)}%</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Total Late</SummaryLabel>
                    <SummaryValue>{data.summary.total_late_arrivals}</SummaryValue>
                </SummaryCard>
                <SummaryCard>
                    <SummaryLabel>Total Absences</SummaryLabel>
                    <SummaryValue>{data.summary.total_absences}</SummaryValue>
                </SummaryCard>
            </SummaryGrid>

            {showPreview && (
                <ViewerContainer>
                    <PDFViewer width="100%" height="100%">
                        <GenericAttendanceDoc
                            data={exportData}
                            columns={reportColumns}
                        />
                    </PDFViewer>
                </ViewerContainer>
            )}
        </Container>
    );
}
