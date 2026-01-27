import { useState, useEffect } from "react";
import styled from "styled-components";
import SelectUi from "../../ui/Select"; // Use the styled UI component
import { ReportFilterState, ReportType, ReportPeriod, ReportData } from "../../services/types/api-types";
import { ReportActionPanel } from "./components/ReportActionPanel";

const Container = styled.div`
  background: var(--color-bg-elevated);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const InlineFilters = styled.div`
  display: flex;
  gap: 1.6rem;
  align-items: flex-end; /* Align inputs/selects by bottom */
  flex-wrap: wrap;
`;

const FormGroup = styled.div<{ $flex?: number; $minWidth?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: ${props => props.$flex || 'initial'};
  min-width: ${props => props.$minWidth || '150px'};
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text-strong);
  font-size: 1.4rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  color: var(--color-text-strong);
  font-size: 1.4rem;
`;

interface ReportGeneratorProps {
    onGenerate: (filters: ReportFilterState) => void;
    isGenerating: boolean;
    reportData?: ReportData | null;
}

export default function ReportGenerator({ onGenerate, isGenerating, reportData }: ReportGeneratorProps) {
    const [type, setType] = useState<ReportType>("attendance");
    const [period, setPeriod] = useState<ReportPeriod>("month");
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [department, setDepartment] = useState("all");

    // "Live" preview title
    const [previewTitle, setPreviewTitle] = useState("");

    useEffect(() => {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        const depLabel = department === 'all' ? 'Globale' : department;
        setPreviewTitle(`${typeLabel} - ${depLabel} (${period})`);
    }, [type, period, department, startDate, endDate]);

    // Live Data Fetch: Debounce generation when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSubmit();
        }, 800); // 800ms delay to avoid spamming while typing/picking

        return () => clearTimeout(timer);
    }, [type, period, startDate, endDate, department]);

    const handleSubmit = () => {
        onGenerate({
            type,
            period,
            dateRange: {
                start: new Date(startDate),
                end: new Date(endDate),
            },
            department,
        });
    };

    return (
        <Container>
            <InlineFilters>
                <FormGroup $flex={2} $minWidth="200px">
                    <Label>Type de Rapport</Label>
                    <SelectUi
                        options={[
                            { value: "attendance", label: "Présence" },
                            { value: "performance", label: "Performance" },
                            { value: "planning", label: "Planning" },
                            { value: "summary", label: "Résumé" }
                        ]}
                        value={type}
                        onChange={(e) => setType(e.target.value as ReportType)}
                    />
                </FormGroup>

                <FormGroup $flex={2} $minWidth="180px">
                    <Label>Département</Label>
                    <SelectUi
                        options={[
                            { value: "all", label: "Tous Départements" },
                            { value: "R&D", label: "R&D" },
                            { value: "Operations", label: "Opérations" },
                            { value: "Design", label: "Design" },
                            { value: "QA", label: "QA" },
                            { value: "HR", label: "RH" }
                        ]}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                </FormGroup>

                <FormGroup $flex={1} $minWidth="120px">
                    <Label>Période</Label>
                    <SelectUi
                        options={[
                            { value: "day", label: "Jour" },
                            { value: "week", label: "Semaine" },
                            { value: "month", label: "Mois" },
                            { value: "year", label: "Année" }
                        ]}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                    />
                </FormGroup>
            </InlineFilters>

            <InlineFilters>
                <FormGroup $flex={1}>
                    <Label>Date Début</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </FormGroup>

                <FormGroup $flex={1}>
                    <Label>Date Fin</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </FormGroup>
            </InlineFilters>

            <ReportActionPanel
                title={previewTitle}
                description="Aperçu généré en temps réel basé sur vos filtres."
                onGenerate={handleSubmit}
                onCancel={() => { }}
                isGenerating={isGenerating}
                data={reportData}
            />
        </Container>
    );
}
