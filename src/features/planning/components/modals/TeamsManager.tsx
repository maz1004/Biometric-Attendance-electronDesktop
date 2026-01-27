import styled from "styled-components";
import { Team } from "../../types";
import { HiPlus } from "react-icons/hi2";
import TeamList from "../ui/TeamList";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-border-subtle);
  /* overflow-x handled by TeamList */
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: var(--color-border-element);
  margin: 0 0.5rem;
`;

const AddButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px dashed var(--color-border-element);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-light-translucent);
  }
`;

interface TeamsManagerProps {
  teams: Team[];
  selectedTeamIds: string[];
  onToggleSelect: (teamId: string) => void;
  onAddTeam: () => void;
  onDeleteSelected: () => void;
}

export default function TeamsManager({
  teams,
  selectedTeamIds,
  onToggleSelect,
  onAddTeam
}: TeamsManagerProps) {
  console.log("TeamsManager rendered with teams:", teams); // Debug

  return (
    <Container>
      <TeamList
        teams={teams}
        selectedIds={selectedTeamIds}
        onToggle={onToggleSelect}
        mode="chips"
        emptyMessage="Aucune équipe (créez-en une +)"
      />

      <Separator />

      <AddButton onClick={onAddTeam} title="Ajouter une équipe">
        <HiPlus />
      </AddButton>
    </Container>
  );
}
