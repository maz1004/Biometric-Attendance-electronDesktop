import styled, { css } from "styled-components";
import { Team } from "../../types";

interface TeamListProps {
  teams: Team[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  mode?: "chips" | "list"; // chips = horizontal filter, list = vertical checkbox
  emptyMessage?: string;
}

const ListContainer = styled.div<{ $mode: "chips" | "list" }>`
  display: flex;
  
  ${props => props.$mode === "chips" && css`
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    overflow-x: auto;
    flex: 1; /* Take available width in parent */
    padding: 2px; /* Prevent scrollbar clipping */
    
    /* Hide Scrollbar */
    &::-webkit-scrollbar { display: none; }
    -ms-overflow-style: none; 
    scrollbar-width: none; 
  `}

  ${props => props.$mode === "list" && css`
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `}
`;

// --- Chip Styles ---
const TeamChip = styled.button<{ $selected: boolean; $color: string }>`
  border: 1px solid ${props => props.$selected ? "transparent" : "var(--color-border-element)"};
  background: ${props => props.$selected ? props.$color : "var(--color-grey-0)"};
  color: ${props => props.$selected ? "white" : "var(--color-text-secondary)"};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${props => props.$selected ? "0 2px 4px rgba(0,0,0,0.1)" : "none"};
  flex-shrink: 0; /* Important for chips scroll */

  &:hover {
    background: ${props => props.$selected ? props.$color : "var(--color-bg-hover)"};
    border-color: ${props => props.$selected ? "transparent" : "var(--color-primary-light)"};
  }
`;

// --- List Item Styles ---
const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--color-grey-50);
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--color-primary);
  }

  span {
    font-size: 0.95rem;
  }
`;

// Helper for consistency
const TEAM_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];
const getTeamColor = (index: number) => TEAM_COLORS[index % TEAM_COLORS.length];

export default function TeamList({
  teams,
  selectedIds,
  onToggle,
  mode = "chips",
  emptyMessage = "Aucune équipe disponible"
}: TeamListProps) {

  if (teams.length === 0) {
    return (
      <ListContainer $mode={mode}>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem', padding: '0.5rem' }}>{emptyMessage}</span>
      </ListContainer>
    );
  }

  return (
    <ListContainer $mode={mode}>
      {teams.map((team, index) => {
        const isSelected = selectedIds.includes(team.id);
        const color = team.color || getTeamColor(index);

        if (mode === "chips") {
          return (
            <TeamChip
              key={team.id}
              $selected={isSelected}
              $color={color}
              onClick={() => onToggle(team.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? 'white' : color }}></span>
              {team.name}
            </TeamChip>
          );
        }

        // List Mode
        return (
          <CheckboxItem key={team.id}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(team.id)}
            />
            <span style={{ color: color, fontWeight: 500 }}>{team.name}</span>
          </CheckboxItem>
        );
      })}
    </ListContainer>
  );
}
