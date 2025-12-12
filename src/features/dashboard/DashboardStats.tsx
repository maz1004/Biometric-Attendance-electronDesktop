import styled from "styled-components";
import { HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../../services";
import Spinner from "../../ui/Spinner";

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
  background-color: ${(props) => props.bgcolor};

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: ${(props) => props.color};
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
  // Fetch employees to get total count
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
  });

  if (isLoading) return <Spinner />;

  const totalEmployees = employeesData?.total || 0;
  const activeEmployees = employeesData?.users?.filter(u => u.is_active).length || 0;

  // TODO: Fetch real attendance stats from API
  // For now using mock data
  const stats = {
    totalEmployees,
    activeEmployees,
    presenceRate: 92,
    latenessRate: 3,
  };

  return (
    <StyledStats>
      <Stat>
        <Icon color="var(--color-brand-700)" bgcolor="var(--color-brand-100)">
          <HiOutlineUserGroup />
        </Icon>
        <Title>Total Employés</Title>
        <Value>{stats.totalEmployees}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-green-700)" bgcolor="var(--color-green-100)">
          <HiOutlineCheckCircle />
        </Icon>
        <Title>Employés Actifs</Title>
        <Value>{stats.activeEmployees}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-blue-700)" bgcolor="var(--color-blue-100)">
          <HiOutlineUserGroup />
        </Icon>
        <Title>Taux de Présence</Title>
        <Value>{stats.presenceRate}%</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-yellow-700)" bgcolor="var(--color-yellow-100)">
          <HiOutlineClock />
        </Icon>
        <Title>Taux de Retard</Title>
        <Value>{stats.latenessRate}%</Value>
      </Stat>
    </StyledStats>
  );
}

export default DashboardStats;
