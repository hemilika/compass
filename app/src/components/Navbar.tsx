import { Link, useNavigate } from "@tanstack/react-router";

import { useAuth } from "../hooks/useAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <div className="w-8 h-8 bg-linear-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 rounded-lg flex items-center justify-center">
              <img
                src="/logos/honeycomb-logo.png"
                alt="Honeycomb Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span>Honeycomb</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                variant="outline"
                size="sm"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate({ to: "/login" })}
                variant="ghost"
                size="sm"
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate({ to: "/signup" })}
                variant="default"
                size="sm"
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
