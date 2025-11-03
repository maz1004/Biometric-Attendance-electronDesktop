// src/features/employees/useEmployees.ts
import { useState } from "react";
import { Employee } from "./EmployeeTypes";

export function useEmployees() {
  // fake loading state
  const [isLoading] = useState<boolean>(false);

  // mock data
  const [employees] = useState<Employee[]>([
    {
      id: "EMP-001",
      firstName: "Ahmed",
      lastName: "B.",
      department: "Production",
      role: "employee",
      enrolled: true,
      status: "active",
      createdAt: "2025-09-12T09:21:00Z",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Ahmed",
      stats: {
        presenceRatePct: 96,
        lateCount30d: 1,
        absenceCount30d: 0,
      },
    },
    {
      id: "EMP-002",
      firstName: "Sofia",
      lastName: "K.",
      department: "QA",
      role: "manager",
      enrolled: true,
      status: "active",
      createdAt: "2025-09-18T10:05:00Z",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Sofia",
      stats: {
        presenceRatePct: 91,
        lateCount30d: 3,
        absenceCount30d: 1,
      },
    },
    {
      id: "EMP-003",
      firstName: "Yacine",
      lastName: "R.",
      department: "Maintenance",
      role: "employee",
      enrolled: false,
      status: "active",
      createdAt: "2025-10-01T07:44:00Z",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Yacine",
      stats: {
        presenceRatePct: 0,
        lateCount30d: 0,
        absenceCount30d: 0,
      },
    },
    {
      id: "EMP-004",
      firstName: "Lina",
      lastName: "M.",
      department: "HR",
      role: "manager",
      enrolled: true,
      status: "inactive",
      createdAt: "2025-07-22T14:12:00Z",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Lina",
      stats: {
        presenceRatePct: 88,
        lateCount30d: 4,
        absenceCount30d: 2,
      },
    },
  ]);

  return { isLoading, employees };
}
