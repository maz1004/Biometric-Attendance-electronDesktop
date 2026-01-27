import styled from "styled-components";
import { ComputedSchedule, Team } from "../types";

// ----- STYLED COMPONENTS (Shared-ish with OperationalWeekView but simplified) -----

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-bg-main);
  overflow: hidden;
  height: 100%;
`;

const LegendBar = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-bg-main);
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
  background: var(--color-bg-main);
  display: flex;
  flex-direction: column;
  padding-top: 50px; /* Header Height */
  min-height: 700px;
`;

const TimeSlotLabel = styled.div`
  height: 60px;
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
  .generic-label { font-size: 0.75rem; font-weight: 500; color: var(--color-text-secondary); opacity: 0.7; }
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

const TEAM_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];
const getTeamColor = (index: number) => TEAM_COLORS[index % TEAM_COLORS.length];

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

  // 1. Define Slots based on Mode
  const startHour = timeSlot === "day" ? 8 : 19;
  const endHour = timeSlot === "day" ? 19 : 31;
  const totalSlots = endHour - startHour;

  const slots = Array.from({ length: totalSlots }).map((_, i) => {
    return {
      label: `${(startHour + i) % 24}h`,
      hourPlain: startHour + i
    };
  });

  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  // Mapping from JS Day Index (0=Sun) to our Column Order (Mon=0)
  // Day Index: Sun=0, Mon=1, Tue=2...
  // We want: Mon=0, Tue=1... Sun=6
  const getDayColumnIndex = (dateStr: string) => {
    // Relying on computedSchedule date being a valid date string.
    // In Template Mode, we might use a Reference Week (e.g., 2024-01-01 -> 2024-01-07)
    // 2024-01-01 is Monday.
    const d = new Date(dateStr);
    const day = d.getDay(); // 0-6 (Sun-Sat)
    return day === 0 ? 6 : day - 1;
  };

  return (
    <Container>
      <LegendBar>
        <span className="label">LÉGENDE EQUIPES (MODELE):</span>
        {teams.map(t => (
          <LegendItem key={t.id} color={teamColorMap.get(t.id) || "#ccc"}>
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
          {DAYS.map((dayName, index) => {
            // Find items for this day column (Mon=0, Sun=6)
            // We iterate schedule and match based on date->dayIndex
            const dayItems = computedSchedule.filter(s => getDayColumnIndex(s.date) === index);

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
                      let t = parseTime(item.startTime);
                      if (timeSlot === "night" && t < 12) t += 24;
                      return t >= slotStart && t < slotEnd;
                    });

                    return (
                      <SlotCell
                        key={slot.label}
                        onClick={(e) => {
                          onCellClick(index, slotStart, e, slotItems);
                        }}
                      >
                        <SlotDots>
                          {slotItems.map(item => (
                            <ShiftDot
                              key={item.id}
                              color={item.color || teamColorMap.get(item.teamId || "") || "#ccc"}
                              title={`${item.assigneeName || item.shiftName || "Unknown"} (${item.startTime})`}
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
    </Container>
  );
}
