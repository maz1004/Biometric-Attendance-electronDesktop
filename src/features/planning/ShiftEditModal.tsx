import styled from "styled-components";
import { useState } from "react";
import { Shift, Team } from "./PlanningTypes";
import { HiX } from "react-icons/hi";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); // backdrop-blur-sm
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-bg-elevated);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3.2rem 4rem;
  transition: all 0.5s;
  z-index: 1001;
  width: 50rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 1.4rem;
`;

const Input = styled.input`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-bg-elevated);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  box-shadow: var(--shadow-sm);
`;

const Select = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-bg-elevated);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  box-shadow: var(--shadow-sm);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  font-size: 1.4rem;
  padding: 1.2rem 1.6rem;
  font-weight: 500;
  cursor: pointer;
  
  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          color: var(--color-brand-50);
          background-color: var(--color-brand-600);
          &:hover { background-color: var(--color-brand-700); }
        `;
      case "danger":
        return `
          color: var(--color-red-100);
          background-color: var(--color-red-700);
          &:hover { background-color: var(--color-red-800); }
        `;
      default:
        return `
          color: var(--color-grey-600);
          background-color: var(--color-bg-elevated);
          border: 1px solid var(--color-grey-200);
          &:hover { background-color: var(--color-bg-main); }
        `;
    }
  }}
`;

interface ShiftEditModalProps {
  shift: Shift;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
  teams: Record<string, Team>;
}

export default function ShiftEditModal({ shift, onClose, onSave, onDelete, teams }: ShiftEditModalProps) {
  const [name, setName] = useState(shift.name);
  const [start, setStart] = useState(shift.startTime);
  const [end, setEnd] = useState(shift.endTime);
  const [teamId, setTeamId] = useState(shift.teamId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...shift,
      name,
      startTime: start,
      endTime: end,
      teamId: teamId || undefined,
    });
    onClose();
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>Modifier le quart</Title>
          <CloseButton onClick={onClose}>
            <HiX />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nom</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6rem" }}>
            <FormGroup>
              <Label>Début</Label>
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Fin</Label>
              <Input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Équipe</Label>
            <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Aucune équipe</option>
              {Object.values(teams).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="danger" onClick={() => { onDelete(shift.id); onClose(); }}>
              Supprimer
            </Button>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" $variant="primary">
              Enregistrer
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
}
