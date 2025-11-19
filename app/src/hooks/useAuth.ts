import { useEffect, useState, useCallback } from "react";
import { getAuthToken, getAuthUser, setAuthToken, setAuthUser } from "@/lib/httpClient";
import type { User } from "@/types/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const userData = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(userData);
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    setAuthUser(userData);
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setAuthUser(null);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return { isAuthenticated, user, isLoading, login, logout };
}
