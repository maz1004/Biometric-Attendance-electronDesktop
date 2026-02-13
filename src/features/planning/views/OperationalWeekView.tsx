import { useState, useRef } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Team, ComputedSchedule } from "../types";
import MonthHoverPopover from "../components/popovers/MonthHoverPopover";
import { computeDotVariant, DotVariant } from "../engine/dotRenderEngine";



// ----- STYLED COMPONENTS -----

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-grey-0);
  overflow: hidden;
  height: 100%;
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
`;

const TimeSlotLabel = styled.div`
  height: 40px; /* Half-hourly slot height */
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
  height: 40px; /* MATCH TimeSlotLabel height */
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
  max-height: calc(100% - 8px);
  overflow-y: auto;
`;

const ShiftDot = styled.div<{ color: string; $variant?: 'filled' | 'hollow' | 'line'; $hasWarning?: boolean }>`
  width: ${props => props.$variant === 'line' ? '100%' : '14px'};
  height: ${props => props.$variant === 'line' ? '4px' : '14px'};
  border-radius: ${props => props.$variant === 'line' ? '2px' : '50%'};
  background-color: ${props => props.$variant === 'hollow' ? 'transparent' : props.color};
  border: ${props => props.$variant === 'hollow' ? `3px solid ${props.color}` : 'none'};
  box-sizing: border-box;
  box-shadow: ${props => props.$variant === 'line' ? 'none' : '0 1px 2px rgba(0,0,0,0.2)'};
  cursor: pointer;
  transition: transform 0.1s;
  position: relative;

  &:hover {
    transform: scale(1.3);
    z-index: 10;
  }

  /* Incomplete assignment indicator (check-in without check-out) */
  ${props => props.$hasWarning && `
    &::after {
      content: '!';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 10px;
      height: 10px;
      background: #ef4444;
      border-radius: 50%;
      font-size: 7px;
      font-weight: bold;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `}
