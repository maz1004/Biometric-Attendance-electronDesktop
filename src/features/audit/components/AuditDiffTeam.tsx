import styled from "styled-components";
import { useEmployees } from "../../employees/useEmployees";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const TeamName = styled.h4`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin: 0;
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ColumnHeader = styled.div<{ $variant: 'before' | 'after' }>`
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.6rem 1rem;
  border-radius: var(--border-radius-sm);
  background: ${({ $variant }) => $variant === 'before' ? '#fef2f2' : '#f0fdf4'};
  color: ${({ $variant }) => $variant === 'before' ? '#dc2626' : '#16a34a'};
`;

const MemberItem = styled.div<{ $status: 'added' | 'removed' | 'unchanged' }>`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.3rem;
  border-left: 3px solid ${({ $status }) =>
        $status === 'added' ? '#16a34a' :
            $status === 'removed' ? '#dc2626' :
                'var(--color-grey-300)'};
  background: ${({ $status }) =>
        $status === 'added' ? '#f0fdf4' :
            $status === 'removed' ? '#fef2f2' :
                'var(--color-grey-50)'};
  color: ${({ $status }) =>
        $status === 'added' ? '#15803d' :
            $status === 'removed' ? '#b91c1c' :
                'var(--color-grey-700)'};
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const StatusIcon = styled.span<{ $status: 'added' | 'removed' | 'unchanged' }>`
  font-size: 1rem;
  font-weight: 700;
`;

const EmptyMsg = styled.span`
  color: var(--color-grey-400);
  font-style: italic;
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
`;

interface TeamMember {
    id?: string;
    name?: string;
    user_name?: string;
    email?: string;
}

interface TeamData {
    name?: string;
    team_name?: string;
    members?: TeamMember[];
    user_ids?: string[];
}

interface AuditDiffTeamProps {
    beforeData: string;
    afterData: string;
}

function getMemberName(m: TeamMember): string {
    return m.name || m.user_name || m.email || m.id || '—';
}

function getMemberIds(data: TeamData): string[] {
    if (data.members && data.members.length > 0) {
        return data.members.map(m => m.id || getMemberName(m));
    }
    if (data.user_ids) return data.user_ids;
    return [];
}

function getMemberNameById(data: TeamData, id: string): string {
    const member = data.members?.find(m => m.id === id || getMemberName(m) === id);
    return member ? getMemberName(member) : id;
}

export default function AuditDiffTeam({ beforeData, afterData }: AuditDiffTeamProps) {
    const { employees } = useEmployees({ limit: 1000 }); // Try fetching employees to resolve legacy IDs

    let before: TeamData = {};
    let after: TeamData = {};

    try { before = JSON.parse(beforeData); } catch { /* empty */ }
    try { after = JSON.parse(afterData); } catch { /* empty */ }

    const getRealName = (id: string, fallbackName: string): string => {
        if (fallbackName && fallbackName !== id && fallbackName !== '—') return fallbackName;
        const emp = employees?.find(e => e.id === id);
        return emp ? `${emp.firstName} ${emp.lastName}` : id;
    };

    const teamName = after.name || after.team_name || before.name || before.team_name || 'Équipe';
    const beforeIds = new Set(getMemberIds(before));
    const afterIds = new Set(getMemberIds(after));

    // Members in before list
    const beforeMembers = Array.from(beforeIds).map(id => ({
        id,
        name: getRealName(id, getMemberNameById(before, id)),
        status: afterIds.has(id) ? 'unchanged' as const : 'removed' as const,
    }));

    // Members in after list
    const afterMembers = Array.from(afterIds).map(id => ({
        id,
        name: getRealName(id, getMemberNameById(after, id)),
        status: beforeIds.has(id) ? 'unchanged' as const : 'added' as const,
    }));

    return (
        <Container>
            <TeamName>🏷️ {teamName}</TeamName>
            <ColumnsGrid>
                <Column>
                    <ColumnHeader $variant="before">🔴 Avant ({beforeMembers.length} membres)</ColumnHeader>
                    {beforeMembers.length === 0 ? (
                        <EmptyMsg>Aucun membre</EmptyMsg>
                    ) : (
                        beforeMembers.map((m, i) => (
                            <MemberItem key={i} $status={m.status}>
                                <StatusIcon $status={m.status}>
                                    {m.status === 'removed' ? '✕' : '•'}
                                </StatusIcon>
                                {m.name}
                            </MemberItem>
                        ))
                    )}
                </Column>
                <Column>
                    <ColumnHeader $variant="after">🟢 Après ({afterMembers.length} membres)</ColumnHeader>
                    {afterMembers.length === 0 ? (
                        <EmptyMsg>Aucun membre</EmptyMsg>
                    ) : (
                        afterMembers.map((m, i) => (
                            <MemberItem key={i} $status={m.status}>
                                <StatusIcon $status={m.status}>
                                    {m.status === 'added' ? '✓' : '•'}
                                </StatusIcon>
                                {m.name}
                            </MemberItem>
                        ))
                    )}
                </Column>
            </ColumnsGrid>
        </Container>
    );
}
