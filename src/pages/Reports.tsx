import styled from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import ReportGenerator from "../features/reports/ReportGenerator";
import ReportPreview from "../features/reports/ReportPreview";
import { useReports } from "../features/reports/useReports";
import { ReportFilterState } from "../features/reports/ReportsTypes";

const Section = styled.section`
  display: grid;
  gap: 2rem;
`;

export default function Reports() {
    const { generate, isGenerating, reportData, download, isDownloading } = useReports();

    const handleGenerate = (filters: ReportFilterState) => {
        generate({
            type: filters.type,
            start_date: filters.dateRange.start.toISOString().slice(0, 10),
            end_date: filters.dateRange.end.toISOString().slice(0, 10),
            department: filters.department,
        });
    };

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">Reports</Heading>
            </Row>
            <Section>
                <ReportGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
                {reportData && (
                    <ReportPreview
                        data={reportData}
                        onDownload={(format) => download(format)}
                        isDownloading={isDownloading}
                    />
                )}
            </Section>
        </>
    );
}
