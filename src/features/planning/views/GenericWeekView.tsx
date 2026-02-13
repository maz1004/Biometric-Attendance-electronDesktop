import { } from "react";
import styled, { css } from "styled-components";
import { ComputedSchedule, Team } from "../types";
import { computeDotVariant, DotVariant } from "../engine/dotRenderEngine";

// ----- STYLED COMPONENTS (Shared with OperationalWeekView) -----

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-bg-main);
  min-height: 880px; /* Full grid height */
`;

const GridArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-height: 500px;
`;

const TimeAxis = styled.div`
  width: 60px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border-element);
  background: var(--color-bg-main);
  display: flex;
  flex-direction: column;
  padding-top: 50px; /* Header Height */
  min-height: 880px; /* 11 slots x 80px */
`;

const TimeSlotLabel = styled.div`
  height: 80px;
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
  min-height: 880px; /* Match TimeAxis */
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
  .generic-label { font-size: 0.75rem; font-weight: 500; color: var(--color-text-secondary); opacity: 0.7; }
`;

const Swimlane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SlotCell = styled.div`
  height: 80px; /* MATCH TimeSlotLabel height */
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

const SlotDots = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ShiftDot = styled.div<{ $color: string; $variant?: 'filled' | 'hollow'; $isLinked?: boolean }>`
  width: ${p => p.$variant === 'hollow' ? '12px' : '14px'};
  height: ${p => p.$variant === 'hollow' ? '12px' : '14px'};
  border-radius: 50%;
  background-color: ${props => props.$variant === 'hollow' ? 'transparent' : props.$color};
  border: ${props => props.$variant === 'hollow' ? `2px solid ${props.$color}` : 'none'};
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.1s;
  position: relative;
  z-index: 2;

  &:hover {
    transform: scale(1.3);
    z-index: 10;
  }

  /* Linked Indicator (Left Bar) */
  ${props => props.$isLinked && css`
    &::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 80%;
      background-color: ${props.$color};
      border-radius: 2px;
      opacity: 0.7;
    }
  `}
`;

const ConnectorLine = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: ${props => props.$color};
  opacity: 0.4;
  z-index: 1;
  pointer-events: none;
`;

const MissingCheckoutBadge = styled.div`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #ef4444;
  border: 1px solid white;
  z-index: 11;
`;

// ----- HELPERS -----

const TEAM_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];
const getTeamColor = (index: number) => TEAM_COLORS[index % TEAM_COLORS.length];

// parseTime still used for filtering
const parseTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

// ----- COMPONENT -----

interface GenericWeekGridProps {
  computedSchedule: ComputedSchedule[];
  teams: Team[];
  timeSlot: "day" | "night";
  onCellClick: (dayIndex: number, slotHour: number, event: React.MouseEvent<HTMLDivElement>, currentAssignments: ComputedSchedule[]) => void;
}

