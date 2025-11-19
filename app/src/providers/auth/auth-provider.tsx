import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from "@/lib/httpClient";
import type { User } from "@/types/api";
import { AuthContext } from "./auth-context";
import { queryKeys } from "@/hooks/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    const userData = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(userData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (e.g., when token is cleared on 401 or cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") {
        checkAuth();
      }
    };

    // Check auth when window regains focus (handles same-tab auth clearing)
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAuth]);

  const login = useCallback(
    (token: string, userData: User) => {
      setAuthToken(token);
      setAuthUser(userData);
      // React Context will automatically trigger re-renders in all consuming components
      setIsAuthenticated(true);
      setUser(userData);
      // Invalidate user profile query to fetch fresh data for the new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setAuthUser(null);
    // React Context will automatically trigger re-renders in all consuming components
    setIsAuthenticated(false);
    setUser(null);
    // Clear all queries to remove cached data from previous user
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
