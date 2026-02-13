// src/features/employees/EmployeeTypes.ts

export type EmployeeRole = "employee" | "manager" | "admin" | "rh";
export type EmployeeStatus = "active" | "inactive";

export type EmployeeStats = {
  presenceRatePct: number; // %
  lateCount30d: number; // number of late arrivals in last 30 days
  absenceCount30d: number; // number of absences in last 30 days
  efficiencyScore: number; // 0-100
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
  avatar?: string; // URL
  cv?: string; // URL
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  stats?: EmployeeStats;
};

// form input structure for create / edit
export type EmployeeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  avatar: FileList | string; // react-hook-form will give FileList
  cv: FileList | string;
  password?: string;
  dateOfBirth?: string;
};

// prop when editing (optional employee + optional close callback)
export type CreateEmployeeFormProps = {
  employeeToEdit?: Partial<Employee> & { id?: string };
  onCloseModal?: () => void;
};
