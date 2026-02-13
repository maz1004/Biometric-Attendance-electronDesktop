import styled, { keyframes } from "styled-components";
import { Team, EmployeeMini } from "../../types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PopoverContainer = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: ${p => p.y + 10}px;
  left: ${p => p.x}px;
  transform: translateX(-50%);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  color: var(--color-grey-700);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1100;
  width: 250px;
  padding: 12px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeIn} 0.1s ease-out;
`;

const Header = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 6px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MemberList = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MemberItem = styled.div`
  font-size: 0.9rem;
  padding: 4px 6px;
  border-radius: 4px;
  color: var(--color-text-main);
  &:hover {
    background: var(--color-bg-subtle);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1099;
  background: transparent;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 10px; height: 10px; border-radius: 50%;
  background: ${p => p.$color};
`;

interface TeamMemberPopoverProps {
    team: Team;
    employees: Record<string, EmployeeMini>;
    x: number;
    y: number;
    onClose: () => void;
}

export default function TeamMemberPopover({ team, employees, x, y, onClose }: TeamMemberPopoverProps) {
    const members = (team.memberIds || [])
        .map(id => employees[id])
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <Overlay onClick={onClose} />
            <PopoverContainer x={x} y={y}>
                <Header>
                    <ColorDot $color={team.color || '#ccc'} />
                    <span>{team.name} ({members.length})</span>
                </Header>
                <MemberList>
                    {members.length > 0 ? (
                        members.map(m => (
                            <MemberItem key={m.id}>
                                {m.name}
                            </MemberItem>
                        ))
                    ) : (
                        <div style={{ padding: 8, fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Aucun membre
                        </div>
                    )}
                </MemberList>
            </PopoverContainer>
        </>
    );
}
