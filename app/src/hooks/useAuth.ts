import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("mock-auth");
      setIsAuthenticated(v === "true");
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const login = () => {
    try {
      localStorage.setItem("mock-auth", "true");
      setIsAuthenticated(true);
    } catch {}
  };

  const logout = () => {
    try {
      localStorage.setItem("mock-auth", "false");
      setIsAuthenticated(false);
    } catch {}
  };

  return { isAuthenticated, login, logout };
}
