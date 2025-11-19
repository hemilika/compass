import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Posts } from "@/components/home/posts";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Posts />;
};

export default HomePage;
