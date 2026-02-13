import { useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Team, UserShift, EmployeeMini, Shift, ComputedSchedule, ShiftException } from '../types';
import { computeScheduleWithValidation } from '../engine/PlanningEngine';
import MonthHoverPopover from '../components/popovers/MonthHoverPopover';
import EmployeeScheduleModal from '../components/modals/EmployeeScheduleModal';

// ----- STYLED COMPONENTS -----

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-grey-0);
  border: 1px solid var(--color-border-element);
  border-radius: 8px;
  overflow: hidden;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate; /* Allows border-spacing if needed, but here we use collapsed borders logic manually or distinct rows */
  border-spacing: 0;
  table-layout: fixed;
  min-width: 1000px; 
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-element);
  border-right: 1px solid var(--color-border-element);
  padding: 1.2rem 1rem; /* More vertical padding */
  z-index: 10;
  text-align: left;
  font-weight: 700;
  color: var(--color-text-secondary);
  font-size: 0.95rem; /* Larger font */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:first-child {
    left: 0;
    z-index: 20; 
    width: 240px; /* Non-negligibly wider for names */
    background: var(--color-bg-subtle);
    border-right: 2px solid var(--color-border-element); 
  }
`;

const TeamHeaderRow = styled.tr`
  background: var(--color-grey-100);
  
  td {
    padding: 0.8rem 1.5rem; /* More spacing */
    font-weight: 800;
    color: var(--color-text-main);
    border-bottom: 1px solid var(--color-border-element);
    border-right: 1px solid var(--color-border-element);
    font-size: 0.9rem; /* Larger */
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const EmployeeRow = styled.tr`
  border-bottom: 1px solid var(--color-border-element);
  background: var(--color-bg-card);
  transition: background 0.1s;
  &:hover { background: var(--color-grey-50); }
`;

const EmployeeCell = styled.td`
  position: sticky;
  left: 0;
  background: inherit; 
  padding: 1rem 1.5rem; /* Spacious padding */
  border-right: 2px solid var(--color-border-element);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%; /* Fill row */
  min-height: 80px; /* Minimum substantial height */
`;

const Avatar = styled.img`
  width: 36px; height: 36px; border-radius: 50%; /* Larger avatars */
  object-fit: cover;
  border: 2px solid var(--color-bg-card);
  box-shadow: var(--shadow-sm);
`;

const Name = styled.span`
  font-size: 1rem; /* Readable base size */
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShiftCell = styled.td`
  border-right: 1px solid var(--color-border-element);
  padding: 8px; /* More breathing room inside cell */
  vertical-align: middle;
  height: 80px; /* Taller fixed height base */
`;

const ShiftBlock = styled.div<{ $color: string }>`
  background-color: ${p => p.$color};
  color: white; 
  border-radius: 6px; /* A bit softer */
  padding: 6px 10px;
  font-size: 0.9rem; /* Larger text inside block */
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 54px; /* Taller blocks */
  justify-content: center;
  box-shadow: var(--shadow-md); /* Better definition */
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { 
    opacity: 0.95; 
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  .time { font-weight: 700; font-size: 0.8rem; opacity: 0.9; }
  .name { font-weight: 600; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; }
`;

// ----- TYPES -----

interface StrategicWeekGridProps {
    currentWeek: Date;
    teams: Record<string, Team>;
    employees: Record<string, EmployeeMini>;
    userShifts: UserShift[];
    shifts: Record<string, Shift>; // Added for lookup
    onSaveAssignment: (date: Date, teamIds: string[], empIds: string[], color: string) => void;
}



export default function StrategicWeekGrid({
    currentWeek,
    teams,
    employees,
    userShifts,
    shifts,
    // onSaveAssignment // Unused for now
}: StrategicWeekGridProps) {

    // --- EMPLOYEE SCHEDULE MODAL STATE ---
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMini | null>(null);

    // --- HOVER POPOVER STATE ---
    const [hoverPopover, setHoverPopover] = useState<{ x: number, y: number, dateStr: string, items: ComputedSchedule[], exception?: ShiftException, alignment?: 'left' | 'right' } | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearHoverTimeout = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleMouseEnter = (e: React.MouseEvent, item: ComputedSchedule) => {
        clearHoverTimeout();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const isNearRightEdge = rect.right > window.innerWidth - 350;

        setHoverPopover({
            x: isNearRightEdge ? rect.left : rect.left + rect.width, // Right side of the block or left if flipped
            y: rect.top,
            dateStr: item.date,
            items: [item], // Show only this item details
            exception: undefined, // To do: handle exceptions if they are rendered as blocks
            alignment: isNearRightEdge ? 'left' : 'right'
        });
    };

    const handleMouseLeave = () => {
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setHoverPopover(null);
        }, 1000);
    };

    // 1. Prepare Dates
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(start, i)), [start]);

    // 2. Group Employees by Team
    // We want to show Teams -> Employees in that team -> Unassigned
    const groupedData = useMemo(() => {
        const teamMap: Record<string, EmployeeMini[]> = {};
        // const assignedEmpIds = new Set<string>();

        // Initialize lists for known teams
        Object.keys(teams).forEach(tid => teamMap[tid] = []);

        // Distribute employees
        Object.values(employees).forEach(emp => {
            // Find if employee belongs to a team (using Frontend Team.memberIds ?)
            // Currently PlanningTypes says Team.memberIds: string[].
            // Let's iterate teams to find membership
            let foundTeam = false;
            for (const team of Object.values(teams)) {
                if (team.memberIds.includes(emp.id)) {
                    teamMap[team.id].push(emp);
                    foundTeam = true;
                    break;
                }
            }
            if (!foundTeam) {
                // Check if specialized "Unassigned" key needed?
                if (!teamMap['unassigned']) teamMap['unassigned'] = [];
                teamMap['unassigned'].push(emp);
            }
        });

        return teamMap;
    }, [employees, teams]);

    // 3. Compute Schedule via Engine with Validation
    const scheduleResult = useMemo(() => {
        return computeScheduleWithValidation(shifts, userShifts, employees, teams, { weekDates: weekDays });
    }, [shifts, userShifts, employees, teams, weekDays]);

    const computedItems = scheduleResult.schedule;

    // Log conflicts if any
    if (scheduleResult.conflicts.hasConflicts) {
        console.warn('[StrategicWeekView] Conflicts:', scheduleResult.conflicts.summary);
    }

    const getItemsForCell = (userId: string, date: Date) => {
        const dStr = format(date, "yyyy-MM-dd");
        return computedItems.filter(item => item.assigneeId === userId && item.date === dStr);
    };

    return (
        <Container>
            <ScrollArea>
                <Table>
                    <thead>
                        <tr>
                            <Th>Employés</Th>
                            {weekDays.map(d => (
                                <Th key={d.toISOString()}>
                                    {format(d, 'EEE d MMM', { locale: fr })}
                                </Th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedData).map(([teamId, emps]) => {
                            // if (emps.length === 0) return null; // FIX: Don't hide empty teams
                            const team = teams[teamId];
                            const teamName = team ? team.name : "Non assigné";

                            return (
                                <div key={teamId} style={{ display: 'contents' }}>
                                    {/* Team Header */}
                                    <TeamHeaderRow>
                                        <td colSpan={8}>{teamName} ({emps.length})</td>
                                    </TeamHeaderRow>

                                    {/* Employees */}
                                    {emps.map(emp => (
                                        <EmployeeRow key={emp.id}>
                                            <EmployeeCell
                                                onClick={() => setSelectedEmployee(emp)}
                                                style={{ cursor: 'pointer' }}
                                                title="Cliquez pour voir le planning détaillé"
                                            >
                                                {emp.avatar && <Avatar src={emp.avatar} alt="" />}
                                                <Name>{emp.name}</Name>
                                            </EmployeeCell>

                                            {weekDays.map(day => {
                                                const items = getItemsForCell(emp.id, day);
                                                return (
                                                    <ShiftCell key={day.toISOString()}>
                                                        {items.map(s => (
                                                            <ShiftBlock
                                                                key={s.id}
                                                                $color={s.color || '#ccc'}
                                                                onMouseEnter={(e) => handleMouseEnter(e, s)}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                <span className="time">{s.startTime} - {s.endTime}</span>
                                                                <span className="name">{s.shiftName}</span>
                                                            </ShiftBlock>
                                                        ))}
                                                        {items.length === 0 && (
                                                            <span style={{ fontSize: '0.7rem', color: '#e5e7eb', paddingLeft: 8 }}>-</span>
                                                        )}
                                                    </ShiftCell>
                                                );
                                            })}
                                        </EmployeeRow>
                                    ))}
                                </div>
                            );
                        })}
                    </tbody>
                </Table>
            </ScrollArea>

            {hoverPopover && (
                <MonthHoverPopover
                    {...hoverPopover}
                    onMouseEnter={clearHoverTimeout}
                    onMouseLeave={() => {
                        clearHoverTimeout();
                        hoverTimeoutRef.current = setTimeout(() => setHoverPopover(null), 1000);
                    }}
                />
            )}

            {/* Employee Schedule Modal */}
            {selectedEmployee && (
                <EmployeeScheduleModal
                    employee={selectedEmployee}
                    weekDays={weekDays}
                    items={computedItems.filter(i => i.assigneeId === selectedEmployee.id)}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </Container>
    );
}
