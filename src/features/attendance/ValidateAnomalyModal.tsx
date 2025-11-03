import styled from "styled-components";
import Button from "../../ui/Button";
import { AttendanceRecord, StatusType } from "./AttendanceTypes";
import { useState } from "react";

const Card = styled.div`
  width: min(90vw, 460px);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.8rem;
  display: grid;
  gap: 1rem;
`;

const Row = styled.div`
  display: grid;
  gap: 0.4rem;
`;
const Label = styled.div`
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
const Select = styled.select`
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
  padding: 0.7rem 1rem;
`;
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

export default function ValidateAnomalyModal(props: {
  record: AttendanceRecord;
  onCloseModal: () => void;
  onValidate: (payload: {
    id: string;
    newStatus: StatusType;
    justification: string;
  }) => void;
}) {
  const [newStatus, setNewStatus] = useState<StatusType>(props.record.status);
  const [justif, setJustif] = useState<string>(
    props.record.justification ?? ""
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, color: "var(--color-text-strong)" }}>
        Validate / Justify
      </div>

      <Row>
        <Label>Employee</Label>
        <div>
          {props.record.fullName} • {props.record.dateISO}
        </div>
      </Row>

      <Row>
        <Label>Set status</Label>
        <Select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as StatusType)}
        >
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="left-early">Left early</option>
          <option value="manual">Manual</option>
        </Select>
      </Row>

      <Row>
        <Label>Justification (optional)</Label>
        <Input
          placeholder="Reason / note…"
          value={justif}
          onChange={(e) => setJustif(e.target.value)}
        />
      </Row>

      <Footer>
        <Button variation="secondary" size="small" onClick={props.onCloseModal}>
          Cancel
        </Button>
        <Button
          variation="primary"
          size="small"
          onClick={() => {
            props.onValidate({
              id: props.record.id,
              newStatus,
              justification: justif,
            });
            props.onCloseModal();
          }}
        >
          Save
        </Button>
      </Footer>
    </Card>
  );
}
