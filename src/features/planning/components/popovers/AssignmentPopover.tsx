import styled, { keyframes } from "styled-components";
import { Team, EmployeeMini } from "../../types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  z-index: 1000;
  width: 220px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${fadeIn} 0.15s ease-out;
`;

const Header = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 0.4rem;
  margin-bottom: 0.2rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  max-height: 200px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--color-border-element); border-radius: 4px; }
`;

const Item = styled.button<{ color: string; isSelected: boolean }>`
  background: ${p => p.isSelected ? 'var(--color-bg-subtle)' : 'transparent'};
  border: 1px solid ${p => p.isSelected ? p.color : 'transparent'};
  padding: 0.4rem 0.6rem;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.1s;
  text-align: left;
  color: var(--color-text-main);

  &:hover {
    background: var(--color-bg-hover);
  }

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.color};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: transparent;
  z-index: 999;
`;

interface AssignmentPopoverProps {
    x: number;
    y: number;
    teams: Team[];
    employees?: EmployeeMini[]; // Optional if we only assign teams in template for now, but user mentioned employees too
    assignedIds: string[]; // IDs of currently assigned teams/employees in this slot
    onToggle: (id: string, type: 'team' | 'employee') => void;
    onClose: () => void;
}

export default function AssignmentPopover({
    x,
    y,
    teams,
    employees = [],
    assignedIds,
    onToggle,
    onClose
}: AssignmentPopoverProps) {

    // Adjust position to not go off-screen (basic logic)
    const adjustedX = Math.min(x, window.innerWidth - 230);
    const adjustedY = Math.min(y, window.innerHeight - 310);

    return (
        <>
            <Overlay onClick={onClose} />
            <PopoverContainer x={adjustedX} y={adjustedY} onClick={e => e.stopPropagation()}>
                <Header>Assigner Équipe</Header>
                <List>
                    {teams.map(t => {
                        const isSelected = assignedIds.includes(t.id);
                        return (
                            <Item
                                key={t.id}
                                color={t.color || "#3b82f6"}
                                isSelected={isSelected}
                                onClick={() => onToggle(t.id, 'team')}
                            >
                                <span>{t.name}</span>
                            </Item>
                        );
                    })}
                </List>

                {employees.length > 0 && (
                    <>
                        <Header style={{ marginTop: '0.5rem' }}>Individuel</Header>
                        <List>
                            {employees.map(e => {
                                const isSelected = assignedIds.includes(e.id);
                                return (
                                    <Item
                                        key={e.id}
                                        color={"#10b981"} // Generic green for employees
                                        isSelected={isSelected}
                                        onClick={() => onToggle(e.id, 'employee')}
                                    >
                                        <span>{e.name}</span>
                                    </Item>
                                );
                            })}
                        </List>
                    </>
                )}
            </PopoverContainer>
        </>
    );
}
