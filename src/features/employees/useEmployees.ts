// src/features/employees/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type CreateEmployeeRequest,
  type UpdateUserRequest,
} from "../../services";
import toast from "react-hot-toast";

// Filter type for employees query
export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}

export function useEmployees(filters?: EmployeeFilters) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => getEmployees(filters),
  });

  // Backend returns GetUsersResponse directly: { users: UserResponse[], total: number, page: number, limit: number }
  return {
    isLoading,
    employees: data?.users || [],
    count: data?.total || 0,
    error
  };
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  const { mutate: createEmployeeFn, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
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
