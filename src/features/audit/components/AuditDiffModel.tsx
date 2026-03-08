import { useState } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../../services/users";
import { PlanningService } from "../../../services/planning";
import { HiXMark } from "react-icons/hi2";

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const SectionLabel = styled.div<{ $variant: 'before' | 'after' }>`
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.6rem 1rem;
  border-radius: var(--border-radius-sm);
  background: ${({ $variant }) => $variant === 'before' ? '#fef2f2' : '#f0fdf4'};
  color: ${({ $variant }) => $variant === 'before' ? '#dc2626' : '#16a34a'};
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-grey-500);
  padding: 0.4rem;
`;

const DayCell = styled.div<{ $changed: boolean; $isOff: boolean }>`
  position: relative;
  text-align: center;
  padding: 0.6rem 0.3rem;
  border-radius: var(--border-radius-sm);
  font-size: 1.1rem;
  cursor: default;
  border: 2px solid ${({ $changed }) => $changed ? '#f59e0b' : 'var(--color-grey-200)'};
  background: ${({ $isOff }) => $isOff ? 'var(--color-grey-100)' : 'var(--color-grey-0)'};
  color: ${({ $isOff }) => $isOff ? 'var(--color-grey-400)' : 'var(--color-grey-800)'};
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    z-index: 2;
  }
`;

const ShiftLabel = styled.div<{ $clickable?: boolean }>`
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
`;

const ShiftTime = styled.div<{ $clickable?: boolean }>`
  font-size: 0.9rem;
  color: var(--color-grey-500);
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
`;


// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; // Higher than the main audit modal
`;

const ModalContent = styled.div`
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  width: 90%;
  max-width: 600px;
  box-shadow: var(--shadow-lg);
  max-height: 85vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-grey-500);
  padding: 0.4rem;
  &:hover { color: var(--color-grey-800); }
`;

const DetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.2rem;
  
  th, td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-grey-200);
    text-align: left;
  }
  
  th {
    color: var(--color-grey-600);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 1.1rem;
    letter-spacing: 0.05em;
  }
  
  td {
    color: var(--color-grey-800);
  }
`;

const ChangeBadge = styled.span<{ $status: 'added' | 'removed' | 'modified' | 'unchanged' }>`
  padding: 0.3rem 0.8rem;
  border-radius: 100px;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  background: ${({ $status }) =>
        $status === 'added' ? '#dcfce7' :
            $status === 'removed' ? '#fee2e2' :
                $status === 'modified' ? '#fef3c7' : 'var(--color-grey-100)'};
  color: ${({ $status }) =>
        $status === 'added' ? '#16a34a' :
            $status === 'removed' ? '#dc2626' :
                $status === 'modified' ? '#d97706' : 'var(--color-grey-600)'};
`;

const DeptTag = styled.span`
  display: inline-block;
  font-size: 1rem;
  color: var(--color-grey-500);
  margin-top: 0.2rem;
`;

interface RawSlot {
    assigned_type?: 'team' | 'employee';
    assigned_id?: string;
    start?: string;
    end?: string;
}

interface DayShift {
    name?: string;
    label?: string;
    start?: string;
    end?: string;
    is_off?: boolean;
    is_day_off?: boolean;
}

interface ModelData {
    name?: string;
    model_name?: string;
    days?: Record<string, DayShift> | DayShift[] | Record<string, RawSlot[]> | RawSlot[][];
    shifts?: Record<string, DayShift> | DayShift[] | Record<string, RawSlot[]> | RawSlot[][];
}

interface AuditDiffModelProps {
    beforeData: string;
    afterData: string;
}

function getRawSlotsForDay(data: ModelData, dayIndex: number): RawSlot[] {
    const source = data.days || data.shifts;
    if (!source) return [];
    if (Array.isArray(source)) {
        return (source[dayIndex] as any) || [];
    }
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const val = source[dayKeys[dayIndex] as keyof typeof source];
    if (Array.isArray(val)) return val as RawSlot[];
    return [];
}

