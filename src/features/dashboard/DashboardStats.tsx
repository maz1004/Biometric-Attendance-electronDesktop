import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useDashboard } from "./useDashboard";
import Spinner from "../../ui/Spinner";
import { HiOutlineClock, HiOutlineUserGroup, HiOutlineCheckCircle } from "react-icons/hi";

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
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 1.6rem;
  align-items: center;
`;

const Icon = styled.div<{ color: string; bgcolor: string }>`
  grid-row: 1 / span 2;
  width: 4.8rem;
  height: 4.8rem;
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
  grid-column: 2;
  align-self: end;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-500);
`;

const Value = styled.p`
  grid-column: 2;
  align-self: start;
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 600;
  color: var(--color-grey-700);
`;

function DashboardStats() {
  const { t } = useTranslation();
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
        <Title>{t("dashboard.stats.total_employees")}</Title>
        <Value>{stats.total_team_size}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-green-700)" bgcolor="var(--color-green-100)">
          <HiOutlineCheckCircle />
        </Icon>
        <Title>{t("dashboard.stats.presents_today")}</Title>
        <Value>{stats.arrived_count}</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-blue-700)" bgcolor="var(--color-blue-100)">
          <HiOutlineUserGroup />
        </Icon>
        <Title>{t("dashboard.stats.presence_rate")}</Title>
        <Value>{presenceRate}%</Value>
      </Stat>
      <Stat>
        <Icon color="var(--color-yellow-700)" bgcolor="var(--color-yellow-100)">
          <HiOutlineClock />
        </Icon>
        <Title>{t("dashboard.stats.late_rate")}</Title>
        <Value>{Math.round(stats.late_percentage)}%</Value>
      </Stat>
    </StyledStats>
  );
}

export default DashboardStats;
