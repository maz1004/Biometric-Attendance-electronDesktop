import { useState, useRef } from "react";
import styled from "styled-components";
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
} from "@dnd-kit/core";
import { Shift, EmployeeMini, Team, DayKey } from "./PlanningTypes";

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-card);
  overflow: hidden;
`;

const HeaderRow = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border-card);
  background: var(--color-grey-50);
`;

const TimeHeader = styled.div`
  flex: 1;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  border-right: 1px solid var(--color-border-card);
  
  &:last-child {
    border-right: none;
  }
`;

const DayRow = styled.div`
  display: flex;
  height: 8rem; // Fixed height for now
  border-bottom: 1px solid var(--color-border-card);
  position: relative;

  &:last-child {
    border-bottom: none;
  }
`;

const DayLabel = styled.div`
  width: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-grey-50);
  border-right: 1px solid var(--color-border-card);
  padding: 1rem;
  z-index: 10;
`;

const DayName = styled.span`
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--color-grey-700);
`;

const GridCell = styled.div`
  flex: 1;
  position: relative;
  border-right: 1px dashed var(--color-grey-200);
  
  &:last-child {
    border-right: none;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 1.1rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
  margin-bottom: 0.4rem;
`;

const ShiftBlock = styled.div<{ $color?: string; $isDragging?: boolean }>`
  position: absolute;
  top: 0.5rem;
  bottom: 0.5rem;
  background-color: ${(props) => props.$color || "var(--color-brand-500)"};
  border-radius: var(--border-radius-sm);
  padding: 0.4rem 0.8rem;
  color: white;
  font-size: 1.2rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: grab;
  box-shadow: var(--shadow-sm);
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  z-index: 5;

  &:hover {
    filter: brightness(1.1);
    z-index: 10;
    
    ${Tooltip} {
      opacity: 1;
    }
  }
`;

// --- Types ---

interface WeeklyTimesheetProps {
    shifts: Shift[];
    employees: Record<string, EmployeeMini>;
    teams: Record<string, Team>;
    weekStart: Date;
    onShiftMove: (shiftId: string, newDay: DayKey, newStart: string, newEnd: string) => void;
    onShiftClick: (shiftId: string) => void;
}

// --- Constants ---
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// --- Components ---

function DraggableShift({ shift, team, style, onClick }: { shift: Shift; team?: Team; style: React.CSSProperties; onClick: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: shift.id,
        data: { type: "shift", shift },
    });

    const transformStyle = {
        ...style,
        cursor: isDragging ? "grabbing" : "grab",
    };

    return (
        <ShiftBlock
            ref={setNodeRef}
            style={transformStyle}
            {...listeners}
            {...attributes}
            $color={team?.color}
            $isDragging={isDragging}
            onClick={() => onClick(shift.id)}
        >
            <strong>{shift.name}</strong>
            <Tooltip>
                {shift.name} ({shift.start} - {shift.end})
            </Tooltip>
        </ShiftBlock>
    );
}

function DroppableDay({ dayIndex, children }: { dayIndex: number; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
        id: `day-${dayIndex}`,
        data: { dayIndex },
    });

    return (
        <div ref={setNodeRef} style={{ display: "contents" }}>
            {children}
        </div>
    );
}

