import { useState } from "react";
import styled from "styled-components";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent
} from "@dnd-kit/core";
import { usePlanning } from "../features/planning/usePlanning";
import PlanningHeaderBar from "../features/planning/PlanningHeaderBar";
import TimetableGrid from "../features/planning/TimetableGrid";
import TeamList from "../features/planning/TeamList";
import ShiftList from "../features/planning/ShiftList";
import ShiftEditModal from "../features/planning/ShiftEditModal";
import Spinner from "../ui/Spinner";

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
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: any) {
    setActiveDragId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // active.id = shiftId (from ShiftList)
    // over.id = "cell-employeeId#YYYY-MM-DD"

    const shiftId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith("cell-")) {
      // Remove "cell-" prefix
      const content = overId.substring(5);
      if (content.includes("#")) {
        const [employeeId, dateStr] = content.split("#");

        p.assignUserToShift({
          shift_id: shiftId,
          user_id: employeeId,
          notes: `Assigned via Drag-n-Drop for ${dateStr}`,
          assigned_at: dateStr, // Pass the specific date
        });
      }
    }
  }

  if (p.isLoading) return <Spinner />;

  const activeShift = activeDragId ? p.shifts[activeDragId] : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

          <TimetableGrid
            employees={Object.values(p.employees)}
            userShifts={p.userShifts}
            weekStartDate={new Date(p.state.week)}
            allShifts={p.shifts}
          />

          <ShiftList
            employees={p.employees}
            teams={p.teams}
            shifts={p.shifts}
            onCreateShift={(s) => p.createShift({
              name: s.name,
              start_time: s.startTime,
              end_time: s.endTime,
              days_of_week: s.daysOfWeek,
              team_id: s.teamId || "",
              max_members: 10,
            })}
            onUpdateShift={(s) => p.updateShift({
              id: s.id,
              data: {
                name: s.name,
                start_time: s.startTime,
                end_time: s.endTime,
                days_of_week: s.daysOfWeek,
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

      <DragOverlay>
        {activeShift ? (
          <div style={{ padding: '8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px', width: '200px' }}>
            {activeShift.name} ({activeShift.startTime} - {activeShift.endTime})
          </div>
        ) : null}
      </DragOverlay>

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
                start_time: updatedShift.startTime,
                end_time: updatedShift.endTime,
                days_of_week: updatedShift.daysOfWeek,
              }
            });
          }}
          onDelete={(id) => p.deleteShift(id)}
        />
      )}
    </DndContext>
  );
}
