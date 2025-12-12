import styled from "styled-components";
import { EmployeeMini, Team } from "./PlanningTypes";
import TeamCard from "./TeamCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1rem;
  background: var(--color-bg-elevated);
  border-left: 1px solid var(--color-border-card);
  min-width: 250px;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 0.8rem;
`;

export default function TeamList({
    teams,
    employees,
}: {
    teams: Record<string, Team>;
    employees: Record<string, EmployeeMini>;
}) {
    return (
        <Container>
            <Title>Teams</Title>
            {Object.values(teams).map((team) => (
                <TeamCard key={team.id} team={team} employees={employees} />
            ))}
        </Container>
    );
}
