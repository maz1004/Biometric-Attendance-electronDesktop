import styled from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import DashboardStats from "../features/dashboard/DashboardStats";
import AttendanceChart from "../features/dashboard/AttendanceChart";
import QuickActions from "../features/dashboard/QuickActions";
import AttendanceList from "../features/dashboard/AttendanceList";
import { useTranslation } from "react-i18next";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.4rem;
`;

function Dashboard() {
  const { t } = useTranslation();

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">{t("dashboard.title")}</Heading>
        <p>{t("common.last_update")}{new Date().toLocaleDateString()}</p>
      </Row>

      <QuickActions />

      <DashboardStats />

      <StyledDashboardLayout>
        <AttendanceChart />
        <AttendanceList />
      </StyledDashboardLayout>
    </>
  );
}

export default Dashboard;
