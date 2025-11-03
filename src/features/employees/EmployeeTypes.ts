// src/features/employees/EmployeeTypes.ts

export type EmployeeRole = "employee" | "manager";
export type EmployeeStatus = "active" | "inactive";

export type EmployeeStats = {
  presenceRatePct: number; // %
  lateCount30d: number; // number of late arrivals in last 30 days
  absenceCount30d: number; // number of absences in last 30 days
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  role: EmployeeRole;
  enrolled: boolean;
  status: EmployeeStatus;
  createdAt: string; // ISO string
  avatar: string; // URL
  stats: EmployeeStats;
};

// form input structure for create / edit
export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  avatar: FileList | string; // react-hook-form will give FileList
};

// prop when editing (optional employee + optional close callback)
export type CreateEmployeeFormProps = {
  employeeToEdit?: Partial<Employee> & { id?: string };
  onCloseModal?: () => void;
};
