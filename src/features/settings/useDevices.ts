import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDevices, deleteDevice } from "../../services/devices";
import toast from "react-hot-toast";

export function useDevices() {
    const queryClient = useQueryClient();

    const { isLoading, data, error } = useQuery({
        queryKey: ["devices"],
        queryFn: getDevices,
    });

    const { mutate: removeDevice, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => deleteDevice(id),
        onSuccess: () => {
            toast.success("Device removed successfully");
            queryClient.invalidateQueries({ queryKey: ["devices"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to remove device");
        },
    });

    const { mutate: resyncDevice, isPending: isResyncing } = useMutation({
        mutationFn: async (id: string) => {
            // Simulate resync - in real app would call backend endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            return id;
        },
        onSuccess: () => {
            toast.success("Device resynced successfully");
            queryClient.invalidateQueries({ queryKey: ["devices"] });
        },
        onError: () => {
            toast.error("Failed to resync device");
        },
    });

    return {
        isLoading,
        devices: data?.devices || [],
        total: data?.total || 0,
        error,
        removeDevice,
        isDeleting,
        resyncDevice,
        isResyncing,
    };
}