function DayDetailsModal({
    dayName,
    beforeSlots,
    afterSlots,
    onClose,
    users,
    teams
}: {
    dayName: string,
    beforeSlots: RawSlot[],
    afterSlots: RawSlot[],
    onClose: () => void,
    users: any[],
    teams: any[]
}) {
    const allSlots = new Map<string, { key: string, before: RawSlot | null, after: RawSlot | null, status: 'added' | 'removed' | 'modified' | 'unchanged' }>();

    beforeSlots.forEach(b => {
        // Create a unique key using id and times to handle duplicated assignments correctly
        const key = `${b.assigned_type}_${b.assigned_id}_${b.start}_${b.end}`;
        allSlots.set(key, { key, before: b, after: null, status: 'removed' });
    });

    afterSlots.forEach(a => {
        const exactKey = `${a.assigned_type}_${a.assigned_id}_${a.start}_${a.end}`;
        if (allSlots.has(exactKey)) {
            // Exact match found!
            allSlots.get(exactKey)!.after = a;
            allSlots.get(exactKey)!.status = 'unchanged';
        } else {
            // Check if there is an assignment for the SAME entity but DIFFERENT times
            let foundModified = false;
            for (const val of allSlots.values()) {
                if (val.status === 'removed' && val.before?.assigned_id === a.assigned_id && val.before?.assigned_type === a.assigned_type) {
                    val.after = a;
                    val.status = 'modified';
                    foundModified = true;
                    break;
                }
            }
            if (!foundModified) {
                allSlots.set(exactKey, { key: exactKey, before: null, after: a, status: 'added' });
            }
        }
    });

    const entries = Array.from(allSlots.values()).sort((a, b) => {
        // Sort by status
        const statusOrder = { 'added': 1, 'modified': 2, 'removed': 3, 'unchanged': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    const resolveName = (type?: string, id?: string) => {
        if (!id) return 'Inconnu';
        if (type === 'employee') {
            const u = users.find(x => x.id === id);
            if (!u) return id;
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
                    {u.department && <DeptTag>{u.department}</DeptTag>}
                </div>
            );
        }
        if (type === 'team') {
            const t = teams.find(x => x.id === id);
            if (!t) return id;
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>Équipe: {t.name}</span>
                    {t.department && <DeptTag>{t.department}</DeptTag>}
                </div>
            );
        }
        return id;
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Détails du {dayName}</ModalTitle>
                    <CloseButton onClick={onClose}><HiXMark size={24} /></CloseButton>
                </ModalHeader>

                {entries.length === 0 ? (
                    <p style={{ color: 'var(--color-grey-500)', fontSize: '1.2rem', padding: '2rem 0', textAlign: 'center' }}>Aucune assignation pour ce jour.</p>
                ) : (
                    <DetailsTable>
                        <thead>
                            <tr>
                                <th>Bénéficiaire</th>
                                <th>Créneau</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => {
                                const slot = entry.after || entry.before;
                                return (
                                    <tr key={idx}>
                                        <td>{resolveName(slot?.assigned_type, slot?.assigned_id)}</td>
                                        <td>
                                            {entry.status === 'modified' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    <span style={{ textDecoration: 'line-through', color: 'var(--color-grey-400)' }}>
                                                        {entry.before?.start} - {entry.before?.end}
                                                    </span>
                                                    <span style={{ fontWeight: 500, color: '#d97706' }}>
                                                        {entry.after?.start} - {entry.after?.end}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ fontWeight: 500 }}>{slot?.start} - {slot?.end}</span>
                                            )}
                                        </td>
                                        <td>
                                            <ChangeBadge $status={entry.status}>
                                                {entry.status === 'added' ? 'Ajouté' :
                                                    entry.status === 'removed' ? 'Supprimé' :
                                                        entry.status === 'modified' ? 'Modifié' : 'Inchangé'}
                                            </ChangeBadge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DetailsTable>
                )}
            </ModalContent>
        </ModalOverlay>
    );
}

