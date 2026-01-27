// src/features/employees/EmployeeTable.tsx
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import EmployeeRow from "./EmployeeRow";
import { useEmployees } from "./useEmployees";
import { Employee } from "./EmployeeTypes";


export type EmployeeTableProps = {
  search: string;
  role: string;
  enrolled: string;
  status: string;
  sortBy: string;
};



export default function EmployeeTable({
  search,
  status,
  role,
}: EmployeeTableProps) {
  // Map status filter: 'all' is not supported by backend, so pass undefined
  const apiStatus = status === "all" ? undefined : status;
  const apiRole = role === "all" ? undefined : role;

  const { isLoading, employees: backendEmployees } = useEmployees({
    search,
    status: apiStatus as 'active' | 'inactive' | undefined,
    role: apiRole,
  });

  if (isLoading) return <Spinner />;

  // Data is already mapped in useEmployees hook
  const employees = backendEmployees;

  if (!employees || employees.length === 0)
    return <Empty resourceName="employees" />;

  return (
    <Menus>
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
    </Menus>
  );
}
