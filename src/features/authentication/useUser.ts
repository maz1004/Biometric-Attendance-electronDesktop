import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/auth";

// Backend doesn't have a getCurrentUser endpoint
// We get the user from login response and store it in localStorage
export function useUser() {
  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // 1. Check if token exists
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        // 2. Validate token with backend
        const response = await getCurrentUser();
        // 3. If valid, return user
        if (response.success && response.data) {
          // Update stored user just in case
          localStorage.setItem("user", JSON.stringify(response.data));
          return response.data;
        }
        return null; // Should be handled by catch but just in case
      } catch (error) {
        // 4. If invalid (401), clear storage
        console.error("Session validation failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
    },
    // Retry once in case of network blip, but generally fail fast on 401
    retry: 1,
    // Stale time: 5 minutes (validate occasionally but not every render)
    staleTime: 5 * 60 * 1000,
  });

  return {
    isLoading,
    user,
    isAuthenticated: !!user
  };
}
