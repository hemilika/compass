import { Home, TrendingUp, Users, Plus, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Popular", path: "/popular" },
  { icon: Sparkles, label: "All", path: "/all" },
];

const communities = [
  { name: "r/programming", members: "2.5M" },
  { name: "r/webdev", members: "1.8M" },
  { name: "r/reactjs", members: "450K" },
  { name: "r/typescript", members: "320K" },
  { name: "r/node", members: "280K" },
];

export const LeftSidebar = () => {
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

        {/* Communities Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Communities
            </h3>
          </div>
          <div className="space-y-1">
            {communities.map((community) => (
              <Link
                key={community.name}
                to={`/r/${community.name.replace("r/", "")}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {community.name.charAt(2).toUpperCase()}
                  </div>
                  <span className="font-medium">{community.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {community.members}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Create Post Button */}
        <Button className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>

        {/* Create Community Button */}
        <Button className="w-full" variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </div>
    </aside>
  );
};
