import { useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Team, ComputedSchedule } from "../types";
import MonthHoverPopover from "../components/popovers/MonthHoverPopover";



// ----- STYLED COMPONENTS -----

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-grey-0);
  overflow: hidden;
  height: 100%;
`;

const LegendBar = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-border-element);
  overflow-x: auto;
  align-items: center;
  flex-shrink: 0;
  
  .label { font-size: 0.75rem; font-weight: 600; color: var(--color-grey-500); text-transform: uppercase; margin-right: 0.5rem; }
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  
  &::before {
    content: '';
    width: 10px; height: 10px;
    border-radius: 50%;
    background: ${props => props.color};
  }
`;

const GridArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: auto; 
  align-items: flex-start;
  
  /* Hide scrollbar but allow scrolling */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TimeAxis = styled.div`
  width: 60px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border-element);
  background: var(--color-grey-0);
  display: flex;
  flex-direction: column;
  padding-top: 50px; /* Header Height */
  min-height: 700px; /* Ensure 12 slots * 50px approx + spacing */
`;

const TimeSlotLabel = styled.div`
  height: 60px; /* Fixed height per slot */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border-bottom: 1px solid transparent; 
`;

const ColumnsContainer = styled.div`
  flex: 1;
  display: flex;
  overflow-x: auto;
  min-height: 700px;
`;

const DayColumn = styled.div`
  flex: 1;
  min-width: 120px; 
  border-right: 1px solid var(--color-border-element);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ColumnHeader = styled.div`
  height: 50px;
  border-bottom: 1px solid var(--color-border-element);
  background: var(--color-bg-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
  
  .dow { font-weight: 700; text-transform: uppercase; color: var(--color-text-main); font-size: 0.9rem; }
  .day { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }
`;

const Swimlane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SlotCell = styled.div`
  height: 60px; /* MATCH TimeSlotLabel height */
  border-bottom: 1px solid var(--color-grey-100);
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.1s;
  position: relative;

  &:hover {
    background-color: var(--color-grey-50); 
  }
`;

// Container for dots within a slot
const SlotDots = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ShiftDot = styled.div<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.3);
    z-index: 10;
  }
`;

// ----- HELPERS -----



const parseTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

// ----- COMPONENT -----

interface OperationalWeekGridProps {
  dates: Date[];
  teams: Team[];
  computedSchedule: ComputedSchedule[];
  timeSlot: "day" | "night";
}

export default function OperationalWeekGrid({
  dates,
  teams,
  computedSchedule,
  timeSlot,
}: OperationalWeekGridProps) {

  // console.log(`[OpView] Render. Dates: ${dates.length}, Items: ${computedSchedule.length}`);

  const [hoverPopover, setHoverPopover] = useState<{ x: number, y: number, dateStr: string, items: ComputedSchedule[] } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const clearOpenTimeout = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const handleSlotMouseEnter = (e: React.MouseEvent, date: Date, items: ComputedSchedule[]) => {
    clearHoverTimeout();
    clearOpenTimeout(); // Clear any other pending open

    const rect = e.currentTarget.getBoundingClientRect();
    if (items.length > 0) {
      // Delay opening to avoid "gap crossing" issues
      openTimeoutRef.current = setTimeout(() => {
        setHoverPopover({
          x: rect.left + rect.width,
          y: rect.top,
          dateStr: format(date, "yyyy-MM-dd"),
          items: items
        });
      }, 150);
    }
  };

  const handleSlotMouseLeave = () => {
    clearOpenTimeout(); // Cancel any pending open if we leave before it fires
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverPopover(null);
    }, 1000);
  };

  // No color mapping needed, use t.color directly
  // teams.forEach((t, i) => teamColorMap.set(t.id, getTeamColor(i)));

  // 1. Define Slots based on Mode
  const startHour = timeSlot === "day" ? 6 : 19;
  const endHour = timeSlot === "day" ? 20 : 31; // Adjusted end hour slightly to 20h (8pm)
  const totalSlots = endHour - startHour;

  const slots = Array.from({ length: totalSlots }).map((_, i) => {
    const hStart = (startHour + i) % 24;
    return {
      label: `${hStart}h`,
      hourPlain: startHour + i
    };
  });

  return (
    <Container>
      <LegendBar>
        <span className="label">LÉGENDE EQUIPES:</span>
        {teams.map(t => (
          <LegendItem key={t.id} color={t.color || "#ccc"}>
            {t.name}
          </LegendItem>
        ))}
      </LegendBar>

      <GridArea>
        {/* Time Axis */}
        <TimeAxis>
          {slots.map((slot, i) => (
            <TimeSlotLabel key={i}>
              <span>{slot.label}</span>
            </TimeSlotLabel>
          ))}
        </TimeAxis>

        {/* Days Columns */}
        <ColumnsContainer>
          {dates.map(date => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayItems = computedSchedule.filter(s => s.date === dateStr);

            return (
              <DayColumn key={date.toISOString()}>
                <ColumnHeader>
                  <span className="dow">{format(date, "EEE.", { locale: fr }).toUpperCase()}</span>
                  <span className="day">{format(date, "d MMM", { locale: fr })}</span>
                </ColumnHeader>

                <Swimlane>
                  {slots.map((slot) => {
                    // Filter items starting in this hour
                    const slotStart = slot.hourPlain;
                    const slotEnd = slotStart + 1;

                    const slotItems = dayItems.filter(item => {
                      let t = parseTime(item.startTime);
                      // Normalize night times
                      if (timeSlot === "night" && t < 12) t += 24;
                      return t >= slotStart && t < slotEnd;
                    });

                    // Also include items spanning through this slot? 
                    // User said "petit rond". Dots usually imply "Start". 
                    // If we show coverage, we need blocks. 
                    // Let's show dots for STARTS in this slot for now.

                    return (
                      <SlotCell
                        key={slot.label}
                        onMouseEnter={(e) => handleSlotMouseEnter(e, date, slotItems)}
                        onMouseLeave={handleSlotMouseLeave}
                        onClick={() => {
                          // Click logic to remain empty/disabled for now as per previous logic
                        }}
                      >
                        <SlotDots>
                          {slotItems.map(item => (
                            <ShiftDot
                              key={item.id}
                              color={item.color || "#ccc"}
                              title={`${item.assigneeName || item.shiftName} (${item.startTime})`}
                            />
                          ))}
                        </SlotDots>
                      </SlotCell>
                    );
                  })}
                </Swimlane>
              </DayColumn>
            );
          })}
        </ColumnsContainer>
      </GridArea>

      {hoverPopover && (
        <MonthHoverPopover
          x={hoverPopover.x}
          y={hoverPopover.y}
          dateStr={hoverPopover.dateStr}
          items={hoverPopover.items}
          onMouseEnter={() => {
            clearHoverTimeout();
            clearOpenTimeout();
          }}
          onMouseLeave={() => {
            clearHoverTimeout();
            hoverTimeoutRef.current = setTimeout(() => setHoverPopover(null), 1000);
          }}
        />
      )}

    </Container>
  );
}
