import styled from "styled-components";
import { usePlanning } from "../features/planning/usePlanning";
import PlanningHeaderBar from "../features/planning/PlanningHeaderBar";
import PlanningGrid from "../features/planning/PlanningGrid";
import ShiftList from "../features/planning/ShiftList";

const Section = styled.section`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  display: grid;
  gap: 1.6rem;
`;

export default function Planning(): JSX.Element {
  const p = usePlanning();

  return (
    <Section>
      <PlanningHeaderBar
        weekISO={p.state.week}
        onPrev={p.gotoPrevWeek}
        onNext={p.gotoNextWeek}
        onCopyWeek={p.copyWeekForward}
        onAddShift={() => {}}
        onAddTeam={() => {}}
      />

      <ShiftList
        employees={p.employees}
        teams={p.teams}
        shifts={p.shifts}
        onCreateShift={(s) => p.createShift(s)}
        onUpdateShift={(s) => p.updateShift(s)}
        onDuplicateShift={(id) => p.duplicateShift(id)}
        onDeleteShift={(id) => p.deleteShift(id)}
        onCreateTeam={(t) => p.createTeam(t)}
        onUpdateTeam={(t) => p.updateTeam(t)}
        onDeleteTeam={(id) => p.deleteTeam(id)}
      />

      <PlanningGrid
        shifts={Object.values(p.shifts)}
        teams={p.teams}
        employees={p.employees}
        dayConflicts={p.dayConflicts}
      />
    </Section>
  );
}
