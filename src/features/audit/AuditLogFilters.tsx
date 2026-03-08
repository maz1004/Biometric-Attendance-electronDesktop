import styled from "styled-components";
import MultiSelectMenu from "../../ui/MultiSelectMenu";
import { useEmployees } from "../employees/useEmployees";

const FiltersContainer = styled.div`
  display: flex;
  gap: 1.6rem;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 1.6rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  margin-bottom: 1.6rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FilterLabel = styled.label`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DisabledOverlay = styled.div`
  opacity: 0.4;
  pointer-events: none;
`;

// Action categories with their corresponding backend action strings
const ACTION_OPTIONS = [
    { value: "planning", label: "Planning" },
    { value: "employee", label: "Employé" },
    { value: "reports", label: "Rapports" },
    { value: "connection", label: "Connexion" },
    { value: "validation", label: "Validation Manuelle" },
    { value: "device", label: "Gestion Device" },
    { value: "settings", label: "Paramètres Généraux" },
];

const CRUD_OPTIONS = [
    { value: "CREATE", label: "Création" },
    { value: "UPDATE", label: "Modification" },
    { value: "DELETE", label: "Suppression" },
];

// Map action category to backend action strings
export const ACTION_CATEGORY_MAP: Record<string, string[]> = {
    planning: ["MODEL_CREATE", "MODEL_UPDATE", "MODEL_DELETE", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_ADD_MEMBER", "TEAM_REMOVE_MEMBER", "ASSIGNMENT_CREATE", "ASSIGNMENT_DELETE", "ASSIGNMENT_BATCH_CREATE", "PLANNING_CREATE_EXCEPTION", "PLANNING_DELETE_EXCEPTION", "PLANNING_CREATE_HOLIDAY", "PLANNING_DELETE_HOLIDAY"],
    employee: ["CREATE_ADMIN", "CREATE_EMPLOYEE", "UPDATE_USER", "DELETE_USER", "TOGGLE_STATUS", "RESET_PASSWORD", "ATTENDANCE_CREATE_JUSTIFICATION", "ATTENDANCE_UPDATE_JUSTIFICATION", "ATTENDANCE_DELETE_JUSTIFICATION"],
    reports: ["REPORT_GENERATE", "REPORT_UPDATE", "REPORT_DELETE", "REPORT_RENAME"],
    connection: ["LOGIN", "LOGOUT", "LOGIN_FAILED"],
    validation: ["ATTENDANCE_VALIDATE", "ATTENDANCE_REJECT"],
    device: ["DEVICE_REGISTER", "DEVICE_UPDATE", "DEVICE_DELETE", "DEVICE_BLACKLISTED", "DEVICE_WHITELISTED"],
    settings: ["SETTINGS_UPDATE"],
};

interface AuditLogFiltersProps {
    selectedActions: string[];
    onActionsChange: (values: string[]) => void;
    selectedCrud: string[];
    onCrudChange: (values: string[]) => void;
    selectedManagers: string[];
    onManagersChange: (values: string[]) => void;
}

export default function AuditLogFilters({
    selectedActions,
    onActionsChange,
    selectedCrud,
    onCrudChange,
    selectedManagers,
    onManagersChange,
}: AuditLogFiltersProps) {
    const { employees } = useEmployees({ limit: 1000, role: "admin" });

    // Mutual exclusion: if "connection" is selected, disable CRUD filter
    const isConnectionSelected = selectedActions.includes("connection");

    // Build manager options from admin/manager employees
    const managerOptions = employees
        .filter(e => e.role === "admin" || e.role === "rh" || e.role === "manager")
        .map(e => ({
            value: e.id,
            label: `${e.firstName} ${e.lastName}`,
        }));

    return (
        <FiltersContainer>
            <FilterGroup>
                <FilterLabel>Actions</FilterLabel>
                <MultiSelectMenu
                    options={ACTION_OPTIONS}
                    values={selectedActions}
                    onChange={onActionsChange}
                    width="22rem"
                    placeholder="Toutes les actions"
                />
            </FilterGroup>

            <FilterGroup>
                <FilterLabel>Requêtes (CRUD)</FilterLabel>
                {isConnectionSelected ? (
                    <DisabledOverlay>
                        <MultiSelectMenu
                            options={CRUD_OPTIONS}
                            values={[]}
                            onChange={() => { }}
                            width="18rem"
                            placeholder="Désactivé (Connexion)"
                        />
                    </DisabledOverlay>
                ) : (
                    <MultiSelectMenu
                        options={CRUD_OPTIONS}
                        values={selectedCrud}
                        onChange={onCrudChange}
                        width="18rem"
                        placeholder="Toutes les requêtes"
                    />
                )}
            </FilterGroup>

            <FilterGroup>
                <FilterLabel>Manager</FilterLabel>
                <MultiSelectMenu
                    options={managerOptions}
                    values={selectedManagers}
                    onChange={onManagersChange}
                    width="22rem"
                    placeholder="Tous les managers"
                />
            </FilterGroup>
        </FiltersContainer>
    );
}
