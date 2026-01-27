// src/pages/Employees.tsx
import { useState } from "react";
import Row from "../ui/Row";
import EmployeesHeaderBar, {
  EnrolledFilter,
  RoleFilter,
  SortByOption,
  StatusFilter,
} from "../features/employees/EmployeesHeaderBar";
import EmployeeTable from "../features/employees/EmployeeTable";
import CreateEmployeeForm from "../features/employees/CreateEmployeeForm";
import Heading from "../ui/Heading";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { HiPlus } from "react-icons/hi2";

export default function EmployeesPage(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [enrolled, setEnrolled] = useState<EnrolledFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortByOption>("createdAt-desc");

  return (
    <Modal>
      {/* Page heading */}
      <Row type="horizontal">
        <Heading as="h1">Employees</Heading>
        <Modal.Open opens="new-employee">
          <Button size="medium">
            <HiPlus />
            <span>Add Employee</span>
          </Button>
        </Modal.Open>
      </Row>

      <Row>
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

        <Modal.Window name="new-employee">
          <CreateEmployeeForm />
        </Modal.Window>
      </Row>
    </Modal>
  );
}
