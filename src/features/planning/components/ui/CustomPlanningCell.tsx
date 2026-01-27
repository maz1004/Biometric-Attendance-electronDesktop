import styled, { css } from 'styled-components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Team } from '../../types';

export type CellMode = 'operational' | 'strategic' | 'read-only';

interface CustomPlanningCellProps {
  date: Date;
  activeTeams: Team[]; // Teams active on this day
  activeUnassignedCount?: number; // Count of individual employees assigned
  onClick: () => void;
  teamColors: Map<string, string>; // Team ID -> Color
  isSelected?: boolean;

  // New Architecture Props
  mode?: CellMode;
  dayKey?: string;  // e.g. '2026-01-14'
  weekKey?: string; // e.g. '2026-W03'
}

const CellContainer = styled.div<{ $isSelected?: boolean; $mode: CellMode }>`
  height: 100%;
  width: 100%;
  min-height: 80px;
  background-color: ${props => props.$isSelected ? 'var(--color-bg-subtle)' : 'var(--color-grey-0)'};
  border-bottom: 1px solid var(--color-border-element);
  border-right: 1px solid var(--color-border-element);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background-color 0.2s;

  /* Mode-based behavior */
  ${props => {
    switch (props.$mode) {
      case 'read-only':
        return css`
          cursor: default;
          /* No hover effect */
        `;
      case 'strategic':
        return css`
          cursor: pointer;
          &:hover {
            background-color: var(--color-bg-subtle); /* Lighter hover */
          }
        `;
      case 'operational':
      default:
        return css`
          cursor: pointer;
          &:hover {
            background-color: var(--color-bg-hover); /* Strong hover */
          }
        `;
    }
  }}
`;

const DotsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Dot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

const DayLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
  text-transform: capitalize;
`;

const UnassignedTag = styled.div`
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  background-color: var(--color-grey-100);
  padding: 2px 6px;
  border-radius: 99px;
  align-self: flex-start;
  margin-top: auto;
`;

export default function CustomPlanningCell({
  date,
  activeTeams,
  activeUnassignedCount = 0,
  onClick,
  teamColors,
  isSelected,
  mode = 'operational', // Default to operational
  dayKey,
  weekKey
}: CustomPlanningCellProps) {

  const handleInteraction = () => {
    if (mode === 'read-only') return;
    onClick();
  };

  return (
    <CellContainer
      onClick={handleInteraction}
      $isSelected={isSelected} // Use transient prop
      $mode={mode}
      title={`Assignments for ${format(date, 'P', { locale: fr })}`}
      data-day-key={dayKey}
      data-week-key={weekKey}
    >
      {/* Visual Day Label for box-view context */}
      <DayLabel>{format(date, 'EEE dd', { locale: fr })}</DayLabel>

      <DotsContainer>
        {activeTeams.map(team => (
          <Dot
            key={team.id}
            color={teamColors.get(team.id) || '#ccc'}
            title={team.name}
          />
        ))}
      </DotsContainer>

      {activeUnassignedCount > 0 && (
        <UnassignedTag>
          +{activeUnassignedCount} indiv.
        </UnassignedTag>
      )}
    </CellContainer>
  );
}
