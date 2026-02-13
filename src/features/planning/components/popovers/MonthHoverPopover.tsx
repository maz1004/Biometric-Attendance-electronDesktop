import styled, { keyframes } from "styled-components";
import { ComputedSchedule, PlanningException } from "../../types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div<{ x: number; y: number; alignment?: 'left' | 'right' }>`
  position: fixed;
  top: ${p => p.y + 10}px;
  left: ${p => p.alignment === 'left' ? 'auto' : `${p.x + 10}px`};
  right: ${p => p.alignment === 'left' ? `${window.innerWidth - p.x + 10}px` : 'auto'};
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  color: var(--color-grey-700);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1100;
  width: 300px; /* Increased width */
  padding: 16px; /* Increased padding */
  pointer-events: auto;
  animation: ${fadeIn} 0.1s ease-out;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  font-size: 0.85rem; /* Increased font size */
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  font-size: 1rem; /* Increased font size */
  color: var(--color-text-main);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
`;

const Dot = styled.span<{ color: string }>`
  width: 10px; /* Increased size */
  height: 10px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

const EmployeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 0.95rem;
`;

interface MonthHoverPopoverProps {
    x: number;
    y: number;
    dateStr: string;
    items: ComputedSchedule[];
    exception?: PlanningException;
    alignment?: 'left' | 'right';
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export default function MonthHoverPopover({ x, y, items, exception, alignment = 'right', onMouseEnter, onMouseLeave }: MonthHoverPopoverProps) {
    // Separate Holidays from Regular Assignments
    const holidayItems = items.filter(i => i.shiftId === 'holiday');
    const regularItems = items.filter(i => i.shiftId !== 'holiday');

    // Unique teams/shifts/employees from REGULAR items only
    const teams = Array.from(new Set(regularItems.map(i => i.teamId)));
    const employees = Array.from(new Set(regularItems.map(i => i.assigneeName))).filter(Boolean);
    const shiftNames = Array.from(new Set(regularItems.map(i => i.shiftName)));

    return (
        <PopoverContainer x={x} y={y} alignment={alignment} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {exception && (
                <Section>
                    <Label style={{ color: "var(--color-red-500)" }}>Exception</Label>
                    <Value>
                        <Dot color={(exception as any).type === 'NATIONAL' || (exception as any).type === 'RELIGIOUS' ? '#ef4444' : '#f97316'} />
                        {'start_date' in exception ? 'Exception' : 'Férié'}
                    </Value>
                </Section>
            )}

            {holidayItems.length > 0 && (
                <Section>
                    <Label style={{ color: "var(--color-primary)" }}>Férié</Label>
                    {holidayItems.map(h => (
                        <Value key={h.id}>
                            <Dot color={h.color || '#fee2e2'} />
                            {h.shiftName.replace('🏖️ ', '')}
                        </Value>
                    ))}
                </Section>
            )}

            {regularItems.length > 0 && (
                <>
                    <Section>
                        <Label>Planning</Label>
                        {shiftNames.map(s => (
                            <Value key={s}>
                                {s}
                            </Value>
                        ))}
                    </Section>

                    {teams.length > 0 && (
                        <Section>
                            <Label>Équipes</Label>
                            {teams.map(t => (
                                <div key={String(t)} style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                    • {!t || t === 'unassigned' || t === 'GLOBAL' ? 'Indépendants' : 'Équipe ' + (t.length > 8 ? t.substring(0, 8) : t) + '...'}
                                </div>
                            ))}
                        </Section>
                    )}

                    <Section>
                        <Label>Employés ({employees.length})</Label>
                        {employees.length > 0 ? (
                            <EmployeeList>
                                {employees.map((name, idx) => (
                                    <div key={idx} style={{ color: 'var(--color-text-primary)' }}>• {name}</div>
                                ))}
                            </EmployeeList>
                        ) : (
                            <Value style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Aucun employé</Value>
                        )}
                    </Section>
                </>
            )}
        </PopoverContainer>
    );
}
