import { UserResponse } from "../../../../services/types/api-types";

// Define the view-agnostic model for Employee export
export interface EmployeeExportModel {
    id: string;
    fullName: string;
    department: string;
    role: string;
    employeeId: string; // Matricule
    email?: string;
    joinDate?: string;
}

/**
 * Adapts a generic User object to the EmployeeExportModel.
 * Ensures that the PDF generator only receives data it needs, formatted correctly.
 */
export const adaptUserToEmployeeExport = (user: UserResponse): EmployeeExportModel => {
    return {
        id: user.id,
        fullName: `${user.first_name} ${user.last_name}`,
        department: user.department || "N/A",
        role: user.role,
        employeeId: (user as any).employee_id || "-", // Cast if employee_id missing from UserResponse
        email: user.email,
        // formatted join date if available
        joinDate: user.hire_date ? new Date(user.hire_date).toLocaleDateString() : "-",
    };
};
