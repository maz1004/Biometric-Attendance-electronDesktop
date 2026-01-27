import styled from "styled-components";
import { Team } from "../../../types";
import Button from "../../../../../ui/Button";
import { HiXMark, HiUserGroup } from "react-icons/hi2";
import { useState } from "react";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalCard = styled.div`
  background: white;
  width: 400px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border-element);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-subtle);

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-text-main);
  }
`;

const Body = styled.div`
  padding: 1rem;
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TeamOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid ${props => props.$selected ? "var(--color-primary)" : "var(--color-border-element)"};
  background: ${props => props.$selected ? "var(--color-primary-light)" : "white"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-grey-50);
  }

  .icon {
    color: var(--color-primary);
    background: var(--color-primary-light);
    padding: 8px;
    border-radius: 50%;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    strong { color: var(--color-text-main); }
    small { color: var(--color-text-secondary); }
  }
`;

interface TeamAssignModalProps {
  teams: Team[];
  onClose: () => void;
  onSelect: (teamId: string) => void;
}

export default function TeamAssignModal({ teams, onClose, onSelect }: TeamAssignModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <h3>Assign Team</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <HiXMark size={20} />
          </button>
        </Header>
        <Body>
          {teams.map(team => (
            <TeamOption
              key={team.id}
              $selected={selectedId === team.id}
              onClick={() => setSelectedId(team.id)}
              onDoubleClick={() => onSelect(team.id)}
            >
              <div className="icon"><HiUserGroup size={20} /></div>
              <div className="info">
                <strong>{team.name}</strong>
                <small>{team.department}</small>
              </div>
            </TeamOption>
          ))}
          {teams.length === 0 && (
            <p style={{ textAlign: "center", color: "gray", padding: "1rem" }}>No teams available.</p>
          )}
        </Body>
        <div style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border-element)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <Button variation="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variation="primary"
            disabled={!selectedId}
            onClick={() => selectedId && onSelect(selectedId)}
          >
            Confirm
          </Button>
        </div>
      </ModalCard>
    </Overlay>
  );
}
