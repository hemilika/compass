import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, User, LogOut } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { data: profile } = useUserProfile(isAuthenticated);
  const [searchOpen, setSearchOpen] = useState(false);

  const displayUser = profile || user;
  const userInitials =
    displayUser?.firstname && displayUser?.lastname
      ? `${displayUser.firstname[0]}${displayUser.lastname[0]}`.toUpperCase()
      : displayUser?.email?.[0].toUpperCase() || "U";

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
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <img
                  src="/logos/honeycomb-transparent-only-logo.png"
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

            {isAuthenticated && displayUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="NO-LOGO" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/settings" })}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/login" });
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
        <DialogContent className="max-w-2xl p-0 left-[50%] top-12 -translate-x-1/2 translate-y-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Search onClose={() => setSearchOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
