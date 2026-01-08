import styled from "styled-components";
import { HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi";
import Spinner from "../../ui/Spinner";
import { useDashboard } from "./useDashboard";

const StyledStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;
  margin-bottom: 3.2rem;
`;

const Stat = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem;
  display: grid;
  grid-template-columns: 6.4rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 1.6rem;
  row-gap: 0.4rem;
`;

const Icon = styled.div<{ color: string; bgcolor: string }>`
  grid-row: 1 / -1;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props: { bgcolor: string }) => props.bgcolor};

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: ${(props: { color: string }) => props.color};
  }
`;

const Title = styled.h5`
  align-self: end;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-500);
`;

const Value = styled.p`
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 500;
`;

function DashboardStats() {
  const { stats, isLoading } = useDashboard();

  if (isLoading) return <Spinner />;

  // stats is enhanced with real counts from useDashboard hook
  if (!stats) return null;

  const presenceRate = stats.total_team_size > 0
    ? Math.round((stats.arrived_count / stats.total_team_size) * 100)
    : 0;

  // use ArrivedCount as "Employés Présents" or similar. 
  // The UI label is "Employés Actifs".

  return (
    <StyledStats>
      <Stat>
        <Icon color="var(--color-brand-700)" bgcolor="var(--color-brand-100)">
          <HiOutlineUserGroup />
        </Icon>
        <Title>Total Employés</Title>
        <Value>{stats.total_team_size}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-green-700)" bgcolor="var(--color-green-100)">
          <HiOutlineCheckCircle />
        </Icon>
        <Title>Présents Aujourd'hui</Title>
        <Value>{stats.arrived_count}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-blue-700)" bgcolor="var(--color-blue-100)">
          <HiOutlineUserGroup />
        </Icon>
        <Title>Taux de Présence</Title>
        <Value>{presenceRate}%</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-yellow-700)" bgcolor="var(--color-yellow-100)">
          <HiOutlineClock />
        </Icon>
        <Title>Taux de Retard</Title>
        <Value>{Math.round(stats.late_percentage)}%</Value>
      </Stat>
    </StyledStats>
  );
}

export default DashboardStats;
