import styled from "styled-components";
import { EmployeeMini, Team } from "./PlanningTypes";
import TeamCard from "./TeamCard";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.2rem;
  padding: 0;
  background: transparent;
  border: none;
  width: 100%;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 0.8rem;
  grid-column: 1 / -1;
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
            <Title>Équipes</Title>
            {Object.values(teams).map((team) => (
                <TeamCard key={team.id} team={team} employees={employees} />
            ))}
        </Container>
    );
}
