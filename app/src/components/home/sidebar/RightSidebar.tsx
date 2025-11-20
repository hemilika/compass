import { Link } from "@tanstack/react-router";
import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useThreads, useBusinessUnits } from "@/hooks/api";

export const RightSidebar = () => {
  const { data: threads, isLoading: threadsLoading } = useThreads();
  const { data: businessUnits, isLoading: buLoading } = useBusinessUnits();

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto space-y-4">
      {/* Business Units */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Business Units
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {buLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : Array.isArray(businessUnits) && businessUnits.length > 0 ? (
            businessUnits.slice(0, 5).map((bu, index) => (
              <div key={bu.id}>
                <Link
                  to="/bu/$buId"
                  params={{ buId: bu.id.toString() }}
                  className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {bu.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bu.name}</p>
                  </div>
                </Link>
                {index < Math.min(businessUnits.length, 5) - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No business units</p>
          )}
        </CardContent>
      </Card>

      {/* Popular Threads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Popular Hives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {threadsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : Array.isArray(threads) && threads.length > 0 ? (
            threads.slice(0, 5).map((thread, index) => {
              const memberCount = thread.threadUsers?.length || 0;
              return (
                <div key={thread.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      to="/hives/$hiveid"
                      params={{ hiveid: thread.id.toString() }}
                      className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity"
                    >
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {thread.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{thread.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {memberCount} members
                        </p>
                      </div>
                    </Link>
                  </div>
                  {index < Math.min(threads.length, 5) - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground">No threads yet</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};
