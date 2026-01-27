import { useState } from "react";
import styled, { css } from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import ReportGenerator from "../features/reports/ReportGenerator";
import QuickReports from "../features/reports/QuickReports";
import { useReports } from "../features/reports/useReports";
import { ReportFilterState } from "../services/types/api-types";
import { HiBolt, HiAdjustmentsHorizontal } from "react-icons/hi2";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 2rem;
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-grey-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s;

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-grey-50);
  }

  ${props => props.$active && css`
    border-color: var(--color-brand-600);
    color: var(--color-brand-600);
  `}
`;

export default function Reports() {
    const { generate, isGenerating, reportData } = useReports();
    const [activeTab, setActiveTab] = useState<'quick' | 'advanced'>('quick');

    const handleGenerate = (filters: ReportFilterState) => {
        generate({
            type: filters.type,
            start_date: filters.dateRange.start.toISOString().slice(0, 10),
            end_date: filters.dateRange.end.toISOString().slice(0, 10),
            department: filters.department,
        });
    };

    return (
        <Container>
            <Row type="horizontal">
                <Heading as="h1">Rapports & Exports</Heading>
            </Row>

            <TabsContainer>
                <Tab
                    $active={activeTab === 'quick'}
                    onClick={() => setActiveTab('quick')}
                >
                    <HiBolt /> Rapides
                </Tab>
                <Tab
                    $active={activeTab === 'advanced'}
                    onClick={() => setActiveTab('advanced')}
                >
                    <HiAdjustmentsHorizontal /> Avancé
                </Tab>
            </TabsContainer>

            {activeTab === 'quick' && (
                <QuickReports />
            )}

            {activeTab === 'advanced' && (
                <div style={{ maxWidth: '800px' }}>
                    <p style={{ marginBottom: '1.6rem', color: 'var(--color-grey-500)' }}>
                        Configurez des filtres précis pour générer des rapports spécifiques.
                    </p>
                    <ReportGenerator
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        reportData={reportData}
                    />
                </div>
            )}

        </Container>
    );
}
