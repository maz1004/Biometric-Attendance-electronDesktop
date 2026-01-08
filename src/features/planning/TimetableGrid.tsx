import { useDroppable } from "@dnd-kit/core";
import styled from "styled-components";
import { EmployeeMini, UserShift, Shift } from "./PlanningTypes";

// --- STYLES ---
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-Base);
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr);
  border-bottom: 2px solid var(--color-border-card);
  background: var(--color-bg-elevated);
`;

const HeaderCell = styled.div<{ $align?: string }>`
  padding: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 1.1rem;
  color: var(--color-text-dim);
  text-align: ${(p) => p.$align || "center"};
  border-right: 1px solid var(--color-border-card);
  &:last-child { border-right: none; }
`;

const EmployeeRowStyled = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr);
  border-bottom: 1px solid var(--color-border-card);
  &:last-child { border-bottom: none; }
`;

const EmployeeHeader = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-right: 2px solid var(--color-border-card);
  background: var(--color-bg-Base);
`;

const DayCellStyled = styled.div<{ $isOver: boolean }>`
  padding: 0.5rem;
  min-height: 80px;
  border-right: 1px solid var(--color-border-card);
  background: ${(p) => (p.$isOver ? "var(--color-brand-100)" : "transparent")};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
  &:last-child { border-right: none; }
`;

const AssignedShift = styled.div<{ $color?: string }>`
  background: ${(p) => p.$color || "var(--color-brand-100)"};
  border: 1px solid var(--color-brand-200);
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  cursor: pointer;
  
  & strong {
    display: block;
    font-weight: 600;
    color: var(--color-brand-700);
  }
  
  & span {
    color: var(--color-brand-600);
  }
`;

// --- COMPONENTS ---

// dateKey = "YYYY-MM-DD"
function DayCell({
    employeeId,
    dateKey,
    shifts,
    allShiftsMap
}: {
    employeeId: string;
    dateKey: string;
    shifts: UserShift[];
    allShiftsMap: Record<string, Shift>;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${employeeId}#${dateKey}`,
        data: {
            type: "cell",
            employeeId,
            dateKey
        },
    });

    return (
        <DayCellStyled ref={setNodeRef} $isOver={isOver}>
            {shifts.map((us) => {
                const shiftDef = allShiftsMap[us.shiftId];
                return (
                    <AssignedShift key={us.id} $color={shiftDef?.color}>
                        <strong>{shiftDef?.name || "Unknown Shift"}</strong>
                        <span>{shiftDef?.startTime} - {shiftDef?.endTime}</span>
                    </AssignedShift>
                );
            })}
        </DayCellStyled>
    );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TimetableGrid({
    employees,
    userShifts,
    weekStartDate, // e.g., Date object or string "2023-10-23"
    allShifts, // Record<id, Shift>
}: {
    employees: EmployeeMini[];
    userShifts: UserShift[];
    weekStartDate: Date;
    allShifts: Record<string, Shift>;
}) {

    // Helper to generate IDs or keys for the 7 days of the week
    // Assumes weekStart is Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
    });

    // Group userShifts by EmployeeID and Date
    // Map<employeeId, Map<dateKey, UserShift[]>>
    const gridData: Record<string, Record<string, UserShift[]>> = {};

    userShifts.forEach(us => {
        // assignedAt is "YYYY-MM-DD..."
        const dateKey = us.assignedAt.split('T')[0];
        if (!gridData[us.userId]) gridData[us.userId] = {};
        if (!gridData[us.userId][dateKey]) gridData[us.userId][dateKey] = [];
        gridData[us.userId][dateKey].push(us);
    });

    return (
        <GridContainer>
            <HeaderRow>
                <HeaderCell $align="left">Employee</HeaderCell>
                {DAYS.map((d, i) => (
                    <HeaderCell key={d}>
                        {d} <br />
                        <span style={{ fontSize: "0.8em", fontWeight: 400 }}>
                            {weekDays[i].slice(5)}
                        </span>
                    </HeaderCell>
                ))}
            </HeaderRow>

            {employees.map((emp) => (
                <EmployeeRowStyled key={emp.id}>
                    <EmployeeHeader>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                    </EmployeeHeader>

                    {weekDays.map((dateKey) => (
                        <DayCell
                            key={dateKey}
                            employeeId={emp.id}
                            dateKey={dateKey}
                            shifts={gridData[emp.id]?.[dateKey] || []}
                            allShiftsMap={allShifts}
                        />
                    ))}
                </EmployeeRowStyled>
            ))}
        </GridContainer>
    );
}
