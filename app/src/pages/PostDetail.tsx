import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronUp,
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePost,
  useReplies,
  useCreateReply,
  useUpvotePost,
  useRemovePostUpvote,
  useUpvoteReply,
  useRemoveReplyUpvote,
  useMyUpvotes,
  useDeletePost,
  useDeleteReply,
} from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@tanstack/react-form";

const PostDetailPage = () => {
  const { postId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: post, isLoading: postLoading } = usePost(Number(postId));
  const { data: replies, isLoading: repliesLoading } = useReplies(
    Number(postId)
  );
  const { data: myUpvotes } = useMyUpvotes();
  const createReplyMutation = useCreateReply();
  const upvotePostMutation = useUpvotePost();
  const removePostUpvoteMutation = useRemovePostUpvote();
  const upvoteReplyMutation = useUpvoteReply();
  const removeReplyUpvoteMutation = useRemoveReplyUpvote();
  const deletePostMutation = useDeletePost();
  const deleteReplyMutation = useDeleteReply();
  const [sharedPostId, setSharedPostId] = useState<number | null>(null);

  const upvotedPostIds = useMemo(() => {
    if (!myUpvotes || !Array.isArray(myUpvotes)) return new Set<number>();
    return new Set(
      myUpvotes
        .filter((upvote) => upvote.post_id)
        .map((upvote) => upvote.post_id!)
    );
  }, [myUpvotes]);

  const upvotedReplyIds = useMemo(() => {
    if (!myUpvotes || !Array.isArray(myUpvotes)) return new Set<number>();
    return new Set(
      myUpvotes
        .filter((upvote) => upvote.reply_id)
        .map((upvote) => upvote.reply_id!)
    );
  }, [myUpvotes]);

  const replyForm = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!post) return;
      try {
        await createReplyMutation.mutateAsync({
          post_id: +post.id,
          content: value.content,
        });
        replyForm.reset();
      } catch {
        // Error handled by mutation
      }
    },
  });

  const handleUpvotePost = async () => {
    if (!isAuthenticated || !post) return;
    const isUpvoted = upvotedPostIds.has(post.id);
    if (isUpvoted) {
      await removePostUpvoteMutation.mutateAsync(post.id);
    } else {
      await upvotePostMutation.mutateAsync(post.id);
    }
  };

  const handleUpvoteReply = async (replyId: number) => {
    if (!isAuthenticated) return;
    const isUpvoted = upvotedReplyIds.has(replyId);
    if (isUpvoted) {
      await removeReplyUpvoteMutation.mutateAsync(replyId);
    } else {
      await upvoteReplyMutation.mutateAsync(replyId);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setSharedPostId(post.id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setSharedPostId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePostMutation.mutateAsync(post.id);
      navigate({ to: "/" });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await deleteReplyMutation.mutateAsync(replyId);
    } catch {
      // Error handled by mutation
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Post not found</p>
      </div>
    );
  }

  const isUpvoted = upvotedPostIds.has(post.id);
  const authorName =
    post.author?.firstname?.trim() && post.author?.lastname?.trim()
      ? `${post.author.firstname.trim()} ${post.author.lastname.trim()}`
      : post.author?.email?.split("@")[0] || "Unknown";
  const threadName = post.thread?.name || "Unknown Thread";
  const isPostOwner = user?.id === post.author_id;
  const isAdmin = user?.roles?.includes("admin");

  return (
    <div className="space-y-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Post */}
          <Card>
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
                        upvotePostMutation.isPending ||
                        removePostUpvoteMutation.isPending) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    onClick={handleUpvotePost}
                    disabled={
                      !isAuthenticated ||
                      upvotePostMutation.isPending ||
                      removePostUpvoteMutation.isPending
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
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Link
                      to={`/threads/$threadId`}
                      params={{ threadId: post.thread_id.toString() }}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {threadName}
                    </Link>
                    <span>•</span>
                    <span>Posted by {authorName}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.created_at)}</span>
                    {(isPostOwner || isAdmin) && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive"
                            onClick={handleDeletePost}
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <h1 className="mb-3 text-2xl font-bold">{post.title}</h1>
                  <div className="mb-4 whitespace-pre-wrap text-sm">
                    {post.content}
                  </div>

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {post.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Post image ${idx + 1}`}
                          className="w-full rounded-lg object-cover max-h-96"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs"
                      onClick={handleShare}
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

          {/* Reply Form */}
          {isAuthenticated && (
            <Card>
              <CardContent className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    replyForm.handleSubmit();
                  }}
                  className="space-y-3"
                >
                  <replyForm.Field
                    name="content"
                    validators={{
                      onChange: ({ value }) =>
                        !value?.trim()
                          ? "Reply content is required"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <div>
                        <Textarea
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="What are your thoughts?"
                          rows={4}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-sm text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </replyForm.Field>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      createReplyMutation.isPending ||
                      !replyForm.state.canSubmit
                    }
                  >
                    {createReplyMutation.isPending
                      ? "Posting..."
                      : "Post Reply"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Replies */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {replies?.length || 0}{" "}
              {replies?.length === 1 ? "Reply" : "Replies"}
            </h2>
            {repliesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : replies && replies.length > 0 ? (
              replies.map((reply) => {
                const isReplyUpvoted = upvotedReplyIds.has(reply.id);
                const replyAuthorName =
                  reply.author?.firstname?.trim() &&
                  reply.author?.lastname?.trim()
                    ? `${reply.author.firstname.trim()} ${reply.author.lastname.trim()}`
                    : reply.author?.email?.split("@")[0] || "Unknown";
                const isReplyOwner = user?.id === reply.author_id;
                const isReplyAdmin = user?.roles?.includes("admin");

                return (
                  <Card key={reply.id}>
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex flex-col items-center gap-1 bg-muted/30 px-2 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 rounded-sm",
                              isReplyUpvoted && "text-primary",
                              (!isAuthenticated ||
                                upvoteReplyMutation.isPending ||
                                removeReplyUpvoteMutation.isPending) &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => handleUpvoteReply(reply.id)}
                            disabled={
                              !isAuthenticated ||
                              upvoteReplyMutation.isPending ||
                              removeReplyUpvoteMutation.isPending
                            }
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              isReplyUpvoted && "text-primary"
                            )}
                          >
                            {reply.upvote_count}
                          </span>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{replyAuthorName}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(reply.created_at)}</span>
                            {(isReplyOwner || isReplyAdmin) && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-destructive"
                                    onClick={() => handleDeleteReply(reply.id)}
                                    disabled={deleteReplyMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {reply.content}
                          </div>
                          {reply.image_urls && reply.image_urls.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {reply.image_urls.map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Reply image ${idx + 1}`}
                                  className="w-full rounded-lg object-cover max-h-64"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No replies yet. Be the first to reply!
              </p>
            )}
          </div>
    </div>
  );
};

export default PostDetailPage;
