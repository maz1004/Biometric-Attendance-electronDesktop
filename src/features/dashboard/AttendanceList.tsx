import styled from "styled-components";
import { useAttendance } from "../attendance/useAttendance";
import Spinner from "../../ui/Spinner";
import Tag from "../../ui/Tag";
import { AttendanceRecord } from "../attendance/AttendanceTypes";

const StyledAttendanceList = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const ListItem = styled.li`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  align-items: center;
  gap: 1.6rem;
  padding: 1.2rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-100);
`;

const Name = styled.div`
  font-weight: 500;
  color: var(--color-grey-600);
`;

const Time = styled.div`
  font-family: "Sono";
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const Department = styled.div`
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;

function AttendanceList() {
  const { list, isLoading } = useAttendance();

  if (isLoading) return <Spinner />;

  // Take only the last 5 records
  const recentAttendance = list?.slice(0, 5) || [];

  if (!recentAttendance.length) return <StyledAttendanceList><Title>Recent Activity</Title><p>No recent activity.</p></StyledAttendanceList>;

  return (
    <StyledAttendanceList>
      <Title>🕒 Activité Récente</Title>
      <List>
        {recentAttendance.map((record: AttendanceRecord) => (
          <ListItem key={record.id}>
            <Name>{record.fullName}</Name>
            <Department>{record.department || "N/A"}</Department>
            <Time>
              {record.checkIn || "-"}
              {" → "}
              {record.checkOut || "..."}
            </Time>
            <Tag type={
              record.status === "present" ? "green" :
                record.status === "late" ? "yellow" :
                  record.status === "absent" ? "red" : "blue"
            }>
              {record.status.replace("_", " ")}
            </Tag>
          </ListItem>
        ))}
      </List>
    </StyledAttendanceList>
  );
}

export default AttendanceList;
