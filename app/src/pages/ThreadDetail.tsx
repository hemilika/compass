import { useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useThread,
  usePosts,
  useJoinThread,
  useLeaveThread,
  useDeleteThread,
} from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { formatTimeAgo } from "@/lib/date-utils";
import { CreatePostDialog } from "@/components/home/sidebar/CreatePostDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

const ThreadDetailPage = () => {
  const { hiveid } = useParams({ strict: false });
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Type-safe conversion of hiveid to number
  const threadId = useMemo(() => {
    if (!hiveid) return null;
    const num = Number(hiveid);
    return Number.isInteger(num) && !isNaN(num) && num > 0 ? num : null;
  }, [hiveid]);

  const { data: thread, isLoading: threadLoading } = useThread(threadId || 0);
  const { data: posts, isLoading: postsLoading } = usePosts(threadId || 0);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const joinThreadMutation = useJoinThread();
  const leaveThreadMutation = useLeaveThread();
  const deleteThreadMutation = useDeleteThread();

  // Type-safe check if current user is following the thread
  const isFollowing = useMemo(() => {
    if (!thread || !user || !thread.threadUsers) return false;
    return thread.threadUsers.some(
      (threadUser) => threadUser.user_id === user.id
    );
  }, [thread, user]);

  // Type-safe check if current user can delete the thread (admin or creator)
  const canDeleteThread = useMemo(() => {
    if (!thread || !user) return false;
    const isAdmin = user.roles?.includes("admin") ?? false;
    const isCreator = thread.creator_id === user.id;
    return isAdmin || isCreator;
  }, [thread, user]);

  // Handle thread deletion
  const handleDeleteThread = () => {
    if (threadId) {
      deleteThreadMutation.mutate(threadId, {
        onSuccess: () => {
          // Navigate to home after successful deletion
          navigate({ to: "/" });
        },
      });
    }
  };

  // Ensure we have valid posts and deduplicate by id
  // This hook must be called before any early returns
  const postsList = useMemo(() => {
    if (!posts || !Array.isArray(posts)) return [];
    const validPosts = posts.filter((post) => post && post.id);
    return Array.from(
      new Map(validPosts.map((post) => [post.id, post])).values()
    );
  }, [posts]);

  const memberCount = thread?.threadUsers?.length || 0;

  if (threadLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Hive not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 relative">
      {/* Loading Overlay - Shows when deleting thread */}
      {deleteThreadMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">
              Deleting hive...
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a moment
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Hive Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {thread.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{thread.name}</CardTitle>
                  {thread.description && (
                    <p className="mt-1 text-muted-foreground">
                      {thread.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{memberCount} members</span>
                </div>
                {thread.bu && (
                  <Badge variant="secondary">{thread.bu.name}</Badge>
                )}
                <span>Created {formatTimeAgo(thread.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Follow/Unfollow Option */}
                    {isFollowing ? (
                      <DropdownMenuItem
                        onClick={() => {
                          if (threadId) {
                            leaveThreadMutation.mutate(threadId);
                          }
                        }}
                        disabled={
                          leaveThreadMutation.isPending ||
                          joinThreadMutation.isPending ||
                          !threadId
                        }
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          if (threadId) {
                            joinThreadMutation.mutate(threadId);
                          }
                        }}
                        disabled={
                          joinThreadMutation.isPending ||
                          leaveThreadMutation.isPending ||
                          !threadId
                        }
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </DropdownMenuItem>
                    )}
                    {/* Create Post Option */}
                    <DropdownMenuItem onClick={() => setCreatePostOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </DropdownMenuItem>
                    {/* Delete Thread Option - Only visible to admins or thread creator */}
                    {canDeleteThread && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={deleteThreadMutation.isPending}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Hive
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Posts ({postsList.length})</h2>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : postsList.length > 0 ? (
          <div className="space-y-4">
            {postsList.map((post) => {
              const authorName =
                post.author?.firstname?.trim() && post.author?.lastname?.trim()
                  ? `${post.author.firstname.trim()} ${post.author.lastname.trim()}`
                  : post.author?.email?.split("@")[0] || "Unknown";
              const replyCount = post.replies?.length || 0;

              return (
                <Card
                  key={post.id}
                  className="cursor-pointer transition-colors hover:shadow-md"
                  onClick={() => navigate({ to: `/posts/${post.id}` })}
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Posted by {authorName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
                    <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.upvote_count} upvotes</span>
                      <span>{replyCount} comments</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. Be the first to create one!
              </p>
              {isAuthenticated && (
                <Button
                  className="mt-4"
                  onClick={() => setCreatePostOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        defaultThreadId={threadId || undefined}
      />

      {/* Delete Thread Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteThread}
        title="Delete Hive"
        description={`Are you sure you want to delete "${thread?.name}"? This will permanently delete the hive, all posts, replies, and upvotes. This action cannot be undone.`}
        isLoading={deleteThreadMutation.isPending}
      />
    </div>
  );
};

export default ThreadDetailPage;
