import styled from "styled-components";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EmployeeMini, Team } from "./PlanningTypes";
import { useState } from "react";
import { HiUserGroup } from "react-icons/hi2";

const Card = styled.div`
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  transition: all 0.2s;
  position: relative;
  cursor: pointer;
  height: 100%;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--color-brand-200);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  color: var(--color-text-strong);
`;

const MemberList = styled.div<{ $visible: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.4rem;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  max-height: ${(p) => (p.$visible ? "200px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const MemberChip = styled.div`
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--color-brand-200);

  &:active {
    cursor: grabbing;
  }
`;

function DraggableMember({ id, name }: { id: string; name: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `member-${id}`,
        data: { type: "member", id, name },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <MemberChip ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {name}
        </MemberChip>
    );
}

export default function TeamCard({
    team,
    employees,
}: {
    team: Team;
    employees: Record<string, EmployeeMini>;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Header>
                <HiUserGroup />
                {team.name}
                <span style={{ fontSize: "1.1rem", color: "var(--color-text-dim)", fontWeight: 400 }}>
                    ({team.memberIds.length})
                </span>
            </Header>

            <MemberList $visible={isHovered}>
                {(team.memberIds || []).map((memberId) => (
                    <DraggableMember
                        key={memberId}
                        id={memberId}
                        name={employees[memberId]?.name || "Unknown"}
                    />
                ))}
            </MemberList>
        </Card>
    );
}
