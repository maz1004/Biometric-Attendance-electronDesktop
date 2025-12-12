import { useState } from "react";
import styled from "styled-components";
import { usePlanning } from "../features/planning/usePlanning";
import PlanningHeaderBar from "../features/planning/PlanningHeaderBar";
import WeeklyTimesheet from "../features/planning/WeeklyTimesheet";
import TeamList from "../features/planning/TeamList";
import ShiftList from "../features/planning/ShiftList";
import ShiftEditModal from "../features/planning/ShiftEditModal";
import Spinner from "../ui/Spinner";
import { DayKey } from "../features/planning/PlanningTypes";

const Section = styled.section`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;



export default function Planning(): JSX.Element {
  const p = usePlanning();

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  if (p.isLoading) return <Spinner />;

  return (
    <>
      <Section>
        <PlanningHeaderBar
          weekISO={p.state.week}
          onPrev={p.gotoPrevWeek}
          onNext={p.gotoNextWeek}
          onCopyWeek={p.copyWeekForward}
          onAddShift={() => { }}
          onAddTeam={() => { }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>
          <TeamList teams={p.teams} employees={p.employees} />

          <WeeklyTimesheet
            shifts={Object.values(p.shifts)}
            employees={p.employees}
            teams={p.teams}
            weekStart={new Date(p.state.week)}
            onShiftMove={(shiftId: string, newDay: DayKey, newStart: string, newEnd: string) => {
              p.updateShift({
                id: shiftId,
                data: {
                  days_of_week: [newDay],
                  start_time: newStart,
                  end_time: newEnd
                }
              });
            }}
            onShiftClick={(id: string) => setEditingShiftId(id)}
          />

          <ShiftList
            employees={p.employees}
            teams={p.teams}
            shifts={p.shifts}
            onCreateShift={(s) => p.createShift({
              name: s.name,
              start_time: s.start,
              end_time: s.end,
              days_of_week: s.daysActive,
              team_id: s.teamIds[0] || "",
              max_members: 10,
            })}
            onUpdateShift={(s) => p.updateShift({
              id: s.id,
              data: {
                name: s.name,
                start_time: s.start,
                end_time: s.end,
                days_of_week: s.daysActive,
              }
            })}
            onDuplicateShift={(id) => {
              console.log('Duplicate shift:', id);
            }}
            onDeleteShift={(id) => p.deleteShift(id)}
            onCreateTeam={(t) => p.createTeam({
              name: t.name,
              department: "General",
              manager_id: "",
            })}
            onUpdateTeam={(t) => p.updateTeam({
              id: t.id,
              data: { name: t.name }
            })}
            onDeleteTeam={(id) => p.deleteTeam(id)}
          />
        </div>
      </Section>

      {editingShiftId && p.shifts[editingShiftId] && (
        <ShiftEditModal
          shift={p.shifts[editingShiftId]}
          teams={p.teams}
          onClose={() => setEditingShiftId(null)}
          onSave={(updatedShift) => {
            p.updateShift({
              id: updatedShift.id,
              data: {
                name: updatedShift.name,
                start_time: updatedShift.start,
                end_time: updatedShift.end,
                days_of_week: updatedShift.daysActive,
                // Handle team update if needed, currently updateShift might not support it directly in all implementations
                // but let's assume it does or we ignore for now
              }
            });
          }}
          onDelete={(id) => p.deleteShift(id)}
        />
      )}
    </>
  );
}
