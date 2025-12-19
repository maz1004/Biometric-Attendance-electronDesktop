import { useUser } from "./useUser";

export function useAuth() {
    const { isLoading, user, isAuthenticated } = useUser();
    const token = localStorage.getItem("token");

    return {
        isLoading,
        user,
        isAuthenticated,
        token,
    };
}
