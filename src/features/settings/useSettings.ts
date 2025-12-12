import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../../services/settings";
import toast from "react-hot-toast";

export function useSettings() {
    const queryClient = useQueryClient();

    const { isLoading, data: settings, error } = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    const { mutate: update, isPending: isUpdating } = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            toast.success("Settings updated successfully");
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (err: any) => {
            toast.error("Failed to update settings");
            console.error(err);
        },
    });

    return {
        isLoading,
        settings, // Backend returns CompanySettings directly, no .data nesting
        error,
        update,
        isUpdating,
    };
}
