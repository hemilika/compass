import { useState } from "react";
import { Home, TrendingUp, Users, Plus, Sparkles, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useThreads } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateThreadDialog } from "./CreateThreadDialog";

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Popular", path: "/popular" },
  { icon: Sparkles, label: "All", path: "/all" },
];

export const LeftSidebar = () => {
  const { isAuthenticated } = useAuth();
  const { data: threads, isLoading } = useThreads();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-4">
      <div className="space-y-4">
        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Threads Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Threads
            </h3>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : Array.isArray(threads) && threads.length > 0 ? (
              threads.slice(0, 10).map((thread) => {
                const initial = thread.name.charAt(0).toUpperCase();
                const memberCount = thread.threadUsers?.length || 0;
                return (
                  <Link
                    key={thread.id}
                    to={`/threads/${thread.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {initial}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">
                        {thread.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {memberCount}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No threads yet
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Create Post Button */}
        {isAuthenticated && (
          <Button
            className="w-full"
            size="sm"
            onClick={() => setCreatePostOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        )}

        {/* Create Thread Button */}
        {isAuthenticated && (
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => setCreateThreadOpen(true)}
          >
            <Users className="mr-2 h-4 w-4" />
            Create Thread
          </Button>
        )}

        <CreatePostDialog
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
        />
        <CreateThreadDialog
          open={createThreadOpen}
          onOpenChange={setCreateThreadOpen}
        />
      </div>
    </aside>
  );
};
