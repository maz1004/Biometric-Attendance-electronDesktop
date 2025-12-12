import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: logout, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            // Clear token from localStorage
            localStorage.removeItem('token');
            return Promise.resolve();
        },
        onSuccess: () => {
            // Clear all queries
            queryClient.clear();
            // Navigate to login
            navigate("/login", { replace: true });
            toast.success("Logged out successfully");
        },
    });

    return { logout, isLoading };
}
