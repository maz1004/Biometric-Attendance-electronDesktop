import styled from "styled-components";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Table from "../../ui/Table";
import { EmployeeMini, Shift, Team } from "./PlanningTypes";
import ShiftFormModal from "./ShiftFormModal";
import TeamFormModal from "./TeamFormModal";
import { useState } from "react";

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-toolbar-bg);
  border: 1px solid var(--color-toolbar-border);
  border-radius: var(--border-radius-md);
  padding: 1rem 1.2rem;
  gap: 1rem;
`;
const Search = styled.input`
  min-width: 240px;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
`;

export default function ShiftList(props: {
  employees: Record<string, EmployeeMini>;
  teams: Record<string, Team>;
  shifts: Record<string, Shift>;
  onCreateShift: (s: Omit<Shift, "id">) => void;
  onUpdateShift: (s: Shift) => void;
  onDuplicateShift: (id: string) => void;
  onDeleteShift: (id: string) => void;
  onCreateTeam: (t: Omit<Team, "id">) => void;
  onUpdateTeam: (t: Team) => void;
  onDeleteTeam: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const rows = Object.values(props.shifts).filter((sh) =>
    sh.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Modal>
        <HeaderBar>
          <div style={{ display: "flex", gap: ".8rem", alignItems: "center" }}>
            <strong style={{ color: "var(--color-text-strong)" }}>
              Shifts
            </strong>
            <Search
              placeholder="Search shifts…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <Modal.Open opens="create-team">
              <Button>Add team</Button>
            </Modal.Open>
            <Modal.Open opens="create-shift">
              <Button>Add shift</Button>
            </Modal.Open>
          </div>
        </HeaderBar>

        <Table columns="1.1fr 0.8fr 0.8fr 0.9fr 0.9fr">
          <Table.Header>
            <div>Name</div>
            <div>Start</div>
            <div>End</div>
            <div>Attached</div>
            <div>Actions</div>
          </Table.Header>

          <Table.Body
            data={rows}
            render={(r) => {
              const teamCount = r.teamIds.length;
              const extra = r.extraMemberIds.length;
              return (
                <Table.Row key={r.id}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div>{r.start}</div>
                  <div>{r.end}</div>
                  <div style={{ color: "var(--color-text-dim)" }}>
                    {teamCount} team(s) • {extra} extra
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: ".6rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Modal.Open opens={`edit-${r.id}`}>
                      <Button size="small">Edit</Button>
                    </Modal.Open>
                    <Button
                      variation="secondary"
                      size="small"
                      onClick={() => props.onDuplicateShift(r.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variation="danger"
                      size="small"
                      onClick={() => props.onDeleteShift(r.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  <Modal.Window name={`edit-${r.id}`}>
                    <ShiftFormModal
                      initial={r}
                      employees={props.employees}
                      teams={props.teams}
                      onCloseModal={() => {}}
                      onSave={(data) =>
                        props.onUpdateShift({ id: r.id, ...data })
                      }
                    />
                  </Modal.Window>
                </Table.Row>
              );
            }}
          />

          <Table.Footer />
        </Table>

        <Modal.Window name="create-shift">
          <ShiftFormModal
            employees={props.employees}
            teams={props.teams}
            onCloseModal={() => {}}
            onSave={(data) => props.onCreateShift(data)}
          />
        </Modal.Window>

        <Modal.Window name="create-team">
          <TeamFormModal
            employees={props.employees}
            onCloseModal={() => {}}
            onSave={(data) => props.onCreateTeam(data)}
          />
        </Modal.Window>
      </Modal>
    </div>
  );
}
