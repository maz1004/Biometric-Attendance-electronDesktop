import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, type LoginRequest } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate: login, isPending: isLoading } = useMutation({
        mutationFn: (credentials: LoginRequest) => loginApi(credentials),
        onSuccess: (response) => {
            // Backend returns LoginResponse with { success, message, data: { token, user } }
            if (response.success && response.data) {
                queryClient.setQueryData(["user"], response.data.user);
                navigate("/dashboard", { replace: true });
                toast.success("Login successful");
            }
        },
        onError: (err: any) => {
            console.log("ERROR", err);
            toast.error(err?.response?.data?.message || "Provided email or password are incorrect");
        },
    });

    return { login, isLoading };
}
