import styled, { keyframes } from "styled-components";
import { ComputedSchedule, PlanningException } from "../../types";
import { usePlanning } from "../../hooks/usePlanning";

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
    const { teams: teamsDict } = usePlanning();
    // Separate Holidays from Regular Assignments
    const holidayItems = items.filter(i => i.shiftId === 'holiday');
    const regularItems = items.filter(i => i.shiftId !== 'holiday');

    // Unique teams/shifts/employees from REGULAR items only
    const teamIds = Array.from(new Set(regularItems.map(i => i.teamId)));


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
                        {Object.entries(
                            regularItems.reduce((acc, item) => {
                                if (!acc[item.shiftName]) acc[item.shiftName] = [];
                                acc[item.shiftName].push(item);
                                return acc;
                            }, {} as Record<string, typeof regularItems>)
                        ).map(([shiftName, groupItems]) => {
                            // Group by Time Slot -> Employees
                            const timeGroups = groupItems.reduce((acc, item) => {
                                const timeKey = `${item.startTime} - ${item.endTime}`;
                                if (!acc[timeKey]) acc[timeKey] = [];
                                if (item.assigneeName) acc[timeKey].push(item.assigneeName);
                                return acc;
                            }, {} as Record<string, string[]>);

                            return (
                                <Value key={shiftName} style={{ alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                                        <span style={{ fontWeight: 600, borderBottom: '1px solid var(--color-grey-200)', paddingBottom: '2px', marginBottom: '2px' }}>
                                            {shiftName}
                                        </span>
                                        {Object.entries(timeGroups).map(([timeStr, employees], idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                    {timeStr}
                                                </span>
                                                {employees.length > 0 ? (
                                                    <div style={{ paddingLeft: '8px', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
                                                        {employees.map((emp, eIdx) => (
                                                            <div key={eIdx}>• {emp}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ paddingLeft: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                                        Non assigné
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Value>
                            );
                        })}
                    </Section>

                    {teamIds.length > 0 && (
                        <Section>
                            <Label>Équipes</Label>
                            {teamIds.map(t => (
                                <div key={String(t)} style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                    • {!t || t === 'unassigned' || t === 'GLOBAL' ? 'Indépendants' : (teamsDict[t]?.name || ('Équipe ' + t.substring(0, 8) + '...'))}
                                </div>
                            ))}
                        </Section>
                    )}


                </>
            )
            }
        </PopoverContainer >
    );
}
