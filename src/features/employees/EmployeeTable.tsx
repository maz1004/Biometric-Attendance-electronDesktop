// src/features/employees/EmployeeTable.tsx
import Spinner from "../../ui/Spinner";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          <div>{t("employees.table.pic")}</div>
          <div>{t("employees.table.employee")}</div>
          <div>{t("employees.table.dept_role")}</div>
          <div>{t("employees.table.enroll")}</div>
          <div>{t("employees.table.status")}</div>
          <div>{t("employees.table.stats")}</div>
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
