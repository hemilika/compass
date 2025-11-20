import { Link, useNavigate } from "@tanstack/react-router";
import { TrendingUp, Sparkles, Loader2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useUserProfile,
  useThreads,
  useBusinessUnits,
} from "@/hooks/api";
import { QuizDialog } from "@/components/Quiz/QuizDialog";
import { useState } from "react";

export const RightSidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: threads, isLoading: threadsLoading } = useThreads();
  const { data: businessUnits, isLoading: buLoading } = useBusinessUnits();

  const displayUser = profile || user;
  const userInitials =
    displayUser?.firstname && displayUser?.lastname
      ? `${displayUser.firstname[0]}${displayUser.lastname[0]}`.toUpperCase()
      : displayUser?.email?.[0].toUpperCase() || "U";

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto space-y-4">
      {/* User Card */}
      {isAuthenticated && displayUser && (
        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => navigate({ to: "/settings" })}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="NO-LOGO" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {displayUser.firstname && displayUser.lastname
                    ? `${displayUser.firstname} ${displayUser.lastname}`
                    : displayUser.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayUser.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {bu.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bu.name}</p>
                    </div>
                  </div>
                </div>
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
            Popular Threads
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
