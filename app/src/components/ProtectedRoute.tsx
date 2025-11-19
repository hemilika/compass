import { useEffect } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

export default ProtectedRoute;
