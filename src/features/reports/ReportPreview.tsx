import styled from "styled-components";
import { ReportData } from "../../services/reports";
import Button from "../../ui/Button";
import { HiDownload } from "react-icons/hi";

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

interface ReportPreviewProps {
    data: ReportData;
    onDownload: (format: "pdf" | "excel") => void;
    isDownloading: boolean;
}

export default function ReportPreview({ data, onDownload, isDownloading }: ReportPreviewProps) {
    if (!data) return null;

    return (
        <Container>
            <Header>
                <Title>Report Preview - {data.report_type}</Title>
                <div style={{ display: "flex", gap: "0.8rem" }}>
                    <Button variation="secondary" size="small" onClick={() => onDownload("excel")} disabled={isDownloading}>
                        <HiDownload /> Excel
                    </Button>
                    <Button variation="primary" size="small" onClick={() => onDownload("pdf")} disabled={isDownloading}>
                        <HiDownload /> PDF
                    </Button>
                </div>
            </Header>

            <div>
                <p><strong>Period:</strong> {data.period.start_date} to {data.period.end_date}</p>
            </div>

            <SummaryGrid>
                <SummaryCard>
                    <SummaryLabel>Total Records</SummaryLabel>
                    <SummaryValue>{data.summary.total_records}</SummaryValue>
                </SummaryCard>
                {/* Display other summary fields dynamically */}
                {Object.entries(data.summary).map(([key, value]) => {
                    if (key === 'total_records') return null;
                    return (
                        <SummaryCard key={key}>
                            <SummaryLabel>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SummaryLabel>
                            <SummaryValue>{typeof value === 'number' ? value : String(value)}</SummaryValue>
                        </SummaryCard>
                    );
                })}
            </SummaryGrid>

            {/* Placeholder for detailed table or chart */}
            <div style={{ marginTop: "1rem", color: "var(--color-text-dim)", fontStyle: "italic" }}>
                Detailed data visualization would go here (Table/Chart).
            </div>
        </Container>
    );
}
