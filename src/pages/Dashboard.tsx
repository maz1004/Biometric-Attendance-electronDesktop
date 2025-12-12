import styled from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import DashboardStats from "../features/dashboard/DashboardStats";
import AttendanceChart from "../features/dashboard/AttendanceChart";
import QuickActions from "../features/dashboard/QuickActions";
import AttendanceList from "../features/dashboard/AttendanceList";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.4rem;
`;

function Dashboard() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Dashboard</Heading>
        <p>Dernière mise à jour: {new Date().toLocaleDateString()}</p>
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
