import styled, { keyframes } from "styled-components";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { HiDocumentText, HiArrowDownTray } from "react-icons/hi2";
import { ReportData, UserReportData } from "../../../services/types/api-types";
import { GenericAttendanceDoc } from "../export/pdf/documents/GenericAttendanceDoc";
import { adaptReportDataToExportable } from "../export/adapters/attendanceAdapter";
import { ColumnDefinition } from "../export/types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Panel = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  box-shadow: var(--shadow-md);
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.6rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-grey-100);
  padding-bottom: 1.2rem;
`;

const PreviewArea = styled.div`
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 2.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* Increased for PDF Viewer */
`;

const PaperPreview = styled.div`
  background-color: white;
  width: 210px; /* A4 Ratio approx */
  height: 297px;
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #333;
  font-size: 0.8rem;
  position: relative;

  &::before {
    content: ""; /* Header Mock */
    display: block;
    height: 10px;
    width: 60%;
    background: var(--color-brand-500);
    opacity: 0.3;
    margin-bottom: 1rem;
  }
`;

const PaperLine = styled.div<{ width?: string }>`
  height: 4px;
  background-color: #eee;
  width: ${props => props.width || "100%"};
  border-radius: 2px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

// Reuse standard columns
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

interface ReportActionPanelProps {
  title: string;
  description?: string;
  onGenerate: () => void; // Used for fetching/refreshing data
  onCancel: () => void;
  isGenerating?: boolean;
  data?: ReportData | null; // Data for live preview
}

export const ReportActionPanel: React.FC<ReportActionPanelProps> = ({
  title,
  description,
  onGenerate,
  onCancel,
  isGenerating,
  data
}) => {

  // Prepare PDF Doc if data is available
  const pdfDoc = data ? (
    <GenericAttendanceDoc
      data={adaptReportDataToExportable(data)}
      columns={reportColumns}
    />
  ) : null;

  return (
    <Panel>
      <Header>
        <div>
          <Heading as="h3">{title}</Heading>
          {description && <span style={{ color: 'var(--color-grey-500)' }}>{description}</span>}
        </div>
      </Header>

      <PreviewArea>
        {data && pdfDoc ? (
          <PDFViewer width="100%" height="400px" style={{ border: 'none' }}>
            {pdfDoc}
          </PDFViewer>
        ) : (
          <PaperPreview>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>
              {title}
            </div>
            <PaperLine width="80%" />
            <PaperLine width="90%" />
            <PaperLine width="70%" />
            <div style={{ marginTop: '2rem' }}>
              <PaperLine width="100%" />
              <PaperLine width="100%" />
              <PaperLine width="100%" />
              <PaperLine width="100%" />
              <PaperLine width="100%" />
            </div>
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', opacity: 0.2 }}>
              <HiDocumentText size={32} />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: 'var(--color-brand-600)', opacity: 0.6 }}>
              Aperçu
            </div>
          </PaperPreview>
        )}
      </PreviewArea>

      <Actions>
        <Button variation="secondary" onClick={onCancel}>
          Annuler
        </Button>

        {data && pdfDoc ? (
          <PDFDownloadLink
            document={pdfDoc}
            fileName={`report_${data.period.replace(/\s/g, '_')}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                <HiArrowDownTray /> {loading ? "Préparation..." : "Télécharger PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Génération..." : "Générer & Voir"}
          </Button>
        )}
      </Actions>
    </Panel>
  );
};
