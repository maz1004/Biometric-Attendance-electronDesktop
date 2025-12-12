import { useQuery } from "@tanstack/react-query";
import { UserResponse } from "../../services/types/api-types";

// Backend doesn't have a getCurrentUser endpoint
// We get the user from login response and store it in localStorage
export function useUser() {
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return Promise.resolve(JSON.parse(storedUser) as UserResponse);
        } catch (e) {
          return Promise.resolve(null);
        }
      }
      return Promise.resolve(null);
    },
    // Stale time infinity because user data rarely changes unless updated explicitly
    staleTime: Infinity,
  });

  return {
    isLoading,
    user,
    isAuthenticated: !!user
  };
}
