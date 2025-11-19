import { useMemo } from "react";
import {
  ChevronUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePosts, useUpvotePost, useRemovePostUpvote, useMyUpvotes } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types/api";

export const Posts = () => {
  const { isAuthenticated } = useAuth();
  const { data: posts, isLoading, error } = usePosts();
  const { data: myUpvotes } = useMyUpvotes();
  const upvoteMutation = useUpvotePost();
  const removeUpvoteMutation = useRemovePostUpvote();

  // Create a map of upvoted post IDs for quick lookup
  const upvotedPostIds = useMemo(() => {
    if (!myUpvotes) return new Set<number>();
    return new Set(
      myUpvotes
        .filter((upvote) => upvote.post_id)
        .map((upvote) => upvote.post_id!)
    );
  }, [myUpvotes]);

  const handleUpvote = async (postId: number) => {
    if (!isAuthenticated) return;

    const isUpvoted = upvotedPostIds.has(postId);
    if (isUpvoted) {
      await removeUpvoteMutation.mutateAsync(postId);
    } else {
      await upvoteMutation.mutateAsync(postId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No posts found. Be the first to create one!</p>
      </div>
    );
  }

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
        {posts.map((post: Post) => {
          const isUpvoted = upvotedPostIds.has(post.id);
          const replyCount = post.replies?.length || 0;
          const authorName =
            post.author?.firstname && post.author?.lastname
              ? `${post.author.firstname} ${post.author.lastname}`
              : post.author?.email?.split("@")[0] || "Unknown";
          const threadName = post.thread?.name || "Unknown Thread";

          return (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Voting Section */}
                  <div className="flex flex-col items-center gap-1 bg-muted/30 px-2 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-sm",
                        isUpvoted && "text-primary",
                        (!isAuthenticated || upvoteMutation.isPending || removeUpvoteMutation.isPending) && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleUpvote(post.id)}
                      disabled={!isAuthenticated || upvoteMutation.isPending || removeUpvoteMutation.isPending}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isUpvoted && "text-primary"
                      )}
                    >
                      {post.upvote_count}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 p-4">
                    {/* Post Header */}
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {threadName}
                      </span>
                      <span>•</span>
                      <span>Posted by {authorName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.created_at)}</span>
                    </div>

                    {/* Post Title */}
                    <h3 className="mb-2 text-lg font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h3>

                    {/* Post Content */}
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>

                    {/* Post Images */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {post.image_urls.slice(0, 3).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Post image ${idx + 1}`}
                            className="w-full rounded-lg object-cover max-h-64"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ))}
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
                        {replyCount} {replyCount === 1 ? "Comment" : "Comments"}
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