export default function GenericWeekView({
  computedSchedule,
  teams,
  timeSlot,
  onCellClick
}: GenericWeekGridProps) {

  const teamColorMap = new Map<string, string>();
  teams.forEach((t, i) => teamColorMap.set(t.id, getTeamColor(i)));

  // Filter schedule
  const teamIds = new Set(teams.map(t => t.id));
  const filteredSchedule = computedSchedule.filter(s => {
    // Always show independent employees (no teamId)
    if (!s.teamId) return true;

    // Show team items only if the team is in the visible list
    if (!teamIds.has(s.teamId)) return false;

    // OVERRIDE LOGIC:
    // If this is a "Team Assignment" (s.type === 'team' or implicitly via teamId),
    // Check if there is an INDIVIDUAL assignment for this same employee on this day.
    // If so, hide the Team assignment (User Override takes precedence).

    // Note: computedSchedule items usually have `assigneeId` (which is userId for expanded shifts).
    // If an item is "Team Audit", it might not have assigneeId?

    if (s.assigneeId) {
      /*
      console.log(`[OverrideDebug] Checking Team Item: ${s.date} ${s.assigneeId} ${s.teamId}`);
      */
      const hasIndividualOverride = computedSchedule.some(override => {
        const isSameUser = override.assigneeId === s.assigneeId;
        const isIndividual = !override.teamId || override.teamId === 'unassigned' || override.teamId === 'GLOBAL';
        const isNotSelf = override.id !== s.id;
        const isSameDate = override.date === s.date; // IMPORTANT: Must be same day!

        /*
        if (isSameUser && isIndividual && isNotSelf && isSameDate) {
             console.log(`[OverrideDebug] FOUND OVERRIDE for ${s.assigneeId} on ${s.date}:`, override);
        }
        */

        return isSameUser && isIndividual && isNotSelf && isSameDate;
      });

      // If hasIndividualOverride, we skip this Team Item.
      if (hasIndividualOverride) return false;
    }

    return true;
  });

  // 1. Define Slots based on Mode
  const startHour = timeSlot === "day" ? 8 : 19;
  const endHour = timeSlot === "day" ? 19 : 31; // night starts 19:00, ends 07:00 (19+12=31) or similar logic
  const totalSlots = endHour - startHour;

  const slots = Array.from({ length: totalSlots }).map((_, i) => {
    return {
      label: `${(startHour + i) % 24}h`,
      hourPlain: startHour + i
    };
  });

  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  // Mapping from JS Day Index (0=Sun) to our Column Order (Mon=0)
  const getDayColumnIndex = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0-6 (Sun-Sat)
    return day === 0 ? 6 : day - 1;
  };

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
          {DAYS.map((dayName, index) => {
            // Find items for this day column (Mon=0, Sun=6)
            const dayItems = filteredSchedule.filter(s => getDayColumnIndex(s.date) === index);

            return (
              <DayColumn key={dayName}>
                <ColumnHeader>
                  <span className="dow">{dayName}</span>
                  <span className="generic-label">Modèle</span>
                </ColumnHeader>

                <Swimlane>
                  {slots.map((slot) => {
                    const slotStart = slot.hourPlain;
                    const slotEnd = slotStart + 1;

                    const slotItems = dayItems.filter(item => {
                      let tStart = parseTime(item.startTime);
                      let tEnd = parseTime(item.endTime);

                      if (timeSlot === "night") {
                        if (tStart < 12) tStart += 24;
                        if (tEnd < 12) tEnd += 24;
                      }

                      // Fix: Check for overlap, not just start time
                      // Include if item starts in slot, ends in slot, or spans slot
                      // But specifically handle the exact boundary for dots
                      // We want inclusion if:
                      // 1. Start is in [slotStart, slotEnd)
                      // 2. End is in (slotStart, slotEnd] -- strictly > slotStart to avoid clutter from previous end?
                      //    Actually, we want to draw the hollow dot at EndTime. If EndTime = 11.0, we draw in Slot 11 (if math.floor match).
                      // 3. Spans over

                      return tStart < slotEnd && tEnd >= slotStart;
                    });

                    return (
                      <SlotCell
                        key={slot.label}
                        onClick={(e) => {
                          onCellClick(index, slotStart, e, slotItems);
                        }}
                      >
                        {/* Draw connector lines first (underneath) */}
                        <SlotDots>
                          {slotItems.map(item => {
                            // Use dot render engine for clean variant computation
                            const variant: DotVariant = computeDotVariant(
                              item.startTime,
                              item.endTime,
                              slotStart,
                              timeSlot,
                              item.isCheckoutMarker
                            );

                            if (variant === null) return null;

                            if (variant === 'line') {
                              return (
                                <div key={item.id} style={{ position: 'relative', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ConnectorLine $color={item.color || "#ccc"} />
                                </div>
                              );
                            }

                            return (
                              <div key={item.id} style={{ position: 'relative', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Connector for continuity */}
                                {(variant === 'hollow' || variant === 'filled') && <ConnectorLine $color={item.color || "#ccc"} style={{ width: variant === 'filled' ? '50%' : '50%', left: variant === 'filled' ? '50%' : 0, right: 'auto' }} />}

                                <ShiftDot
                                  $color={item.color || teamColorMap.get(item.teamId || "") || "#ccc"}
                                  $variant={variant}
                                  $isLinked={!!item.teamId}
                                  title={`${item.assigneeName} (${item.startTime} - ${item.endTime})`}
                                >
                                  {/* Bug #1 fix: Red badge for missing checkout */}
                                  {variant === 'filled' && item.isMissingCheckout && <MissingCheckoutBadge title="Check-out manquant" />}
                                </ShiftDot>
                              </div>
                            );
                          })}
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
    </Container>
  );
}
