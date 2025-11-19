import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  community: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
  image?: string;
  hasImage: boolean;
}

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Just launched my first React app! What do you think?",
    content:
      "After months of learning, I finally built and deployed my first React application. It's a task management tool with real-time updates. Would love to get feedback from the community!",
    author: "dev_newbie",
    community: "r/reactjs",
    upvotes: 1247,
    comments: 89,
    timeAgo: "2 hours ago",
    hasImage: false,
  },
  {
    id: "2",
    title: "TypeScript 5.5 is out with amazing new features",
    content:
      "The latest TypeScript release includes improved type inference, better error messages, and performance improvements. Check out the release notes!",
    author: "ts_enthusiast",
    community: "r/typescript",
    upvotes: 3421,
    comments: 234,
    timeAgo: "5 hours ago",
    hasImage: false,
  },
  {
    id: "3",
    title: "Building a full-stack app with Next.js and Prisma",
    content:
      "Here's a comprehensive guide on how I built a production-ready application using Next.js 14, Prisma, and PostgreSQL. Includes authentication, database setup, and deployment strategies.",
    author: "fullstack_dev",
    community: "r/webdev",
    upvotes: 2890,
    comments: 156,
    timeAgo: "8 hours ago",
    hasImage: true,
  },
  {
    id: "4",
    title: "What's your favorite Node.js framework in 2024?",
    content:
      "I'm starting a new project and trying to decide between Express, Fastify, and Hono. What are your experiences with these frameworks?",
    author: "backend_engineer",
    community: "r/node",
    upvotes: 567,
    comments: 78,
    timeAgo: "12 hours ago",
    hasImage: false,
  },
];

export const Posts = () => {
  const [votedPosts, setVotedPosts] = useState<Record<string, "up" | "down" | null>>({});

  const handleVote = (postId: string, direction: "up" | "down") => {
    setVotedPosts((prev) => {
      const current = prev[postId];
      if (current === direction) {
        return { ...prev, [postId]: null };
      }
      return { ...prev, [postId]: direction };
    });
  };

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <Button variant="ghost" size="sm" className="h-8">
          Hot
        </Button>
        <Button variant="ghost" size="sm" className="h-8">
          New
        </Button>
        <Button variant="ghost" size="sm" className="h-8">
          Top
        </Button>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" className="h-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {mockPosts.map((post) => {
          const voteState = votedPosts[post.id] || null;
          const isUpvoted = voteState === "up";
          const isDownvoted = voteState === "down";

          return (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Voting Section */}
                  <div className="flex flex-col items-center gap-1 bg-muted/30 px-2 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-sm",
                        isUpvoted && "text-primary"
                      )}
                      onClick={() => handleVote(post.id, "up")}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isUpvoted && "text-primary",
                        isDownvoted && "text-destructive"
                      )}
                    >
                      {post.upvotes}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-sm",
                        isDownvoted && "text-destructive"
                      )}
                      onClick={() => handleVote(post.id, "down")}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 p-4">
                    {/* Post Header */}
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {post.community}
                      </span>
                      <span>•</span>
                      <span>Posted by u/{post.author}</span>
                      <span>•</span>
                      <span>{post.timeAgo}</span>
                    </div>

                    {/* Post Title */}
                    <h3 className="mb-2 text-lg font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h3>

                    {/* Post Content */}
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>

                    {/* Post Image Placeholder */}
                    {post.hasImage && (
                      <div className="mb-3 h-64 w-full rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          Image placeholder
                        </span>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {post.comments} Comments
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                      >
                        <Bookmark className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
