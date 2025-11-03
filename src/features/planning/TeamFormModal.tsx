import { useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../ui/Button";
import { EmployeeMini, Team } from "./PlanningTypes";
import VirtualizedSelector, { Option } from "./VirtualizedSelector";

const Card = styled.div`
  width: min(90vw, 560px);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.6rem;
  display: grid;
  gap: 1rem;
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

export default function TeamFormModal(props: {
  initial?: Team;
  employees: Record<string, EmployeeMini>;
  onCloseModal: () => void;
  onSave: (data: Omit<Team, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(props.initial?.name ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(props.initial?.memberIds ?? [])
  );

  const options: Option[] = useMemo(
    () =>
      Object.values(props.employees).map((e) => ({
        id: e.id,
        label: e.name,
        meta: e.department,
      })),
    [props.employees]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <Card>
      <div style={{ fontWeight: 700 }}>
        {props.initial ? "Edit Team" : "Create Team"}
      </div>

      <Row>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Team name"
        />
      </Row>

      <Row>
        <Label>Members</Label>
        <VirtualizedSelector
          options={options}
          selected={selected}
          onToggle={toggle}
          placeholder="Search users…"
        />
        <small style={{ opacity: 0.8 }}>{selected.size} selected</small>
      </Row>

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
            props.onSave({
              id: props.initial?.id,
              name,
              memberIds: Array.from(selected),
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
