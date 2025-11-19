import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const trendingTopics = [
  { name: "React 19", posts: "12.5k", change: "+15%" },
  { name: "TypeScript 5.5", posts: "8.2k", change: "+23%" },
  { name: "Next.js 15", posts: "6.8k", change: "+8%" },
  { name: "Vite 6", posts: "4.1k", change: "+12%" },
  { name: "Tailwind CSS", posts: "3.9k", change: "+5%" },
];

const popularCommunities = [
  { name: "r/programming", members: "2.5M", online: "45.2k" },
  { name: "r/webdev", members: "1.8M", online: "32.1k" },
  { name: "r/reactjs", members: "450K", online: "8.5k" },
  { name: "r/typescript", members: "320K", online: "5.2k" },
  { name: "r/node", members: "280K", online: "4.8k" },
];

export const RightSidebar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto space-y-4">
      {/* User Card */}
      {isAuthenticated && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/logos/honeycomb-logo.png" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">u/user</p>
                <p className="text-xs text-muted-foreground">1,234 karma</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Profile
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.name}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <p className="ml-6 text-xs text-muted-foreground">
                    {topic.posts} posts
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  {topic.change}
                </Badge>
              </div>
              {index < trendingTopics.length - 1 && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Popular Communities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Popular Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularCommunities.map((community, index) => (
            <div key={community.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {community.name.charAt(2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{community.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {community.members} members
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Join
                </Button>
              </div>
              {index < popularCommunities.length - 1 && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">
            Help
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Reddit Coins
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Reddit Premium
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">
            About
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Careers
          </a>
          <span>•</span>
          <a href="#" className="hover:underline">
            Advertise
          </a>
        </div>
        <p className="pt-2 text-[10px]">
          © 2024 Honeycomb. All rights reserved.
        </p>
      </div>
    </aside>
  );
};
