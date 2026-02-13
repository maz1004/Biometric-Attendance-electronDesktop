
import styled from "styled-components";
import { Team } from "../../types";
import { HiCheck } from "react-icons/hi2";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-grey-0);
  border-bottom: 1px solid var(--color-border-element);
  overflow-x: auto;
  flex-shrink: 0;

  /* Hide scrollbar but allow scrolling */
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-grey-300); border-radius: 2px; }
`;

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  white-space: nowrap;
`;

const ChipsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const FilterChip = styled.button<{ $selected: boolean; $color: string }>`
  background: ${props => props.$selected ? props.$color : "transparent"};
  border: 1px solid ${props => props.$selected ? props.$color : "var(--color-border-element)"};
  color: ${props => props.$selected ? "#ffffff" : "var(--color-text-primary)"};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$selected ? props.$color : "var(--color-bg-hover)"};
    border-color: ${props => props.$color};
  }

  opacity: ${props => props.$selected ? 1 : 0.7};
`;

const ColorDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$color};
`;

interface TeamLegendFilterProps {
    teams: Team[];
    selectedTeamIds: string[];
    onToggleTeam: (teamId: string) => void;
    onSelectAll?: () => void;
}

export default function TeamLegendFilter({ teams, selectedTeamIds, onToggleTeam, onSelectAll }: TeamLegendFilterProps) {

    const allSelected = teams.length > 0 && selectedTeamIds.length === teams.length;

    return (
        <Container>
            <Label>Filtres Équipes:</Label>

            <ChipsContainer>
                {/* Optional "All" Button */}
                {onSelectAll && (
                    <FilterChip
                        $selected={allSelected}
                        $color="var(--color-primary)"
                        onClick={onSelectAll}
                    >
                        {allSelected && <HiCheck size={14} />}
                        Tous
                    </FilterChip>
                )}

                {teams.map(team => {
                    const isSelected = selectedTeamIds.includes(team.id);
                    return (
                        <FilterChip
                            key={team.id}
                            $selected={isSelected}
                            $color={team.color || "#ccc"}
                            onClick={() => onToggleTeam(team.id)}
                        >
                            {!isSelected && <ColorDot $color={team.color || "#ccc"} />}
                            {isSelected && <HiCheck size={14} />}
                            {team.name}
                        </FilterChip>
                    )
                })}
            </ChipsContainer>
        </Container>
    );
}
