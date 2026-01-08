// src/features/employees/EmployeeTable.tsx
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import Empty from "../../ui/Empty";
import EmployeeRow from "./EmployeeRow";
import { useEmployees } from "./useEmployees";
import { Employee } from "./EmployeeTypes";
import type { UserResponse } from "../../services";

export type EmployeeTableProps = {
  search: string;
  role: string;
  enrolled: string;
  status: string;
  sortBy: string;
};

// Helper to map backend UserResponse to UI Employee type
function mapUserToEmployee(user: UserResponse): Employee {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    department: "N/A", // Backend UserResponse doesn't have department field
    role: "employee", // Backend doesn't have manager role
    enrolled: false, // Backend doesn't have biometric_enrolled field yet
    status: user.is_active ? "active" : "inactive",
    createdAt: user.created_at,
    avatar: undefined, // Backend doesn't have avatar_url field yet
    stats: {
      presenceRatePct: 0, // Backend doesn't have punctuality_score in UserResponse
      lateCount30d: 0,
      absenceCount30d: 0,
      efficiencyScore: 0,
    },
  };
}

export default function EmployeeTable({
  search,
  status,
}: EmployeeTableProps) {
  // Map status filter: 'all' is not supported by backend, so pass undefined
  const apiStatus = status === "all" ? undefined : status;

  const { isLoading, employees: backendEmployees } = useEmployees({
    search,
    status: apiStatus as 'active' | 'inactive' | undefined,
  });

  if (isLoading) return <Spinner />;

  // Map backend users to UI employees
  const employees = backendEmployees.map(mapUserToEmployee);

  if (!employees || employees.length === 0)
    return <Empty resourceName="employees" />;

  return (
    <Table columns="0.8fr 1.6fr 1fr 1fr 1fr 1fr 1fr">
      <Table.Header>
        <div>PIC</div>
        <div>EMPLOYEE</div>
        <div>DEPT / ROLE</div>
        <div>ENROLL</div>
        <div>STATUS</div>
        <div>STATS (30D)</div>
        <div></div>
      </Table.Header>

      <Table.Body<Employee>
        data={employees}
        render={(emp) => <EmployeeRow employee={emp} key={emp.id} />}
      />
    </Table>
  );
}
