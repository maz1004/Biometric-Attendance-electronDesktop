import { useState, useEffect } from "react";
import styled from "styled-components";
import SelectUi from "../../ui/Select"; // Use the styled UI component
import SelectMenu from "../../ui/SelectMenu";
import { ReportFilterState, ReportType, ReportData } from "../../services/types/api-types";
import { ReportActionPanel } from "./components/ReportActionPanel";
import { useReports } from "./useReports";
import { useEmployees } from "../employees/useEmployees";
import { useQuery } from "@tanstack/react-query";
import { PlanningService } from "../../services/planning";
import MultiSelectMenu from "../../ui/MultiSelectMenu";

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
    initialFilters?: Partial<ReportFilterState>;
}

export default function ReportGenerator({ onGenerate, isGenerating, reportData, initialFilters }: ReportGeneratorProps) {
    const { save, isSaving } = useReports();

    const [type, setType] = useState<ReportType>(initialFilters?.type || "attendance");
    const [scope, setScope] = useState<'all' | 'teams' | 'individuals' | 'employee'>(initialFilters?.scope || 'all');
    const [startDate, setStartDate] = useState(initialFilters?.dateRange?.start.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(initialFilters?.dateRange?.end.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10));
    const [employeeId, setEmployeeId] = useState<string | undefined>(initialFilters?.employee_id);
    const [teamIds, setTeamIds] = useState<string[]>(initialFilters?.team_ids || []);
    const [userIds, setUserIds] = useState<string[]>(initialFilters?.user_ids || []);
    const [department, setDepartment] = useState<string>(initialFilters?.department || "all");
    const [status, setStatus] = useState<string>(initialFilters?.status || "all");

    const { employees } = useEmployees({ limit: 1000 });
    const { data: teamsData } = useQuery({ queryKey: ['planning-teams'], queryFn: PlanningService.getTeams });
    const teams = teamsData?.teams || [];
    const uniqueDepartments = Array.from(new Set(employees.map(t => t.department).filter(Boolean)));

    // Fetch all effective assignments for the selected period to accurately determine assigned users
    const { data: assignmentsData } = useQuery({
        queryKey: ['planning-assignments', startDate, endDate],
        queryFn: () => PlanningService.getAssignments(startDate, endDate),
        enabled: type === 'planning'
    });

    // Precalculate assigned users for warnings in Planning mode based on actual schedules
    const assignedUserIds = new Set<string>();
    if (type === 'planning' && assignmentsData?.data) {
        assignmentsData.data.forEach(a => assignedUserIds.add(a.userId));
    }

    // Update state when initialFilters changes (e.g. from history preview)
    useEffect(() => {
        if (initialFilters) {
            if (initialFilters.type) setType(initialFilters.type);
            if (initialFilters.scope) setScope(initialFilters.scope);
            if (initialFilters.dateRange) {
                setStartDate(initialFilters.dateRange.start.toISOString().slice(0, 10));
                setEndDate(initialFilters.dateRange.end.toISOString().slice(0, 10));
            }
            if (initialFilters.employee_id) setEmployeeId(initialFilters.employee_id);
            if (initialFilters.team_ids) setTeamIds(initialFilters.team_ids);
            if (initialFilters.user_ids) setUserIds(initialFilters.user_ids);
            if (initialFilters.department) setDepartment(initialFilters.department);
            if (initialFilters.status) setStatus(initialFilters.status);
        }
    }, [initialFilters]);

    // "Live" preview title
    const [previewTitle, setPreviewTitle] = useState("");

    useEffect(() => {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        let scopeLabel = "Globale";
        if (scope === "teams") scopeLabel = `${teamIds.length} Équipe(s)`;
        if (scope === "individuals") scopeLabel = `${userIds.length} Individus`;
        if (scope === "employee" && employeeId) scopeLabel = `1 Employé`;

        setPreviewTitle(`${typeLabel} - ${scopeLabel} (${startDate} au ${endDate})`);
    }, [type, scope, teamIds, userIds, employeeId, startDate, endDate]);

    // Live Data Fetch: Debounce generation when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSubmit();
        }, 800); // 800ms delay to avoid spamming while typing/picking

        return () => clearTimeout(timer);
    }, [type, scope, startDate, endDate, teamIds, userIds, employeeId, department, status]);

    const handleSubmit = () => {
        onGenerate({
            type,
            scope,
            dateRange: {
                start: new Date(startDate),
                end: new Date(endDate),
            },
            department: (type === 'attendance' || type === 'summary') ? department : "all",
            status: (type === 'attendance' || type === 'summary') ? status : undefined,
            employee_id: scope === 'employee' ? employeeId : undefined,
            team_ids: scope === 'teams' ? teamIds : undefined,
            user_ids: scope === 'individuals' ? userIds : undefined,
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
                            { value: "planning", label: "Planning" },
                            { value: "summary", label: "Résumé" },
                            { value: "personal_employee", label: "Employé (Personnalisé)" }
                        ]}
                        value={type}
                        onChange={(e) => setType(e.target.value as ReportType)}
                    />
                </FormGroup>

                {type !== 'attendance' && (
                    <FormGroup $flex={2} $minWidth="180px">
                        <Label>Cible (Scope)</Label>
                        <SelectUi
                            options={[
                                { value: "all", label: "Tous (Globale)" },
                                { value: "teams", label: "Équipes" },
                                { value: "individuals", label: "Individus multiples" },
                                { value: "employee", label: "Employé spécifique" }
                            ]}
                            value={scope}
                            onChange={(e) => setScope(e.target.value as any)}
                        />
                    </FormGroup>
                )}

                {type !== 'attendance' && scope === "employee" && (
                    <FormGroup $flex={2} $minWidth="200px">
                        <Label>Employé</Label>
                        <SelectMenu
                            options={[
                                { value: "", label: "Sélectionnez un employé..." },
                                ...employees.map(emp => ({
                                    value: emp.id,
                                    label: `${emp.firstName} ${emp.lastName} (${emp.profession || 'Sans profession'})`
                                }))
                            ]}
                            value={employeeId || ""}
                            onChange={(val) => setEmployeeId(val)}
                            width="100%"
                        />
                    </FormGroup>
                )}

                {type !== 'attendance' && scope === "teams" && (
                    <FormGroup $flex={2} $minWidth="200px">
                        <Label>Équipes</Label>
                        <MultiSelectMenu
                            options={teams.map(t => ({ value: t.id, label: t.name }))}
                            values={teamIds}
                            onChange={setTeamIds}
                            placeholder="Sélectionner équipes..."
                            width="100%"
                        />
                    </FormGroup>
                )}

                {type !== 'attendance' && scope === "individuals" && (
                    <FormGroup $flex={2} $minWidth="200px">
                        <Label>Employés</Label>
                        <MultiSelectMenu
                            options={employees.map(emp => {
                                const isUnassigned = type === "planning" && !assignedUserIds.has(emp.id);
                                return {
                                    value: emp.id,
                                    label: `${emp.firstName} ${emp.lastName}`,
                                    hasWarning: isUnassigned,
                                    warningMessage: isUnassigned ? "Cet employé n'est assigné à aucun modèle de planning et n'apparaîtra pas dans le rapport." : undefined
                                };
                            })}
                            values={userIds}
                            onChange={setUserIds}
                            placeholder="Sélectionner employés..."
                            width="100%"
                        />
                    </FormGroup>
                )}
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

                {(type === 'attendance' || type === 'summary') && (
                    <FormGroup $flex={1.5}>
                        <Label>Département</Label>
                        <SelectUi
                            options={[
                                { value: "all", label: "Tous" },
                                ...uniqueDepartments.map(dept => ({ value: dept, label: dept }))
                            ]}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </FormGroup>
                )}

                {(type === 'attendance' || type === 'summary') && (
                    <FormGroup $flex={1.5}>
                        <Label>Statut</Label>
                        <SelectUi
                            options={[
                                { value: "all", label: "Tous" },
                                { value: "present", label: "Présent" },
                                { value: "absent", label: "Absent" },
                                { value: "late", label: "En retard" },
                                { value: "left_early", label: "Départ anticipé" },
                                { value: "manual", label: "Manuel" }
                            ]}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                    </FormGroup>
                )}
            </InlineFilters>

            <ReportActionPanel
                title={previewTitle}
                description="Aperçu généré en temps réel basé sur vos filtres."
                onGenerate={handleSubmit}
                onCancel={() => { }}
                isGenerating={isGenerating}
                data={reportData}
                onSave={save}
                isSaving={isSaving}
            />
        </Container >
    );
}
