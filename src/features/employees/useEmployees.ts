// src/features/employees/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  createEmployee,
  createAdmin, // Import added
  updateEmployee,
  deleteEmployee,
  uploadUserPhoto,
  uploadUserCV,
  type UpdateUserRequest,
  type CreateEmployeeRequest,
  type CreateAdminRequest, // Import added
  enrollFace,
} from "../../services";
import toast from "react-hot-toast";

import { Employee } from "./EmployeeTypes";

// Filter type for employees query
export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  role?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:image/png;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function useEmployees(filters?: EmployeeFilters) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => getEmployees(filters),
  });

  // Service now returns { users: Employee[], total: number } with mapped data
  const employees: Employee[] = data?.users || [];

  return {
    isLoading,
    employees,
    count: data?.total || 0,
    error
  };
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  const { mutate: createEmployeeFn, isPending: isCreating } = useMutation({
    mutationFn: async (data: any) => {
      // 1. Determine if it's an Admin/Manager creation or Employee
      // Extract file lists
      const { avatarFile, cvFile, ...employeeReq } = data;

      let newUser;

      if (employeeReq.role === "manager" || employeeReq.role === "admin" || employeeReq.role === "rh") {
        // Map to CreateAdminRequest
        const adminReq: CreateAdminRequest = {
          ...employeeReq,
          role: "admin", // Force admin for now, or use mapped role
          // Ensure password is passed if form provides it
        };
        newUser = await createAdmin(adminReq);
      } else {
        newUser = await createEmployee(employeeReq as CreateEmployeeRequest);
      }

      console.log("Create Employee Result:", newUser);

      // 2. Upload Photo if exists
      if (avatarFile && avatarFile.length > 0) {
        if (!newUser?.id) {
          console.error("Created user has no ID, skipping photo upload", newUser);
          throw new Error("Created user has no ID");
        }
        const file = avatarFile[0];
        const base64 = await fileToBase64(file);
        await uploadUserPhoto(newUser.id, base64, file.name);
      }

      // 3. Upload CV if exists
      if (cvFile && cvFile.length > 0) {
        if (!newUser?.id) {
          console.error("Created user has no ID, skipping CV upload", newUser);
        } else {
          const file = cvFile[0];
          const base64 = await fileToBase64(file);
          await uploadUserCV(newUser.id, base64, file.name);
        }
      }

      return newUser;
    },
    onSuccess: () => {
      toast.success("Employé créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la création");
    },
  });

  return { createEmployee: createEmployeeFn, isCreating };
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  const { mutate: updateEmployeeFn, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      toast.success("Employé mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la mise à jour");
    },
  });

  return { updateEmployee: updateEmployeeFn, isUpdating };
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  const { mutate: deleteEmployeeFn, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employé supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la suppression");
    },
  });

  return { deleteEmployee: deleteEmployeeFn, isDeleting };
}

export function useEnrollFace() {
  const queryClient = useQueryClient();

  const { mutate: enrollFaceFn, isPending: isEnrolling } = useMutation({
    mutationFn: ({ id, template }: { id: string; template: string }) =>
      enrollFace(id, template),
    onSuccess: () => {
      toast.success("Enrôlement réussi");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'enrôlement");
    },
  });

  return { enrollFace: enrollFaceFn, isEnrolling };
}
