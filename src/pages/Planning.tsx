import styled from "styled-components";
import { usePlanning } from "../features/planning/usePlanning";
import PlanningHeaderBar from "../features/planning/PlanningHeaderBar";
import TimetableGrid from "../features/planning/TimetableGrid";
import TeamList from "../features/planning/TeamList";
import ShiftList from "../features/planning/ShiftList";
import Spinner from "../ui/Spinner";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";

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

const PlanningLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
`;

export default function Planning(): JSX.Element {
  const p = usePlanning();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.data.current?.type === "member" && over.data.current?.type === "shift") {
      const memberId = active.data.current.id;
      const shiftId = over.data.current.id;

      p.assignUserToShift({
        shift_id: shiftId,
        user_id: memberId,
        assigned_by: "admin", // TODO: Get actual user ID
      });
    }
  }

  if (p.isLoading) return <Spinner />;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Section>
        <PlanningHeaderBar
          weekISO={p.state.week}
          onPrev={p.gotoPrevWeek}
          onNext={p.gotoNextWeek}
          onCopyWeek={p.copyWeekForward}
          onAddShift={() => { }}
          onAddTeam={() => { }}
        />

        <PlanningLayout>
          <TeamList teams={p.teams} employees={p.employees} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <TimetableGrid
              shifts={Object.values(p.shifts)}
              employees={p.employees}
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
                team_id: s.teamIds[0] || "", // Assuming single team for now
                max_members: 10, // Default or add to form
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
                department: "General", // Default or add to form
                manager_id: "", // Default or add to form
              })}
              onUpdateTeam={(t) => p.updateTeam({
                id: t.id,
                data: { name: t.name }
              })}
              onDeleteTeam={(id) => p.deleteTeam(id)}
            />
          </div>
        </PlanningLayout>
      </Section>
      <DragOverlay>
        {activeId ? (
          <div style={{
            padding: '0.4rem 0.8rem',
            background: 'var(--color-brand-100)',
            color: 'var(--color-brand-700)',
            borderRadius: '999px',
            border: '1px solid var(--color-brand-200)',
            fontWeight: 500
          }}>
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
