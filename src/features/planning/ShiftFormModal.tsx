import { useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import { DayKey, EmployeeMini, Shift, Team } from "./PlanningTypes";
import VirtualizedSelector, { Option } from "./VirtualizedSelector";

const Card = styled.div`
  width: min(90vw, 680px);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.6rem;
  display: grid;
  gap: 1.2rem;
`;
const Row = styled.div`
  display: grid;
  gap: 0.4rem;
`;
const Label = styled.label`
  font-size: 1.2rem;
  color: var(--color-text-dim);
`;
const Input = styled.input`
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
  padding: 0.7rem 1rem;
`;
const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
`;
const DayBtn = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-toolbar-input-border);
  background: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-toolbar-input-bg)"};
  color: ${(p) => (p.$active ? "#fff" : "var(--color-text-strong)")};
`;

export default function ShiftFormModal(props: {
  initial?: Shift;
  employees: Record<string, EmployeeMini>;
  teams: Record<string, Team>;
  onCloseModal: () => void;
  onSave: (data: Omit<Shift, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(props.initial?.name ?? "");
  const [start, setStart] = useState(props.initial?.startTime ?? "08:00");
  const [end, setEnd] = useState(props.initial?.endTime ?? "16:00");
  const [days, setDays] = useState<DayKey[]>(
    (props.initial?.daysOfWeek as DayKey[]) ?? [0, 1, 2, 3, 4]
  );
  const [teamSel, setTeamSel] = useState<Set<string>>(
    new Set(props.initial?.teamId ? [props.initial.teamId] : [])
  );
  const [extraSel, setExtraSel] = useState<Set<string>>(new Set());

  const teamOptions: Option[] = useMemo(
    () =>
      Object.values(props.teams).map((t) => ({
        id: t.id,
        label: t.name,
        meta: `${t.memberIds?.length ?? 0} users`,
      })),
    [props.teams]
  );

  const userOptions: Option[] = useMemo(
    () =>
      Object.values(props.employees).map((e) => ({
        id: e.id,
        label: e.name,
        meta: e.department,
      })),
    [props.employees]
  );

  function toggleDay(d: DayKey) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }
  function toggleTeam(id: string) {
    setTeamSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleUser(id: string) {
    setExtraSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // live total
  const totalMembers = useMemo(() => {
    const teamMembers = Array.from(teamSel).flatMap(
      (tid) => props.teams[tid]?.memberIds ?? []
    );
    return new Set([...teamMembers, ...Array.from(extraSel)]).size;
  }, [teamSel, extraSel, props.teams]);

  return (
    <Card>
      <div style={{ fontWeight: 700 }}>
        {props.initial ? "Edit Shift" : "Create Shift"}
      </div>

      <Row>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Morning / Evening…"
        />
      </Row>

      <Row
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div>
          <Label>Start</Label>
          <Input
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="08:00"
          />
        </div>
        <div>
          <Label>End</Label>
          <Input
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="16:00"
          />
        </div>
      </Row>

      <Row>
        <Label>Active days</Label>
        <DayGrid>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <DayBtn
              key={d}
              $active={days.includes(i as DayKey)}
              onClick={() => toggleDay(i as DayKey)}
            >
              {d}
            </DayBtn>
          ))}
        </DayGrid>
      </Row>

      <Row
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div>
          <Label>Attach teams</Label>
          <VirtualizedSelector
            options={teamOptions}
            selected={teamSel}
            onToggle={toggleTeam}
            placeholder="Search teams…"
          />
        </div>
        <div>
          <Label>Extra members</Label>
          <VirtualizedSelector
            options={userOptions}
            selected={extraSel}
            onToggle={toggleUser}
            placeholder="Search users…"
          />
        </div>
      </Row>

      <small style={{ opacity: 0.8 }}>
        {totalMembers} unique members in this shift
      </small>

      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: ".6rem" }}
      >
        <Button variation="secondary" size="small" onClick={props.onCloseModal}>
          Cancel
        </Button>
        <Button
          variation="primary"
          size="small"
          onClick={() => {
            const firstTeamId = Array.from(teamSel)[0];
            props.onSave({
              id: props.initial?.id,
              name,
              startTime: start,
              endTime: end,
              daysOfWeek: days,
              teamId: firstTeamId,
              isActive: true,
            });
            props.onCloseModal();
          }}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}