`;

// ----- HELPERS -----



const parseTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

// Helper to extract hour from time string (e.g., "07:00" -> 7)
const extractHour = (time: string | undefined, fallback: number): number => {
  if (!time) return fallback;
  const [h] = time.split(":").map(Number);
  return h;
};

// ----- COMPONENT -----

// Type for settings (minimal)
interface PlanningSettings {
  planning_day_start?: string;
  planning_day_end?: string;
  planning_night_start?: string;
  planning_night_end?: string;
}

interface OperationalWeekGridProps {
  dates: Date[];
  teams: Team[];
  computedSchedule: ComputedSchedule[];
  timeSlot: "day" | "night";
  settings?: PlanningSettings; // NEW: Settings for dynamic time ranges
}

export default function OperationalWeekGrid({
  dates,
  teams,
  computedSchedule,
  timeSlot,
  settings,
}: OperationalWeekGridProps) {

  // console.log(`[OpView] Render. Dates: ${dates.length}, Items: ${computedSchedule.length}`);

  const [hoverPopover, setHoverPopover] = useState<{ x: number, y: number, dateStr: string, items: ComputedSchedule[], alignment?: 'left' | 'right' } | null>(null);
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
        const isNearRightEdge = rect.right > window.innerWidth - 350;

        setHoverPopover({
          x: isNearRightEdge ? rect.left : rect.left + rect.width,
          y: rect.top,
          dateStr: format(date, "yyyy-MM-dd"),
          items: items,
          alignment: isNearRightEdge ? 'left' : 'right'
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

  // 1. Define Slots based on Mode - NOW DYNAMIC from settings
  const dayStartHour = extractHour(settings?.planning_day_start, 7);
  const dayEndHour = extractHour(settings?.planning_day_end, 19);
  const nightStartHour = extractHour(settings?.planning_night_start, 19);
  const nightEndHour = extractHour(settings?.planning_night_end, 7);

  // Calculate actual start/end for the view
  const startHour = timeSlot === "day" ? dayStartHour : nightStartHour;
  // Night end is next day (add 24 to properly compute slot count)
  const endHour = timeSlot === "day" ? dayEndHour : (nightEndHour + 24);
  const totalSlots = (endHour - startHour) * 2; // Half-hourly: 2 slots per hour

  const slots = Array.from({ length: totalSlots }).map((_, i) => {
    const minuteOffset = i * 30;
    const hStart = (startHour + Math.floor(minuteOffset / 60)) % 24;
    const mStart = minuteOffset % 60;
    return {
      label: mStart === 0 ? `${hStart}h` : `${hStart}h30`,
      hourPlain: startHour + i * 0.5 // fractional hours for coverage
    };
  });

  // Debug Logs
  return (
    <Container>


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
                    // Filter items OVERLAPPING this half-hour slot
                    const slotStart = slot.hourPlain;
                    const slotEnd = slotStart + 0.5; // 30-minute slot width

                    const slotItems = dayItems.filter(item => {
                      let start = parseTime(item.startTime);
                      let end = parseTime(item.endTime);

                      // Handle Night Shift Crossing Midnight
                      if (timeSlot === "night") {
                        if (start < 12) start += 24;
                        if (end < 12) end += 24;
                        // Special case: end is 00:00 (next day) -> 24.0
                        // If end < start (e.g. 22:00 -> 06:00), end is next day.
                        if (end < start) end += 24;
                      }

                      // Check Overlap: Item Start < Slot End AND Item End >= Slot Start
                      // (>= needed for zero-duration markers where start === end)
                      return start < slotEnd && end >= slotStart;
                    });

                    // Update: Group by Team
                    const itemsByTeam = slotItems.reduce((acc, item) => {
                      const tid = item.teamId || "other";
                      if (!acc[tid]) acc[tid] = [];
                      acc[tid].push(item);
                      return acc;
                    }, {} as Record<string, typeof slotItems>);

                    // 3. Sort Groups: Teams in Legend Order + Others
                    const teamIds = new Set(teams.map(t => t.id));
                    const sortedGroups = [
                      ...teams.map(t => ({ id: t.id, team: t, items: itemsByTeam[t.id] })),
                      ...Object.keys(itemsByTeam)
                        .filter(k => !teamIds.has(k))
                        .map(k => ({ id: k, team: undefined, items: itemsByTeam[k] }))
                    ].filter(g => g.items && g.items.length > 0);

                    return (
                      <SlotCell
                        key={slot.label}
                        onMouseEnter={(e) => handleSlotMouseEnter(e, date, slotItems)}
                        onMouseLeave={handleSlotMouseLeave}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '2px' }}
                      >
                        {sortedGroups.map(({ id: teamId, team, items }) => {
                          const isPlaceholdersOnly = items.every(i => i.isPlaceholder);

                          if (isPlaceholdersOnly) {
                            // Just show a colored bar for placeholder
                            return (
                              <div key={teamId} style={{ width: '100%', height: '6px', backgroundColor: team?.color || items[0].color, borderRadius: 3, opacity: 0.5, marginBottom: 1 }} title={team?.name || "Placeholder"} />
                            );
                          }

                          return (
                            <div key={teamId} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              marginBottom: '2px',
                              maxWidth: '100%',
                              flexWrap: 'wrap'
                            }}>
                              <SlotDots>
                                {items.map(item => {
                                  // Use dot render engine for correct variant
                                  const variant: DotVariant = computeDotVariant(
                                    item.startTime,
                                    item.endTime,
                                    slot.hourPlain,
                                    timeSlot,
                                    item.isCheckoutMarker
                                  );
                                  if (variant === null) return null;

                                  // Check if assignment is incomplete (has check-in but no check-out)
                                  const hasIncompleteAssignment = item.isMissingCheckout;
                                  return (
                                    <div key={`${item.id}-${slot.hourPlain}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: team ? 4 : 0 }}>
                                      {/* Tiny Team Indicator Bar - Behind & Peek Left */}
                                      {team && variant !== 'line' && <div style={{
                                        position: 'absolute',
                                        left: -4,
                                        top: 1,
                                        width: 8,
                                        height: 12,
                                        backgroundColor: team.color,
                                        borderRadius: 2,
                                        zIndex: 0
                                      }} title={team.name} />}

                                      <ShiftDot
                                        color={item.color || "#ccc"}
                                        $variant={variant}
                                        $hasWarning={hasIncompleteAssignment && variant === 'filled'}
                                        style={{ position: 'relative', zIndex: 1 }}
                                        title={variant === 'hollow'
                                          ? `${item.assigneeName || item.shiftName} - Check-out ${item.endTime}`
                                          : variant === 'filled'
                                            ? `${item.assigneeName || item.shiftName} - Check-in ${item.startTime}`
                                            : `${item.assigneeName || item.shiftName}`}
                                      />
                                    </div>
                                  );
                                })}
                              </SlotDots>
                            </div>
                          )
                        })}
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
          alignment={hoverPopover.alignment}
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
