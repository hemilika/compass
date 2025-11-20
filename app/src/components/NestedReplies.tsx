import { useState, useRef, useEffect } from "react";
import { ChevronUp, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/date-utils";
import type { Reply, Post } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "@tanstack/react-form";
import {
  useCreateReply,
  useUpvoteReply,
  useRemoveReplyUpvote,
  useDeleteReply,
} from "@/hooks/api";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

interface NestedRepliesProps {
  replies: Reply[];
  postId: number;
  post?: Post;
  upvotedReplyIds: Set<number>;
  onReplyCreated?: () => void;
}

const ReplyItem = ({
  reply,
  postId,
  post,
  upvotedReplyIds,
  depth = 0,
  onReplyCreated,
}: {
  reply: Reply;
  postId: number;
  post?: Post;
  upvotedReplyIds: Set<number>;
  depth?: number;
  onReplyCreated?: () => void;
}) => {
  const { isAuthenticated, user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const upvoteReplyMutation = useUpvoteReply();
  const removeReplyUpvoteMutation = useRemoveReplyUpvote();
  const deleteReplyMutation = useDeleteReply();
  const createReplyMutation = useCreateReply();

  const isReplyUpvoted = upvotedReplyIds.has(reply.id);
  const replyAuthorName =
    reply.author?.firstname?.trim() && reply.author?.lastname?.trim()
      ? `${reply.author.firstname.trim()} ${reply.author.lastname.trim()}`
      : reply.author?.email?.split("@")[0] || "Unknown";
  const isReplyOwner = user?.id === reply.author_id;
  const isPostOwner = post && user?.id === post.author_id;
  const isAdmin = user?.roles?.includes("admin");

  // Can delete if: reply owner, post owner, or admin
  const canDeleteReply = isReplyOwner || isPostOwner || isAdmin;

  const replyForm = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      try {
        // Ensure postId and reply.id are numbers (idempotent conversion)
        // Using unary + operator for consistent conversion (same pattern as PostDetail)
        const numericPostId = +postId;
        const numericParentReplyId = +reply.id;

        // Validate numbers are valid integers before sending
        if (
          !Number.isInteger(numericPostId) ||
          isNaN(numericPostId) ||
          numericPostId <= 0
        ) {
          throw new Error("Invalid post ID");
        }
        if (
          !Number.isInteger(numericParentReplyId) ||
          isNaN(numericParentReplyId) ||
          numericParentReplyId <= 0
        ) {
          throw new Error("Invalid parent reply ID");
        }

        // Use reply.post_id to ensure consistency with backend validation
        // The backend checks that parentReply.post_id === createReplyDto.post_id
        // So we must use the same post_id as the parent reply
        const replyPostId = reply.post_id ? +reply.post_id : null;

        // Validate reply.post_id exists and is valid
        if (
          !replyPostId ||
          !Number.isInteger(replyPostId) ||
          isNaN(replyPostId) ||
          replyPostId <= 0
        ) {
          throw new Error("Parent reply missing valid post_id");
        }

        // Use reply.post_id to match backend validation requirement
        // This ensures parentReply.post_id === createReplyDto.post_id
        const finalPostId = replyPostId;

        await createReplyMutation.mutateAsync({
          post_id: finalPostId,
          parent_reply_id: numericParentReplyId,
          content: value.content.trim(),
        });
        replyForm.reset();
        setShowReplyForm(false);
        onReplyCreated?.();
      } catch (error) {
        // Error handled by mutation
        if (
          error instanceof Error &&
          !error.message.includes("Failed to create reply")
        ) {
          console.error("Validation error:", error.message);
        }
      }
    },
  });

  const handleUpvoteReply = async () => {
    if (!isAuthenticated) return;
    const isUpvoted = upvotedReplyIds.has(reply.id);
    if (isUpvoted) {
      await removeReplyUpvoteMutation.mutateAsync(reply.id);
    } else {
      await upvoteReplyMutation.mutateAsync(reply.id);
    }
  };

  const handleDeleteReply = async () => {
    try {
      await deleteReplyMutation.mutateAsync(reply.id);
      setShowDeleteDialog(false);
    } catch {
      // Error handled by mutation
    }
  };

  const maxDepth = 5; // Limit nesting depth
  const canNest = depth < maxDepth;

  return (
    <div
      data-reply-id={reply.id}
      className={cn(
        "space-y-2 scroll-mt-20",
        depth > 0 && "ml-8 border-l-2 border-muted pl-4"
      )}
    >
      <Card>
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
                onClick={handleUpvoteReply}
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
              </div>
              <div className="mb-2 whitespace-pre-wrap text-sm">
                {reply.content}
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && canNest && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Reply
                  </Button>
                )}
                {canDeleteReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteReplyMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
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
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested Reply Form */}
      {showReplyForm && isAuthenticated && canNest && (
        <Card className="ml-8">
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
                    !value?.trim() ? "Reply content is required" : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <Textarea
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </replyForm.Field>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    createReplyMutation.isPending || !replyForm.state.canSubmit
                  }
                >
                  {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    replyForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Child Replies */}
      {reply.childReplies && reply.childReplies.length > 0 && (
        <div className="mt-2 space-y-2">
          {reply.childReplies.map((childReply) => (
            <div key={childReply.id} className="scroll-mt-20">
              <ReplyItem
                reply={childReply}
                postId={postId}
                post={post}
                upvotedReplyIds={upvotedReplyIds}
                depth={depth + 1}
                onReplyCreated={onReplyCreated}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteReply}
        title="Delete Reply"
        description="Are you sure you want to delete this reply? This action cannot be undone."
        isLoading={deleteReplyMutation.isPending}
      />
    </div>
  );
};

export const NestedReplies = ({
  replies,
  postId,
  post,
  upvotedReplyIds,
  onReplyCreated,
}: NestedRepliesProps) => {
  const repliesContainerRef = useRef<HTMLDivElement>(null);

  // Organize replies into a tree structure
  const buildReplyTree = (repliesList: Reply[]): Reply[] => {
    const replyMap = new Map<number, Reply>();
    const rootReplies: Reply[] = [];

    // First pass: create map and initialize childReplies
    repliesList.forEach((reply) => {
      replyMap.set(reply.id, { ...reply, childReplies: [] });
    });

    // Second pass: build tree
    repliesList.forEach((reply) => {
      const replyWithChildren = replyMap.get(reply.id)!;
      if (reply.parent_reply_id) {
        const parent = replyMap.get(reply.parent_reply_id);
        if (parent) {
          if (!parent.childReplies) {
            parent.childReplies = [];
          }
          parent.childReplies.push(replyWithChildren);
        }
      } else {
        rootReplies.push(replyWithChildren);
      }
    });

    return rootReplies;
  };

  const replyTree = buildReplyTree(replies);

  // Find the latest reply (most recently created) - recursively searches all nested replies
  const findLatestReply = (replies: Reply[]): Reply | null => {
    if (replies.length === 0) return null;

    let latest = replies[0];

    const checkReply = (reply: Reply) => {
      const replyDate = new Date(reply.created_at);
      const latestDate = new Date(latest.created_at);
      if (replyDate > latestDate) {
        latest = reply;
      }
      // Check child replies recursively
      if (reply.childReplies && reply.childReplies.length > 0) {
        reply.childReplies.forEach(checkReply);
      }
    };

    replies.forEach(checkReply);
    return latest;
  };

  const latestReply = findLatestReply(replyTree);

  // Scroll to latest reply when replies change (new reply added)
  useEffect(() => {
    if (latestReply && replies.length > 0) {
      // Small delay to ensure DOM is updated after reply is rendered
      const timeoutId = setTimeout(() => {
        // Find the element by data attribute
        const latestElement = document.querySelector(
          `[data-reply-id="${latestReply.id}"]`
        ) as HTMLElement;
        if (latestElement) {
          latestElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [replies.length, latestReply?.id, latestReply]);

  if (replyTree.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No replies yet. Be the first to reply!
      </p>
    );
  }

  return (
    <div ref={repliesContainerRef} className="space-y-3">
      {replyTree.map((reply) => {
        const isLatestReply = latestReply?.id === reply.id;
        return (
          <div
            key={reply.id}
            data-reply-id={reply.id}
            className={cn("scroll-mt-20", isLatestReply && "latest-reply")}
          >
            <ReplyItem
              reply={reply}
              postId={postId}
              post={post}
              upvotedReplyIds={upvotedReplyIds}
              depth={0}
              onReplyCreated={onReplyCreated}
            />
          </div>
        );
      })}
    </div>
  );
};