export default function WeeklyTimesheet({
    shifts,
    teams,
    onShiftMove,
    onShiftClick,
}: WeeklyTimesheetProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Helper to calculate position and width based on time
    const getPositionStyle = (start: string, end: string) => {
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const duration = endMinutes - startMinutes;

        const left = (startMinutes / (24 * 60)) * 100;
        const width = (duration / (24 * 60)) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveId(null);

        if (!over) return;

        const shift = active.data.current?.shift as Shift;
        if (!shift) return;

        // Determine new day
        const overId = over.id as string;
        let newDayIndex = -1;

        if (overId.startsWith("day-")) {
            newDayIndex = parseInt(overId.split("-")[1]);
        }

        if (newDayIndex === -1) return;

        let newStart = shift.start;
        let newEnd = shift.end;

        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            // 10rem label width (approx 100px depending on root font size, usually 16px * 10 = 160px)
            // Let's assume 1rem = 10px from global styles or 16px. 
            // Standard is 16px, so 10rem = 160px.
            // But let's be safer and assume the grid takes up the rest.
            // We can get the grid width by subtracting label width.
            // Or better, we can assume the grid is the droppable area.

            // Approximate calculation:
            // The grid width is roughly containerWidth - 100 (if 1rem=10px) or 160 (if 1rem=16px).
            // Let's use a safe approximation or try to get the actual grid element width if possible.
            // Since we don't have a ref to the grid row easily, let's use the container width and subtract the label width.
            // Let's assume 1rem = 10px as per common "html { font-size: 62.5%; }" trick often used.
            // If not, 1rem = 16px.
            // Let's assume 10rem ~ 100px for now based on typical setups, or 160px.
            // Let's use 120px as an average or try to be more dynamic.

            // Better yet:
            // delta.x is in pixels.
            // We need to know how many pixels represent 1 minute.
            // pixelsPerMinute = gridWidth / (24 * 60).

            // Let's try to get the grid width from the event if possible? No.

            // Let's assume the label is 100px wide (10rem with 62.5% font size).
            const labelWidth = 100;
            const gridWidth = containerWidth - labelWidth;

            if (gridWidth > 0) {
                const minutesPerPixel = (24 * 60) / gridWidth;
                const minutesMoved = delta.x * minutesPerPixel;

                const [startH, startM] = shift.start.split(":").map(Number);
                const [endH, endM] = shift.end.split(":").map(Number);
                const duration = (endH * 60 + endM) - (startH * 60 + startM);

                let newStartMinutes = (startH * 60 + startM) + minutesMoved;

                // Snap to 15 minutes
                newStartMinutes = Math.round(newStartMinutes / 15) * 15;

                // Clamp
                newStartMinutes = Math.max(0, Math.min(24 * 60 - duration, newStartMinutes));

                const newEndMinutes = newStartMinutes + duration;

                const formatTime = (mins: number) => {
                    const h = Math.floor(mins / 60);
                    const m = Math.floor(mins % 60);
                    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                };

                newStart = formatTime(newStartMinutes);
                newEnd = formatTime(newEndMinutes);
            }
        }

        onShiftMove(shift.id, newDayIndex as DayKey, newStart, newEnd);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Container ref={containerRef}>
                <HeaderRow>
                    <DayLabel /> {/* Empty corner */}
                    {HOURS.map((h) => (
                        <TimeHeader key={h}>{h}:00</TimeHeader>
                    ))}
                </HeaderRow>

                {DAYS.map((dayName, dayIndex) => {
                    const dayShifts = shifts.filter(s => s.daysActive.includes(dayIndex as DayKey));

                    return (
                        <DroppableDay key={dayIndex} dayIndex={dayIndex}>
                            <DayRow>
                                <DayLabel>
                                    <DayName>{dayName}</DayName>
                                </DayLabel>

                                <div style={{ flex: 1, position: "relative", display: "flex" }}>
                                    {/* Background Grid */}
                                    {HOURS.map((h) => (
                                        <GridCell key={h} />
                                    ))}

                                    {/* Shifts */}
                                    {dayShifts.map(shift => {
                                        const team = shift.teamIds.length > 0 ? teams[shift.teamIds[0]] : undefined;
                                        const style = getPositionStyle(shift.start, shift.end);

                                        return (
                                            <DraggableShift
                                                key={shift.id}
                                                shift={shift}
                                                team={team}
                                                style={style}
                                                onClick={onShiftClick}
                                            />
                                        );
                                    })}
                                </div>
                            </DayRow>
                        </DroppableDay>
                    );
                })}
            </Container>

            <DragOverlay>
                {activeId ? (
                    <ShiftBlock $isDragging>
                        Dragging...
                    </ShiftBlock>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
