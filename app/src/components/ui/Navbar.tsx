import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { useAuth } from "../../hooks/useAuth";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./Button";

const Navbar = () => {
  const navigate = useNavigate();
  const router = useRouterState();
  const { isAuthenticated, logout } = useAuth();

  const isActiveLink = (path: string) => router.location.pathname === path;

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
              <span className="text-white dark:text-zinc-900 font-bold text-sm">
                B
              </span>
            </div>
            <span>Boilerplate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
                isActiveLink("/")
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Home
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button onClick={logout} variant="outline" size="sm">
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
