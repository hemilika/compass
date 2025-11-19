import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
};

export default ProtectedRoute;
