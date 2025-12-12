import styled from "styled-components";
import { useState } from "react";
import Button from "../../ui/Button";
import { ReportFilterState, ReportType, ReportPeriod } from "./ReportsTypes";

const Container = styled.div`
  background: var(--color-bg-elevated);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-card);
  display: grid;
  gap: 1.6rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text-strong);
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--color-toolbar-input-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
`;

interface ReportGeneratorProps {
    onGenerate: (filters: ReportFilterState) => void;
    isGenerating: boolean;
}

export default function ReportGenerator({ onGenerate, isGenerating }: ReportGeneratorProps) {
    const [type, setType] = useState<ReportType>("attendance");
    const [period, setPeriod] = useState<ReportPeriod>("month");
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [department, setDepartment] = useState("all");

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
            <FormRow>
                <FormGroup>
                    <Label>Report Type</Label>
                    <Select value={type} onChange={(e) => setType(e.target.value as ReportType)}>
                        <option value="attendance">Attendance</option>
                        <option value="performance">Performance</option>
                        <option value="planning">Planning</option>
                        <option value="summary">Summary</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <Label>Department</Label>
                    <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="all">All Departments</option>
                        <option value="R&D">R&D</option>
                        <option value="Operations">Operations</option>
                        <option value="Design">Design</option>
                        <option value="QA">QA</option>
                        <option value="HR">HR</option>
                    </Select>
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label>Period</Label>
                    <Select value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)}>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    {/* Placeholder to balance grid */}
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </FormGroup>
            </FormRow>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleSubmit} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
            </div>
        </Container>
    );
}
