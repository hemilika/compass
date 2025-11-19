import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from "@/lib/httpClient";
import type { User } from "@/types/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage synchronously using lazy initializers
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!getAuthToken();
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    return getAuthUser();
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync state with localStorage on mount
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
    // Clear all localStorage items
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
      } catch {
        // localStorage not available or quota exceeded
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
