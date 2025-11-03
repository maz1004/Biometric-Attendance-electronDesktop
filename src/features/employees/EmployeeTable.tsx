// src/features/employees/EmployeeTable.tsx
import Spinner from "../../ui/Spinner";
import Table from "../../ui/Table";
import Empty from "../../ui/Empty";
import EmployeeRow from "./EmployeeRow";
import { useEmployees } from "./useEmployees";
import { Employee } from "./EmployeeTypes";
import {
  RoleFilter,
  EnrolledFilter,
  StatusFilter,
  SortByOption,
} from "./EmployeesHeaderBar";

export type EmployeeTableProps = {
  search: string;
  role: RoleFilter;
  enrolled: EnrolledFilter;
  status: StatusFilter;
  sortBy: SortByOption;
};

export default function EmployeeTable({
  search,
  role,
  enrolled,
  status,
  sortBy,
}: EmployeeTableProps) {
  const { isLoading, employees } = useEmployees();

  if (isLoading) return <Spinner />;
  if (!employees || employees.length === 0)
    return <Empty resourceName="employees" />;

  // 1. filter
  const filtered: Employee[] = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (role !== "all" && emp.role !== role) return false;

    if (enrolled === "enrolled" && !emp.enrolled) return false;
    if (enrolled === "not" && emp.enrolled) return false;

    if (status !== "all" && emp.status !== status) return false;

    return true;
  });

  // 2. sort
  const [field, direction] = sortBy.split("-") as [
    "createdAt" | "name" | "presenceRate",
    "asc" | "desc"
  ];
  const modifier = direction === "asc" ? 1 : -1;

  const sorted: Employee[] = [...filtered].sort((a, b) => {
    if (field === "name") {
      const an = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bn = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (an < bn) return -1 * modifier;
      if (an > bn) return 1 * modifier;
      return 0;
    }

    if (field === "presenceRate") {
      return (a.stats.presenceRatePct - b.stats.presenceRatePct) * modifier;
    }

    // default createdAt:
    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
      modifier
    );
  });

  // 3. render
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
        data={sorted}
        render={(emp) => <EmployeeRow employee={emp} key={emp.id} />}
      />
    </Table>
  );
}
