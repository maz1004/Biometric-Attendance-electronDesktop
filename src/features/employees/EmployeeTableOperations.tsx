// src/features/employees/EmployeeTableOperations.tsx
import TableOperations from "../../ui/TableOperations";
import Filter from "../../ui/Filter";
import SortBy from "../../ui/SortBy";

function EmployeeTableOperations(): JSX.Element {
  return (
    <TableOperations>
      <Filter
        filterField="role"
        options={[
          { value: "all", label: "All roles" },
          { value: "employee", label: "Employees" },
          { value: "manager", label: "Managers" },
        ]}
      />

      <Filter
        filterField="enrolled"
        options={[
          { value: "all", label: "All enroll" },
          { value: "enrolled", label: "Enrolled" },
          { value: "not", label: "Not enrolled" },
        ]}
      />

      <Filter
        filterField="status"
        options={[
          { value: "all", label: "All status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
      />

      <SortBy
        options={[
          { value: "createdAt-desc", label: "Newest first" },
          { value: "createdAt-asc", label: "Oldest first" },
          { value: "name-asc", label: "Name (A-Z)" },
          { value: "name-desc", label: "Name (Z-A)" },
          {
            value: "presenceRate-desc",
            label: "Best attendance first",
          },
          {
            value: "presenceRate-asc",
            label: "Worst attendance first",
          },
        ]}
      />
    </TableOperations>
  );
}

export default EmployeeTableOperations;
