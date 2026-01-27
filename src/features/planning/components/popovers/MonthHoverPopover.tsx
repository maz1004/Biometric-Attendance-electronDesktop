import styled, { keyframes } from "styled-components";
import { ComputedSchedule, PlanningException } from "../../types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: ${p => p.y + 10}px;
  left: ${p => p.x + 10}px;
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
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export default function MonthHoverPopover({ x, y, items, exception, onMouseEnter, onMouseLeave }: MonthHoverPopoverProps) {
    // Unique teams/shifts
    const teams = Array.from(new Set(items.map(i => i.teamId))).filter(t => t !== 'unassigned');
    const employees = Array.from(new Set(items.map(i => i.assigneeName))).filter(Boolean);
    const shiftNames = Array.from(new Set(items.map(i => i.shiftName)));

    return (
        <PopoverContainer x={x} y={y} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {exception && (
                <Section>
                    <Label style={{ color: "var(--color-red-500)" }}>Exception</Label>
                    <Value>
                        <Dot color={(exception as any).type === 'NATIONAL' || (exception as any).type === 'RELIGIOUS' ? '#ef4444' : '#f97316'} />
                        {'start_date' in exception ? 'Exception' : 'Férié'}
                    </Value>
                </Section>
            )}

            {items.length > 0 && (
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
                            <Value>{teams.length} assignée(s)</Value>
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
