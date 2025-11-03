// src/pages/Employees.tsx (or wherever you mount it)
import { useState } from "react";
import Row from "../ui/Row";
import EmployeesHeaderBar, {
  EnrolledFilter,
  RoleFilter,
  SortByOption,
  StatusFilter,
} from "../features/employees/EmployeesHeaderBar";
import EmployeeTable from "../features/employees/EmployeeTable";
import AddEmployee from "../features/employees/AddEmployee";
import Heading from "../ui/Heading";

export default function EmployeesPage(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [enrolled, setEnrolled] = useState<EnrolledFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortByOption>("createdAt-desc");

  return (
    <>
      {/* Page heading */}
      <Row type="horizontal">
        <Heading as="h1">Employees</Heading>

        {/* header bar with Search / Filters / Sort */}
      </Row>

      {/* Controls bar (like Briefs) */}

      {/* Table + Add employee button */}
      <Row>
        {" "}
        <EmployeesHeaderBar
          search={search}
          role={role}
          enrolled={enrolled}
          status={status}
          sortBy={sortBy}
          onChangeSearch={(value) => setSearch(value)}
          onApplyFilters={({ role, enrolled, status }) => {
            setRole(role);
            setEnrolled(enrolled);
            setStatus(status);
          }}
          onChangeSort={(value) => setSortBy(value)}
        />
        <EmployeeTable
          search={search}
          role={role}
          enrolled={enrolled}
          status={status}
          sortBy={sortBy}
        />
        <AddEmployee />
      </Row>
    </>
  );
}
