import { useMemo } from "react";
import { Loader2, Heart, Users, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useThreads, usePosts } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const FollowingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: threads, isLoading } = useThreads();
  const { data: allPosts } = usePosts();
  const navigate = useNavigate();

  // Filter threads to only show hives the user is following
  const followingHives = useMemo(() => {
    if (!isAuthenticated || !user || !threads) return [];

    return threads
      .filter((thread) =>
        thread.threadUsers?.some((tu) => tu.user_id === user.id)
      )
      .map((thread) => {
        // Count posts for this hive
        const postCount =
          allPosts?.filter((post) => post.thread_id === thread.id).length || 0;
        return { ...thread, postCount };
      })
      .sort((a, b) => {
        // Sort by post count (most active first), then by member count
        if (b.postCount !== a.postCount) {
          return b.postCount - a.postCount;
        }
        return (b.threadUsers?.length || 0) - (a.threadUsers?.length || 0);
      });
  }, [isAuthenticated, user, threads, allPosts]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Please sign in to see hives you follow
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary fill-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Following</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {followingHives.length === 0
                ? "Hives you follow will appear here"
                : `${followingHives.length} ${
                    followingHives.length === 1 ? "hive" : "hives"
                  }`}
            </p>
          </div>
        </div>
      </div>

      {followingHives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No hives followed yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Start following hives to stay updated with discussions and posts
              from communities you're interested in.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-sm text-primary hover:underline font-medium"
            >
              Browse all hives →
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2">
          {followingHives.map((hive) => {
            const memberCount = hive.threadUsers?.length || 0;
            const initial = hive.name.charAt(0).toUpperCase();
            const postCount =
              "postCount" in hive ? (hive.postCount as number) : 0;

            return (
              <Card
                key={hive.id}
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:border-primary/20",
                  "border-2 hover:scale-[1.02]"
                )}
                onClick={() => navigate({ to: `/hives/${hive.id}` })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0 shadow-sm">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {hive.name}
                      </CardTitle>
                      {hive.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                          {hive.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{memberCount}</span>
                      <span className="text-xs">members</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{postCount}</span>
                      <span className="text-xs">posts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {hive.bu && (
                        <Badge variant="secondary" className="text-xs">
                          {hive.bu.name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(hive.created_at)}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowingPage;
