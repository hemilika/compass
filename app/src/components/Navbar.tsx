import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";

import { useAuth } from "../hooks/use-auth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/Search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
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
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="gap-2"
              >
                <SearchIcon className="h-4 w-4" />
                Search
              </Button>
            )}
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

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Search onClose={() => setSearchOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