function getDayShifts(data: ModelData): DayShift[] {
    const source = data.days || data.shifts;
    if (!source) return DAYS_FR.map(() => ({ is_off: true }));
    if (Array.isArray(source)) {
        const result = [...source];
        while (result.length < 7) result.push({ is_off: true } as any);
        return result as DayShift[];
    }
    // Object with day keys (monday, tuesday, etc.)
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayKeys.map(k => {
        // Handle backend TimeSlot[] format
        const val = source[k as keyof typeof source];
        if (Array.isArray(val)) {
            if (val.length === 0) return { is_off: true };
            if (val.length === 1) {
                const assigned = val[0].assigned_type === 'team' ? 'Équipe' : (val[0].assigned_type === 'employee' ? 'Employé' : 'Assignation');
                return {
                    is_off: false,
                    label: assigned,
                    start: val[0].start,
                    end: val[0].end
                };
            }
            return {
                is_off: false,
                label: `${val.length} Assign.`,
                start: val[0].start,
                end: val[val.length - 1].end
            };
        }
        return (val as DayShift) || { is_off: true };
    });
}

function DayCellWithPopover({ shift, changed, onClick }: { shift: DayShift; changed: boolean; onClick?: () => void }) {
    const isOff = shift.is_off || shift.is_day_off || false;
    const label = shift.name || shift.label || (isOff ? 'OFF' : '—');
    const timeStr = shift.start && shift.end ? `${shift.start} - ${shift.end}` : '';

    return (
        <DayCell
            $changed={changed}
            $isOff={isOff}
            onClick={changed ? onClick : undefined}
            style={{ cursor: changed ? 'pointer' : 'default' }}
            title={changed ? "Cliquez pour voir les détails" : undefined}
        >
            <ShiftLabel $clickable={changed}>{label}</ShiftLabel>
            {timeStr && <ShiftTime $clickable={changed}>{timeStr}</ShiftTime>}
            {changed && (
                <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#fff', fontSize: '0.8rem', padding: '0.2rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    MODIFIÉ
                </div>
            )}
        </DayCell>
    );
}

export default function AuditDiffModel({ beforeData, afterData }: AuditDiffModelProps) {
    let before: ModelData = {};
    let after: ModelData = {};

    try { before = JSON.parse(beforeData); } catch { /* empty */ }
    try { after = JSON.parse(afterData); } catch { /* empty */ }

    const modelName = after.name || after.model_name || before.name || before.model_name || 'Modèle';
    const beforeShifts = getDayShifts(before);
    const afterShifts = getDayShifts(after);

    // Compute which days changed
    const changedDays = DAYS_FR.map((_, i) => {
        return JSON.stringify(beforeShifts[i]) !== JSON.stringify(afterShifts[i]);
    });

    const { data: usersData } = useQuery({ queryKey: ['users', { limit: 1000 }], queryFn: () => getUsers({ limit: 1000 }) });
    const { data: teamsData } = useQuery({ queryKey: ['planning_teams'], queryFn: PlanningService.getTeams });

    const users = usersData?.users || [];
    const teams = (teamsData as any)?.data || (teamsData as any)?.teams || teamsData || [];

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    return (
        <Container>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-grey-800)' }}>
                📋 {modelName}
            </div>

            {/* Day headers */}
            <DayGrid>
                {DAYS_FR.map(d => <DayHeader key={d}>{d}</DayHeader>)}
            </DayGrid>

            {/* Before */}
            <SectionLabel $variant="before">🔴 Avant</SectionLabel>
            <DayGrid>
                {beforeShifts.map((shift, i) => (
                    <DayCellWithPopover key={i} shift={shift} changed={changedDays[i]} onClick={() => setSelectedDay(i)} />
                ))}
            </DayGrid>

            {/* After */}
            <SectionLabel $variant="after">🟢 Après</SectionLabel>
            <DayGrid>
                {afterShifts.map((shift, i) => (
                    <DayCellWithPopover key={i} shift={shift} changed={changedDays[i]} onClick={() => setSelectedDay(i)} />
                ))}
            </DayGrid>

            {selectedDay !== null && (
                <DayDetailsModal
                    dayName={DAYS_FR[selectedDay]}
                    beforeSlots={getRawSlotsForDay(before, selectedDay)}
                    afterSlots={getRawSlotsForDay(after, selectedDay)}
                    users={users}
                    teams={teams}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </Container>
    );
}
