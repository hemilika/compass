import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronUp,
  MessageCircle,
  Share2,
  Loader2,
  Check,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePosts,
  useUpvotePost,
  useRemovePostUpvote,
  useMyUpvotes,
} from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import type { Post } from "@/types/api";

type SortOption = "hot" | "new" | "top";

interface PostsProps {
  posts?: Post[];
}

export const Posts = ({ posts: providedPosts }: PostsProps = {}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>("new");
  const { data: fetchedPosts, isLoading, error } = usePosts();
  const { data: myUpvotes } = useMyUpvotes();
  
  // Use provided posts or fetch them
  const posts = providedPosts ?? fetchedPosts;
  // Only show loading if we're fetching posts (not using provided posts)
  const isActuallyLoading = !providedPosts && isLoading;
  const upvoteMutation = useUpvotePost();
  const removeUpvoteMutation = useRemovePostUpvote();
  const [sharedPostId, setSharedPostId] = useState<number | null>(null);

  // Create a map of upvoted post IDs for quick lookup
  const upvotedPostIds = useMemo(() => {
    if (!myUpvotes || !Array.isArray(myUpvotes)) return new Set<number>();
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

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setSharedPostId(post.id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setSharedPostId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) return [];
    // Ensure we have a valid array and deduplicate by id
    const validPosts = posts.filter((post) => post && post.id);
    const uniquePosts = Array.from(
      new Map(validPosts.map((post) => [post.id, post])).values()
    );
    if (uniquePosts.length === 0) return [];
    const sorted = [...uniquePosts];
    switch (sortBy) {
      case "new":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "top":
        return sorted.sort((a, b) => b.upvote_count - a.upvote_count);
      case "hot":
        // Hot = recent posts with high upvotes
        return sorted.sort((a, b) => {
          const aScore =
            a.upvote_count /
            (1 +
              (Date.now() - new Date(a.created_at).getTime()) /
                (1000 * 60 * 60));
          const bScore =
            b.upvote_count /
            (1 +
              (Date.now() - new Date(b.created_at).getTime()) /
                (1000 * 60 * 60));
          return bScore - aScore;
        });
      default:
        return sorted;
    }
  }, [posts, sortBy]);


  if (isActuallyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">
          Failed to load posts. Please try again later.
        </p>
      </div>
    );
  }

  if (!sortedPosts || sortedPosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          No posts found. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <Button
          variant={sortBy === "hot" ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => setSortBy("hot")}
        >
          Hot
        </Button>
        <Button
          variant={sortBy === "new" ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => setSortBy("new")}
        >
          New
        </Button>
        <Button
          variant={sortBy === "top" ? "default" : "ghost"}
          size="sm"
          className="h-8"
          onClick={() => setSortBy("top")}
        >
          Top
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.map((post: Post) => {
          const isUpvoted = upvotedPostIds.has(post.id);
          const replyCount = post.replies?.length || 0;
          const authorName =
            post.author?.firstname?.trim() && post.author?.lastname?.trim()
              ? `${post.author.firstname.trim()} ${post.author.lastname.trim()}`
              : post.author?.email?.split("@")[0] || "Unknown";
          const threadName = post.thread?.name || "Unknown Hive";

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
                        (!isAuthenticated ||
                          upvoteMutation.isPending ||
                          removeUpvoteMutation.isPending) &&
                          "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleUpvote(post.id)}
                      disabled={
                        !isAuthenticated ||
                        upvoteMutation.isPending ||
                        removeUpvoteMutation.isPending
                      }
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
                    <Link
                      to={`/posts/$postId`}
                      params={{ postId: post.id.toString() }}
                    >
                      <h3 className="mb-2 text-lg font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>

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
                              (e.target as HTMLImageElement).style.display =
                                "none";
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
                        onClick={() => navigate({ to: `/posts/${post.id}` })}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {replyCount} {replyCount === 1 ? "Comment" : "Comments"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs"
                        onClick={() => handleShare(post)}
                      >
                        {sharedPostId === post.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        Share
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
