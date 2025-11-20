import { useState, useMemo } from "react";
import {
  Home,
  TrendingUp,
  Users,
  Plus,
  Sparkles,
  Loader2,
  Award,
  UserPlus,
  UserMinus,
  Heart,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useThreads,
  usePosts,
  useUsers,
  useJoinThread,
  useLeaveThread,
} from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateThreadDialog } from "./CreateThreadDialog";
import type { Post } from "@/types/api";

const navigationItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: TrendingUp, label: "Popular", path: "/popular" },
  { icon: Sparkles, label: "All", path: "/all" },
  { icon: Heart, label: "Following", path: "/following" },
];

export const LeftSidebar = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: threads, isLoading } = useThreads();
  const { data: posts } = usePosts();
  const { data: allUsers } = useUsers();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const joinThreadMutation = useJoinThread();
  const leaveThreadMutation = useLeaveThread();
  const params = useParams({ strict: false });
  const currentThreadId = params.hiveid ? Number(params.hiveid) : null;

  // Calculate top contributors based on posts and upvotes
  const topContributors = useMemo(() => {
    if (!posts || !allUsers) return [];

    // Aggregate contributions per user
    const contributions = new Map<
      number,
      { user: (typeof allUsers)[0]; postCount: number; totalUpvotes: number }
    >();

    // Initialize with all users
    allUsers.forEach((user) => {
      contributions.set(user.id, {
        user,
        postCount: 0,
        totalUpvotes: 0,
      });
    });

    // Count posts and upvotes
    posts.forEach((post: Post) => {
      const userContrib = contributions.get(post.author_id);
      if (userContrib) {
        userContrib.postCount += 1;
        userContrib.totalUpvotes += post.upvote_count || 0;
      }
    });

    // Calculate score (posts * 3 + upvotes * 0.1)
    const scored = Array.from(contributions.values())
      .map((contrib) => ({
        ...contrib,
        score: contrib.postCount * 3 + contrib.totalUpvotes * 0.1,
      }))
      .filter((contrib) => contrib.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return scored;
  }, [posts, allUsers]);

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

        {/* Hives Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hives
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
                const isFollowing =
                  isAuthenticated &&
                  user &&
                  thread.threadUsers?.some((tu) => tu.user_id === user.id);

                const handleFollowToggle = async (
                  e: React.MouseEvent<HTMLButtonElement>
                ) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isAuthenticated || !user) return;

                  if (isFollowing) {
                    await leaveThreadMutation.mutateAsync(thread.id);
                  } else {
                    await joinThreadMutation.mutateAsync(thread.id);
                  }
                };

                return (
                  <div
                    key={thread.id}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Link
                      to="/hives/$hiveid"
                      params={{ hiveid: thread.id.toString() }}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <div className="h-6 w-6 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                        {initial}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">
                        {thread.name}
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {memberCount}
                      </span>
                      {isAuthenticated &&
                        currentThreadId !== thread.id &&
                        (isFollowing ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary"
                            onClick={handleFollowToggle}
                            disabled={
                              joinThreadMutation.isPending ||
                              leaveThreadMutation.isPending
                            }
                            title="Unfollow hive"
                          >
                            <UserMinus className="h-3.5 w-3.5 fill-current" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleFollowToggle}
                            disabled={
                              joinThreadMutation.isPending ||
                              leaveThreadMutation.isPending
                            }
                            title="Follow hive"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                          </Button>
                        ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No hives yet
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Top Contributors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-primary" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContributors.length > 0 ? (
              topContributors.map((contributor, index) => {
                const userName =
                  contributor.user.firstname && contributor.user.lastname
                    ? `${contributor.user.firstname} ${contributor.user.lastname}`
                    : contributor.user.email?.split("@")[0] || "Unknown";
                const initials =
                  contributor.user.firstname && contributor.user.lastname
                    ? `${contributor.user.firstname[0]}${contributor.user.lastname[0]}`.toUpperCase()
                    : contributor.user.email?.[0].toUpperCase() || "U";

                return (
                  <div key={contributor.user.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {initials}
                        </div>
                        <div>
                          <Link
                            to="/profile"
                            className="text-sm font-medium truncate max-w-full hover:underline hover:text-primary transition-colors"
                          >
                            {userName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {contributor.postCount} posts •{" "}
                            {Math.round(contributor.totalUpvotes)} upvotes
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < topContributors.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">
                No contributors yet
              </p>
            )}
          </CardContent>
        </Card>

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

        {/* Create Hive Button */}
        {isAuthenticated && (
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => setCreateThreadOpen(true)}
          >
            <Users className="mr-2 h-4 w-4" />
            Create Hive
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
