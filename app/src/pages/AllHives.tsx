import { Link } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useThreads, useBusinessUnits } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { formatTimeAgo } from "@/lib/date-utils";

const AllHivesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: threads, isLoading: threadsLoading } =
    useThreads(isAuthenticated);
  const { data: businessUnits } = useBusinessUnits();

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!threads || !Array.isArray(threads) || threads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No hives found.</p>
      </div>
    );
  }

  // Create a map of business units for quick lookup
  const buMap = new Map((businessUnits || []).map((bu) => [bu.id, bu.name]));

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">All Hives</h1>
        <p className="text-sm text-muted-foreground">
          Browse all available hives and communities
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
        {threads.map((thread) => {
          const initial = thread.name.charAt(0).toUpperCase();
          const memberCount = thread.threadUsers?.length || 0;
          const isFollowing =
            isAuthenticated &&
            user &&
            thread.threadUsers?.some(
              (tu: { user_id: number }) => tu.user_id === user.id
            );
          const buName = thread.bu_id ? buMap.get(thread.bu_id) : undefined;

          return (
            <Card
              key={thread.id}
              className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50"
            >
              <Link
                to="/hives/$hiveid"
                params={{ hiveid: thread.id.toString() }}
                className="block"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">
                        {thread.name}
                      </CardTitle>
                      {thread.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {thread.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{memberCount} members</span>
                      </div>
                      {buName && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="truncate">{buName}</span>
                        </>
                      )}
                    </div>

                    {thread.created_at && (
                      <div className="text-xs text-muted-foreground">
                        Created {formatTimeAgo(thread.created_at)}
                      </div>
                    )}

                    {isFollowing && (
                      <Badge variant="secondary" className="w-fit">
                        Following
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AllHivesPage;
