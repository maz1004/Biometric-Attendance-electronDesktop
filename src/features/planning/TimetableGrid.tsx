import styled from "styled-components";
import { useDroppable } from "@dnd-kit/core";
import { Shift, EmployeeMini } from "./PlanningTypes";
import { useMemo } from "react";

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

const DayRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--color-border-card);
  padding: 1rem 0;
`;

const DayLabel = styled.div`
  font-weight: 600;
  color: var(--color-text-strong);
  text-transform: uppercase;
  font-size: 1.2rem;
`;

const TimeTrack = styled.div`
  position: relative;
  height: 80px;
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
`;

const ShiftBlockStyled = styled.div<{ $isOver: boolean }>`
  position: absolute;
  top: 5px;
  bottom: 5px;
  background: ${(p) => (p.$isOver ? "var(--color-brand-200)" : "var(--color-brand-100)")};
  border: 1px solid var(--color-brand-300);
  border-radius: var(--border-radius-sm);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--color-brand-800);
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: var(--color-brand-200);
    z-index: 10;
  }
`;

const ShiftName = styled.div`
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShiftTime = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const MemberCount = styled.div`
  font-size: 1rem;
  margin-top: 0.2rem;
  font-weight: 500;
`;

function timeToPercent(time: string): number {
    const [h, m] = time.split(":").map(Number);
    const totalMinutes = h * 60 + m;
    return (totalMinutes / (24 * 60)) * 100;
}

function ShiftBlock({
    shift,
}: {
    shift: Shift;
    employees: Record<string, EmployeeMini>;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `shift-${shift.id}`,
        data: { type: "shift", id: shift.id },
    });

    const left = timeToPercent(shift.start);
    const width = timeToPercent(shift.end) - left;

    // Calculate total members (team members + extra members)
    const memberCount = shift.extraMemberIds.length;

    return (
        <ShiftBlockStyled
            ref={setNodeRef}
            $isOver={isOver}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${shift.name} (${shift.start} - ${shift.end})`}
        >
            <ShiftName>{shift.name}</ShiftName>
            <ShiftTime>
                {shift.start} - {shift.end}
            </ShiftTime>
            <MemberCount>
                {memberCount} assigned
            </MemberCount>
        </ShiftBlockStyled>
    );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TimetableGrid({
    shifts,
    employees,
}: {
    shifts: Shift[];
    employees: Record<string, EmployeeMini>;
}) {
    // Group shifts by day
    const shiftsByDay = useMemo(() => {
        const map: Record<number, Shift[]> = {};
        shifts.forEach((s) => {
            s.daysActive.forEach((day) => {
                if (!map[day]) map[day] = [];
                map[day].push(s);
            });
        });
        return map;
    }, [shifts]);

    return (
        <GridContainer>
            {DAYS.map((dayName, index) => (
                <DayRow key={dayName}>
                    <DayLabel>{dayName}</DayLabel>
                    <TimeTrack>
                        {/* Render hour markers if needed */}
                        {shiftsByDay[index]?.map((shift) => (
                            <ShiftBlock
                                key={`${shift.id}-${index}`}
                                shift={shift}
                                employees={employees}
                            />
                        ))}
                    </TimeTrack>
                </DayRow>
            ))}
        </GridContainer>
    );
}
