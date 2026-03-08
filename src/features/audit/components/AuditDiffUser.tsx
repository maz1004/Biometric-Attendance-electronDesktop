import styled from "styled-components";

// Map field keys to French labels
const FIELD_LABELS: Record<string, string> = {
    first_name: "Prénom",
    last_name: "Nom",
    email: "Email",
    role: "Rôle",
    department: "Département",
    profession: "Poste",
    phone_number: "Téléphone",
    is_active: "Actif",
    hire_date: "Date d'embauche",
    date_of_birth: "Date de naissance",
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.8rem 1rem;
  background: var(--color-grey-100);
  color: var(--color-grey-600);
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid var(--color-grey-200);
`;

const Td = styled.td`
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--color-grey-100);
  color: var(--color-grey-800);
  vertical-align: middle;
`;

const ValueBefore = styled.span`
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-sm);
  text-decoration: line-through;
  font-size: 1.2rem;
`;

const ValueAfter = styled.span`
  background-color: #f0fdf4;
  color: #16a34a;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.2rem;
`;

const Arrow = styled.span`
  color: var(--color-grey-400);
  margin: 0 0.6rem;
  font-size: 1.4rem;
`;

const EmptyValue = styled.span`
  color: var(--color-grey-400);
  font-style: italic;
  font-size: 1.2rem;
`;

interface AuditDiffUserProps {
    beforeData: string;
    afterData: string;
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined || val === "") return "(vide)";
    if (typeof val === "boolean") return val ? "Oui" : "Non";
    return String(val);
}

export default function AuditDiffUser({ beforeData, afterData }: AuditDiffUserProps) {
    let before: Record<string, unknown> = {};
    let after: Record<string, unknown> = {};

    try { before = JSON.parse(beforeData); } catch { /* empty */ }
    try { after = JSON.parse(afterData); } catch { /* empty */ }

    // Collect all changed fields
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changedFields = Array.from(allKeys).filter(key => {
        return JSON.stringify(before[key]) !== JSON.stringify(after[key]);
    });

    if (changedFields.length === 0) {
        return <EmptyValue>Aucun changement détecté</EmptyValue>;
    }

    return (
        <Table>
            <thead>
                <tr>
                    <Th>Champ</Th>
                    <Th>Avant</Th>
                    <Th></Th>
                    <Th>Après</Th>
                </tr>
            </thead>
            <tbody>
                {changedFields.map((key) => {
                    const label = FIELD_LABELS[key] || key;
                    const beforeVal = formatValue(before[key]);
                    const afterVal = formatValue(after[key]);
                    return (
                        <tr key={key}>
                            <Td style={{ fontWeight: 600 }}>{label}</Td>
                            <Td>
                                <ValueBefore>{beforeVal}</ValueBefore>
                            </Td>
                            <Td style={{ textAlign: 'center', width: '3rem' }}>
                                <Arrow>→</Arrow>
                            </Td>
                            <Td>
                                <ValueAfter>{afterVal}</ValueAfter>
                            </Td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}
