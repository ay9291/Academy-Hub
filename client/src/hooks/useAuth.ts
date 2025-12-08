import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {
    } finally {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/login";
    }
  };

  const refreshToken = async () => {
    try {
      await apiRequest("POST", "/api/auth/refresh");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      return true;
    } catch {
      return false;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshToken,
  };
}
