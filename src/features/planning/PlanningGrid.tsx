import styled from "styled-components";
import { DayKey, EmployeeMini, Shift, Team } from "./PlanningTypes";
import { useMemo, useState } from "react";
import Button from "../../ui/Button";

const Wrap = styled.div`
  display: grid;
  gap: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 220px repeat(7, 1fr);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

const Head = styled.div`
  display: contents;
  & > div {
    background: var(--color-bg-elevated);
    font-weight: 700;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-border-card);
  }
  & > div:not(:first-child) {
    text-align: center;
  }
`;

const Row = styled.div`
  display: contents;
`;

const CellHead = styled.div`
  background: var(--color-toolbar-bg);
  border-right: 1px solid var(--color-border-card);
  padding: 0.8rem 1rem;
  font-weight: 600;
  display: grid;
  gap: 0.4rem;
`;

const Times = styled.div`
  font-size: 1.1rem;
  color: var(--color-text-dim);
`;

const Cell = styled.div<{ $conflict?: boolean }>`
  border-left: 1px solid var(--color-border-card);
  border-top: 1px solid var(--color-border-card);
  min-height: 64px;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: ${(p) => (p.$conflict ? "rgba(244,63,94,.06)" : "transparent")};
`;

const Muted = styled.span`
  font-size: 1.1rem;
  color: var(--color-text-dim);
`;

const Badge = styled.span<{ $tone?: "neutral" | "warn" }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid
    ${(p) =>
      p.$tone === "warn" ? "var(--color-danger-200)" : "var(--color-grey-300)"};
  background: ${(p) =>
    p.$tone === "warn" ? "rgba(244,63,94,.06)" : "var(--color-bg-elevated)"};
  border-radius: 999px;
  font-size: 1.1rem;
`;

const Drawer = styled.div`
  grid-column: 1 / -1;
  border-top: 1px dashed var(--color-border-card);
  padding: 0.7rem 1rem;
  background: var(--color-bg-elevated);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
`;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function uniqueMembersForShift(sh: Shift, teams: Record<string, Team>) {
  const teamMembers = sh.teamIds.flatMap((tid) => teams[tid]?.memberIds ?? []);
  return Array.from(new Set([...teamMembers, ...sh.extraMemberIds]));
}

function ShiftRow(props: {
  sh: Shift;
  teams: Record<string, Team>;
  employees: Record<string, EmployeeMini>;
  dayConflicts: Record<DayKey, Set<string>>;
}) {
  const [open, setOpen] = useState(false);
  const allMembers = useMemo(
    () => uniqueMembersForShift(props.sh, props.teams),
    [props.sh, props.teams]
  );

  return (
    <>
      <CellHead>
        <div style={{ fontWeight: 700 }}>{props.sh.name}</div>
        <Times>
          {props.sh.start} → {props.sh.end}
        </Times>
        <Button
          onClick={() => setOpen((v) => !v)}
          size="small"
          variation="secondary"
        >
          {open ? "Hide members" : "Show members"}
        </Button>
      </CellHead>

      {(Array.from({ length: 7 }).map((_, i) => i) as DayKey[]).map((day) => {
        const active = props.sh.daysActive.includes(day);
        const conflictHere =
          active && allMembers.some((id) => props.dayConflicts[day]?.has(id));
        const conflictCount = conflictHere
          ? Array.from(props.dayConflicts[day] ?? []).filter((id) =>
              allMembers.includes(id)
            ).length
          : 0;

        return (
          <Cell key={`${props.sh.id}-${day}`} $conflict={conflictHere}>
            {active ? (
              <>
                <Badge>{allMembers.length} users</Badge>
                {conflictHere && (
                  <Badge $tone="warn">{conflictCount} conflict(s)</Badge>
                )}
              </>
            ) : (
              <Muted>—</Muted>
            )}
          </Cell>
        );
      })}

      {open && (
        <Drawer>
          {allMembers.map((id) => (
            <span key={id}>{props.employees[id]?.name ?? id}</span>
          ))}
        </Drawer>
      )}
    </>
  );
}

// 🟩 New: show all teams, even if not in a shift
function TeamRow(props: {
  team: Team;
  employees: Record<string, EmployeeMini>;
}) {
  const [open, setOpen] = useState(false);
  const members = props.team.memberIds.map(
    (id) => props.employees[id]?.name ?? id
  );

  return (
    <>
      <CellHead>
        <div style={{ fontWeight: 700 }}>{props.team.name}</div>
        <Times>{members.length} member(s)</Times>
        <Button onClick={() => setOpen((v) => !v)}>
          {open ? "Hide members" : "Show members"}
        </Button>
      </CellHead>

      {DAYS.map((d) => (
        <Cell key={`${props.team.id}-${d}`}>
          <Muted>—</Muted>
        </Cell>
      ))}

      {open && (
        <Drawer>
          {members.length ? (
            members.map((m) => <span key={m}>{m}</span>)
          ) : (
            <Muted>No members yet</Muted>
          )}
        </Drawer>
      )}
    </>
  );
}

export default function PlanningGrid(props: {
  shifts: Shift[];
  teams: Record<string, Team>;
  employees: Record<string, EmployeeMini>;
  dayConflicts: Record<DayKey, Set<string>>;
}) {
  const teamsWithoutShifts = useMemo(() => {
    const used = new Set(
      props.shifts.flatMap((s) => s.teamIds.map((id) => id))
    );
    return Object.values(props.teams).filter((t) => !used.has(t.id));
  }, [props.shifts, props.teams]);

  return (
    <Wrap>
      <Grid>
        <Head>
          <div>Shift / Team</div>
          {DAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </Head>

        {/* all shifts */}
        {props.shifts.map((sh) => (
          <Row key={sh.id}>
            <ShiftRow
              sh={sh}
              teams={props.teams}
              employees={props.employees}
              dayConflicts={props.dayConflicts}
            />
          </Row>
        ))}

        {/* show teams that are not in any shift */}
        {teamsWithoutShifts.map((team) => (
          <Row key={team.id}>
            <TeamRow team={team} employees={props.employees} />
          </Row>
        ))}
      </Grid>
    </Wrap>
  );
}
