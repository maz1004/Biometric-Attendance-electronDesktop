import { useMutation } from "@tanstack/react-query";
import { register as signupApi, type RegisterRequest } from "../../services/auth";
import toast from "react-hot-toast";

export function useSignup() {
    const { mutate: signup, isPending: isLoading } = useMutation({
        mutationFn: (credentials: RegisterRequest) => signupApi(credentials),
        onSuccess: () => {
            toast.success(
                "Account successfully created! Please verify the new account from the user's email address."
            );
        },
        onError: (err: any) => {
            console.log("ERROR", err);
            toast.error(err?.response?.data?.message || "Could not create user, please try again");
        },
    });

    return { signup, isLoading };
}
