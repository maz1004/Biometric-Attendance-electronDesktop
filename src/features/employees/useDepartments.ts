import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../services";
import toast from "react-hot-toast";

export function useDepartments() {
    const {
        isLoading,
        data: departments,
        error,
    } = useQuery({
        queryKey: ["departments"],
        queryFn: getDepartments,
    });

    return { isLoading, departments, error };
}

export function useCreateDepartment() {
    const queryClient = useQueryClient();

    const { mutate: createDepartmentFn, isPending: isCreating } = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            toast.success("Département créé avec succès");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Erreur lors de la création");
        },
    });

    return { createDepartment: createDepartmentFn, isCreating };
}

export function useDeleteDepartment() {
    const queryClient = useQueryClient();

    const { mutate: deleteDepartmentFn, isPending: isDeleting } = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            toast.success("Département supprimé avec succès");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Erreur lors de la suppression");
        },
    });

    return { deleteDepartment: deleteDepartmentFn, isDeleting };
}

export function useUpdateDepartment() {
    const queryClient = useQueryClient();

    const { mutate: updateDepartmentFn, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { name: string; description?: string } }) => updateDepartment(id, data),
        onSuccess: () => {
            toast.success("Département mis à jour avec succès");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Erreur lors de la mise à jour");
        },
    });

    return { updateDepartment: updateDepartmentFn, isUpdating };
}
