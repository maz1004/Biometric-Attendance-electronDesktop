import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../../services/settings";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import * as XLSX from 'xlsx';
import { PDFViewer, pdf } from "@react-pdf/renderer";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import { StyledModal, Overlay } from "../../../ui/Modal";
import { HiDocumentText, HiArrowDownTray, HiXMark } from "react-icons/hi2";
import { ReportData, UserReportData } from "../../../services/types/api-types";
import { GenericAttendanceDoc } from "../export/pdf/documents/GenericAttendanceDoc";
import { PersonalEmployeeDoc } from "../export/pdf/documents/PersonalEmployeeDoc";
import { PlanningReportDoc } from "../export/pdf/documents/PlanningReportDoc";
import { adaptReportDataToExportable } from "../export/adapters/attendanceAdapter";
import { PersonalEmployeeHTMLPreview } from "./PersonalEmployeeHTMLPreview";
import { PlanningHTMLPreview } from "./PlanningHTMLPreview";
import { AttendanceLogsHTMLPreview } from "./AttendanceLogsHTMLPreview";
import { AttendanceLogsReportDoc } from "../export/pdf/documents/AttendanceLogsReportDoc";
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
  align-items: flex-start;
  min-height: 400px; /* Increased for PDF Viewer */
  max-height: 60vh;
  overflow-y: auto;
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

