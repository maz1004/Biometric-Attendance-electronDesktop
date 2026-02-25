import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../../services/settings";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { StyledModal, Overlay } from "../../../ui/Modal";
import { HiDocumentText, HiArrowDownTray, HiXMark } from "react-icons/hi2";
import { ReportData, UserReportData } from "../../../services/types/api-types";
import { GenericAttendanceDoc } from "../export/pdf/documents/GenericAttendanceDoc";
import { adaptReportDataToExportable } from "../export/adapters/attendanceAdapter";
import { ColumnDefinition } from "../export/types";
import { downloadReport, generateReportFilename } from "../../../services/reports";

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

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  padding: 1rem;
  max-width: 500px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
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
  { header: "Sorties Anticipées", field: "early_departures", width: "10%", align: "center" },
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
  onSave?: (data: { file: Blob; metadata: any }) => Promise<void>;
  isSaving?: boolean;
}

export const ReportActionPanel: React.FC<ReportActionPanelProps> = ({
  title,
  description,
  onGenerate,
  onCancel,
  isGenerating,
  data,
  onSave,
  isSaving
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);

  // Fetch settings for company name
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Prepare PDF Doc if data is available
  const pdfDoc = data ? (
    <GenericAttendanceDoc
      data={adaptReportDataToExportable(data, settings?.company_name || "My Company", settings?.sector)}
      columns={reportColumns}
    />
  ) : null;

  const handleDownloadClick = () => {
    setShowSaveModal(true);
  };

  const generateBlob = async () => {
    if (!pdfDoc) return null;
    return await pdf(pdfDoc).toBlob();
  };

  const getMetadata = () => {
    if (!data) return {
      type: 'attendance',
      format: 'pdf',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      department: 'all'
    };

    // Extract dates from period string
    // Format can be "YYYY-MM-DD - YYYY-MM-DD" or "YYYY-MM-DD → YYYY-MM-DD"
    let dates = data.period.includes(' → ')
      ? data.period.split(' → ')
      : data.period.split(' - ');

    // Fallback if split failed to produce 2 parts
    const startDate = dates[0] ? dates[0].trim() : new Date().toISOString().slice(0, 10);
    const endDate = dates[1] ? dates[1].trim() : startDate;

    return {
      type: 'attendance',
      format: 'pdf',
      start_date: startDate,
      end_date: endDate,
      department: 'all' // TODO: Pass department
    };
  };

  const handleSaveAndDownload = async () => {
    if (!data || !onSave) return;
    setIsPreparingDownload(true);
    try {
      const blob = await generateBlob();
      if (blob) {
        const meta = getMetadata();

        // Generate filename with Company Name if available
        const companyName = settings?.company_name || "Biometrie";
        const sanitizedCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedCompany}_Rapport_${meta.type}_${meta.start_date}_au_${meta.end_date}.${meta.format}`;

        // Save to history including filename
        await onSave({ file: blob, metadata: { ...meta, filename } });

        // Download
        downloadReport(blob, filename);
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error("Error saving/downloading:", error);
    } finally {
      setIsPreparingDownload(false);
    }
  };

  const handleDownloadOnly = async () => {
    if (!data) return;
    setIsPreparingDownload(true);
    try {
      const blob = await generateBlob();
      if (blob) {
        const meta = getMetadata();
        const filename = generateReportFilename('attendance', 'pdf', meta.start_date, meta.end_date);
        downloadReport(blob, filename);
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setIsPreparingDownload(false);
    }
  };

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
          <Button onClick={handleDownloadClick} disabled={isPreparingDownload}>
            {isPreparingDownload ? "Préparation..." : <> <HiArrowDownTray /> Télécharger PDF </>}
          </Button>
        ) : (
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Génération..." : "Générer & Voir"}
          </Button>
        )}
      </Actions>

      {showSaveModal && createPortal(
        <Overlay>
          <StyledModal>
            <div style={{ position: 'absolute', top: '1.2rem', right: '1.9rem' }}>
              <Button onClick={() => setShowSaveModal(false)} variation="secondary" size="small" style={{ borderRadius: '50%', padding: '0.4rem', border: 'none', background: 'transparent' }}>
                <HiXMark size={24} color="var(--color-grey-500)" />
              </Button>
            </div>
            <ModalContent>
              <Heading as="h3">Sauvegarder le rapport ?</Heading>
              <p>Voulez-vous enregistrer ce rapport dans l'historique avant de le télécharger ?</p>
              <p style={{ fontSize: '1.4rem', color: 'var(--color-grey-500)' }}>
                En l'enregistrant, vous pourrez le retrouver et le télécharger à nouveau plus tard depuis l'onglet "Historique".
              </p>

              <ModalActions>
                <Button variation="secondary" onClick={handleDownloadOnly} disabled={isPreparingDownload}>
                  Non, télécharger seulement
                </Button>
                <Button onClick={handleSaveAndDownload} disabled={isSaving || isPreparingDownload}>
                  {isSaving ? "Enregistrement..." : "Oui, Enregistrer & Télécharger"}
                </Button>
              </ModalActions>
            </ModalContent>
          </StyledModal>
        </Overlay>,
        document.body
      )}
    </Panel>
  );
};
