import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronUp,
  MessageCircle,
  Share2,
  Bookmark,
  Loader2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
import { useAuth } from "@/hooks/useAuth";
import { LeftSidebar } from "@/components/home/sidebar/LeftSidebar";
import { RightSidebar } from "@/components/home/sidebar/RightSidebar";
import type { Post } from "@/types/api";

const PopularPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: posts, isLoading, error } = usePosts();
  const { data: myUpvotes } = useMyUpvotes();
  const upvoteMutation = useUpvotePost();
  const removeUpvoteMutation = useRemovePostUpvote();
  const [sharedPostId, setSharedPostId] = useState<number | null>(null);

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

  const handleSave = () => {
    toast.info("Save functionality coming soon!");
  };

  // Sort by upvotes (popular)
  const popularPosts = useMemo(() => {
    if (!posts || !Array.isArray(posts)) return [];
    // Ensure we have valid posts and deduplicate by id
    const validPosts = posts.filter((post) => post && post.id);
    const uniquePosts = Array.from(
      new Map(validPosts.map((post) => [post.id, post])).values()
    );
    if (uniquePosts.length === 0) return [];
    return [...uniquePosts].sort((a, b) => b.upvote_count - a.upvote_count);
  }, [posts]);

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
        <p className="text-destructive">
          Failed to load posts. Please try again later.
        </p>
      </div>
    );
  }

  if (!popularPosts || popularPosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          No posts found. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <LeftSidebar />
        </div>
        <div className="col-span-7 space-y-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Popular Posts</h1>
            <p className="text-sm text-muted-foreground">
              Most upvoted posts across all threads
            </p>
          </div>

          <div className="space-y-4">
            {popularPosts.map((post: Post) => {
              const isUpvoted = upvotedPostIds.has(post.id);
              const replyCount = post.replies?.length || 0;
              const authorName =
                post.author?.firstname?.trim() && post.author?.lastname?.trim()
                  ? `${post.author.firstname.trim()} ${post.author.lastname.trim()}`
                  : post.author?.email?.split("@")[0] || "Unknown";
              const threadName = post.thread?.name || "Unknown Thread";

              return (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex">
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

                      <div className="flex-1 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Link
                            to="/threads/$threadId"
                            params={{ threadId: post.thread_id.toString() }}
                            className="font-semibold text-foreground hover:underline"
                          >
                            {threadName}
                          </Link>
                          <span>•</span>
                          <span>Posted by {authorName}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>

                        <Link
                          to="/posts/$postId"
                          params={{ postId: post.id.toString() }}
                        >
                          <h3 className="mb-2 text-lg font-semibold leading-tight hover:text-primary transition-colors cursor-pointer">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
                          {post.content}
                        </p>

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

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 text-xs"
                            onClick={() =>
                              navigate({
                                to: "/posts/$postId",
                                params: { postId: post.id.toString() },
                              })
                            }
                          >
                            <MessageCircle className="h-4 w-4" />
                            {replyCount}{" "}
                            {replyCount === 1 ? "Comment" : "Comments"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 text-xs"
                            onClick={handleSave}
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
        <div className="col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default PopularPage;