const FormatSelect = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  color: var(--color-grey-700);
  font-weight: 500;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
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
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'docx'>('pdf');

  // Fetch settings for company name
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Determine if it's a personalized single employee report
  const isPersonalEmployee = data?.users?.length === 1 && data?.users[0]?.daily_records && data.users[0].daily_records.length > 0;

  // Prepare PDF Doc if data is available
  let pdfDoc = null;
  if (data) {
    if (data.type === 'planning') {
      pdfDoc = (
        <PlanningReportDoc
          data={data}
          companyName={settings?.company_name || ""}
        />
      );
    } else if (data.type === 'attendance') {
      pdfDoc = (
        <AttendanceLogsReportDoc
          data={data}
          companyName={settings?.company_name || ""}
        />
      );
    } else if (isPersonalEmployee) {
      pdfDoc = (
        <PersonalEmployeeDoc
          data={data.users[0]}
          period={data.period}
          companyName={settings?.company_name || ""}
        />
      );
    } else {
      pdfDoc = (
        <GenericAttendanceDoc
          data={adaptReportDataToExportable(data, settings?.company_name || "My Company", settings?.sector)}
          columns={reportColumns}
        />
      );
    }
  }

  const handleDownloadClick = () => {
    setShowSaveModal(true);
  };

  const generateBlob = async (format?: 'pdf' | 'xlsx' | 'docx') => {
    const fmt = format || selectedFormat;
    if (fmt === 'pdf') {
      if (!pdfDoc) return null;
      return await pdf(pdfDoc).toBlob();
    }
    if (fmt === 'xlsx' && data) {
      return generateXlsxBlob(data);
    }
    if (fmt === 'docx' && data) {
      return generateDocxBlob(data);
    }
    return null;
  };

  const formatDuration = (hours: number | null | undefined): string => {
    if (hours == null) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  // Generate a real XLSX blob using SheetJS
  const generateXlsxBlob = (reportData: ReportData): Blob => {
    const wb = XLSX.utils.book_new();

    if (reportData.type === 'attendance') {
      const headerRow = ['Date', 'Nom', 'Email', 'Département', 'Entrée', 'Sortie', 'Statut', 'Méthode'];
      const logsRows = (reportData.attendance_logs || []).map(l => [
        l.date,
        l.user_name,
        l.user_email,
        l.department,
        l.check_in_time ? new Date(l.check_in_time).toLocaleTimeString() : '--:--',
        l.check_out_time ? new Date(l.check_out_time).toLocaleTimeString() : '--:--',
        l.status,
        l.method
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...logsRows]);
      ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Présence');

    } else if (reportData.type === 'planning') {
      const headerRow = ['Nom', 'Département', 'Date', 'Shift/Statut', 'Entrée', 'Sortie', 'Heures Prévues'];
      const rows: any[][] = [];
      reportData.users?.forEach(u => {
        (u.daily_records || []).forEach(r => {
          rows.push([
            u.user_name,
            u.department,
            new Date(r.date).toLocaleDateString(),
            r.status,
            r.check_in ? new Date(r.check_in).toLocaleTimeString() : '--:--',
            r.check_out ? new Date(r.check_out).toLocaleTimeString() : '--:--',
            formatDuration(r.work_duration_hours)
          ]);
        });
      });
      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
      ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Planning');

    } else {
      // Sheet 1: Summary (Summary Report)
      const summaryData = [
        ['Rapport', reportData.type || 'summary'],
        ['Période', reportData.period],
        ['Généré le', reportData.generated_at],
        [],
        ['Métrique', 'Valeur'],
        ['Total employés', reportData.summary?.total_users || 0],
        ['Jours travaillés', reportData.summary?.total_work_days || 0],
        ['Taux présence', `${reportData.summary?.average_attendance_rate || 0}%`],
        ['Retards', reportData.summary?.total_late_arrivals || 0],
        ['Départs anticipés', reportData.summary?.total_early_departures || 0],
        ['Absences', reportData.summary?.total_absences || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 25 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

      // Sheet 2: User details
      const headerRow = ['Nom', 'Département', 'Poste', 'Présence (j)', 'Absent (j)', 'Retards', 'Départs Anticipés', 'Heures'];
      const userRows = (reportData.users || []).map(u => [
        u.user_name,
        u.department,
        u.profession || '',
        u.present_days,
        u.absent_days,
        u.late_arrivals,
        u.early_departures,
        u.total_work_hours,
      ]);
      const wsDetails = XLSX.utils.aoa_to_sheet([headerRow, ...userRows]);
      wsDetails['!cols'] = [
        { wch: 25 }, { wch: 20 }, { wch: 20 },
        { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Détails Employés');
    }

    // Generate binary
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  };

  // Generate a .doc blob (HTML-based, Word opens natively with .doc extension)
  const generateDocxBlob = (reportData: ReportData): Blob => {
    let html = '\uFEFF'; // BOM for proper UTF-8 handling
    html += `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"><style>`;
    html += `body { font-family: Calibri, sans-serif; font-size: 9pt; }`; // Reduced from 11pt to 9pt
    html += `table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }`;
    html += `th, td { border: 1px solid #999; padding: 4px 5px; text-align: left; }`; // Reduced padding
    html += `th { background-color: #4472C4; color: white; font-weight: bold; }`;
    html += `tr:nth-child(even) { background-color: #D9E2F3; }`;
    html += `h1 { color: #2F5496; border-bottom: 2px solid #4472C4; padding-bottom: 6px; }`;
    html += `h2 { color: #2F5496; margin-top: 20px; }`;
    html += `</style></head><body>`;
    html += `<h1>Rapport ${reportData.type || 'attendance'}</h1>`;
    html += `<p><strong>Période:</strong> ${reportData.period}</p>`;
    html += `<p><strong>Généré le:</strong> ${reportData.generated_at}</p>`;

    if (reportData.type === 'attendance') {
      html += `<h2>Détails Présence</h2>`;
      html += `<table><tr><th>Date</th><th>Nom</th><th>Email</th><th>Département</th><th>Entrée</th><th>Sortie</th><th>Statut</th><th>Méthode</th></tr>`;
      (reportData.attendance_logs || []).forEach(l => {
        const inStr = l.check_in_time ? new Date(l.check_in_time).toLocaleTimeString() : '--:--';
        const outStr = l.check_out_time ? new Date(l.check_out_time).toLocaleTimeString() : '--:--';
        html += `<tr><td>${l.date}</td><td>${l.user_name}</td><td>${l.user_email}</td><td>${l.department}</td><td>${inStr}</td><td>${outStr}</td><td>${l.status}</td><td>${l.method}</td></tr>`;
      });
      html += `</table>`;
    } else if (reportData.type === 'planning') {
      html += `<h2>Détails Planning</h2>`;
      html += `<table><tr><th>Nom</th><th>Département</th><th>Date</th><th>Shift/Statut</th><th>Entrée</th><th>Sortie</th><th>Heures Prévues</th></tr>`;
      (reportData.users || []).forEach(u => {
        (u.daily_records || []).forEach(r => {
          const inStr = r.check_in ? new Date(r.check_in).toLocaleTimeString() : '--:--';
          const outStr = r.check_out ? new Date(r.check_out).toLocaleTimeString() : '--:--';
          const durStr = formatDuration(r.work_duration_hours);
          html += `<tr><td>${u.user_name}</td><td>${u.department}</td><td>${new Date(r.date).toLocaleDateString()}</td><td>${r.status}</td><td>${inStr}</td><td>${outStr}</td><td>${durStr}</td></tr>`;
        });
      });
      html += `</table>`;
    } else {
      html += `<h2>Résumé</h2>`;
      html += `<table><tr><th>Métrique</th><th>Valeur</th></tr>`;
      html += `<tr><td>Total employés</td><td>${reportData.summary?.total_users || 0}</td></tr>`;
      html += `<tr><td>Jours travaillés</td><td>${reportData.summary?.total_work_days || 0}</td></tr>`;
      html += `<tr><td>Taux présence</td><td>${reportData.summary?.average_attendance_rate || 0}%</td></tr>`;
      html += `<tr><td>Retards</td><td>${reportData.summary?.total_late_arrivals || 0}</td></tr>`;
      html += `<tr><td>Absences</td><td>${reportData.summary?.total_absences || 0}</td></tr>`;
      html += `</table>`;
      html += `<h2>Détails Employés</h2>`;
      html += `<table><tr><th>Nom</th><th>Département</th><th>Présence</th><th>Absent</th><th>Retards</th><th>Départs Anticipés</th><th>Heures</th></tr>`;
      (reportData.users || []).forEach(u => {
        html += `<tr><td>${u.user_name}</td><td>${u.department}</td><td>${u.present_days}j</td><td>${u.absent_days}j</td><td>${u.late_arrivals}</td><td>${u.early_departures}</td><td>${u.total_work_hours}</td></tr>`;
      });
      html += `</table>`;
    }

    html += `</body></html>`;
    return new Blob([html], { type: 'application/msword' });
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

    // Since we don't store the requested department in the returned ReportData explicitly,
    // we'll try to guess it from the title or default to 'all' if we can't figure it out, 
    // to avoid touching the backend API types again, or use the general 'all'.
    let determinedDepartment = 'all';
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      const potentialDeptStr = parts[parts.length - 1].trim();
      // format is like: "Rapport Aujourd'hui - IT" or "Présence - Globale (month)"
      let possibleDept = potentialDeptStr.split(' (')[0].trim();
      if (possibleDept !== 'Globale' && possibleDept !== '') {
        determinedDepartment = possibleDept;
      }
    }

    return {
      type: data.type || 'attendance',
      format: selectedFormat,
      start_date: startDate,
      end_date: endDate,
      department: determinedDepartment
    };
  };

  const getFilenameContext = () => {
    const employeeName = isPersonalEmployee && data?.users?.[0]
      ? data.users[0].user_name
      : undefined;
    return {
      employeeName,
      companyName: settings?.company_name,
      department: data?.users?.[0]?.department,
    };
  };

  const handleSaveAndDownload = async () => {
    if (!data || !onSave) return;
    setIsPreparingDownload(true);
    try {
      const blob = await generateBlob();
      if (blob) {
        const meta = getMetadata();
        const filename = generateReportFilename(
          meta.type,
          meta.format as 'pdf',
          meta.start_date,
          meta.end_date,
          getFilenameContext()
        );

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
        const filename = generateReportFilename(
          meta.type,
          meta.format as 'pdf',
          meta.start_date,
          meta.end_date,
          getFilenameContext()
        );
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
        {data ? (
          data.type === 'planning' ? (
            <PlanningHTMLPreview data={data} />
          ) : data.type === 'attendance' ? (
            <AttendanceLogsHTMLPreview data={data} />
          ) : isPersonalEmployee ? (
            <PersonalEmployeeHTMLPreview data={data.users[0]} period={data.period} />
          ) : pdfDoc ? ( // For generic summary and others, if pdfDoc is ready, show PDFViewer
            <PDFViewer width="100%" height="400px" style={{ border: 'none' }}>
              {pdfDoc}
            </PDFViewer>
          ) : ( // Fallback for generic attendance if pdfDoc not ready
            <PaperPreview>
              <div style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>{settings?.company_name}</div>
              <div style={{ color: "var(--color-grey-500)" }}>Aperçu: {title}</div>
              <PaperLine width="100%" />
              <PaperLine width="80%" />
              <PaperLine width="90%" />
              <div style={{ marginTop: "1rem" }}>
                <i>Généré le: {new Date(data.generated_at).toLocaleString("fr-FR")}</i>
              </div>
            </PaperPreview>
          )
        ) : ( // If no data at all
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

        {data && (pdfDoc || selectedFormat !== 'pdf') ? (
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <FormatSelect value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as any)}>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="docx">Word (DOCX)</option>
            </FormatSelect>
            <Button onClick={handleDownloadClick} disabled={isPreparingDownload}>
              {isPreparingDownload ? "Préparation..." : <> <HiArrowDownTray /> Télécharger </>}
            </Button>
          </div>
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
