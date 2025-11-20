import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { upvotesApi } from "@/services/api";
import { queryKeys } from "../query-keys";
import type { Post } from "@/types/api";

export const useRemovePostUpvote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => upvotesApi.removePostUpvote(postId),
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.lists(),
      });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData<Post>(
        queryKeys.posts.detail(postId)
      );
      const previousPosts = queryClient.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.lists(),
      });

      // Optimistically update post detail
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
          ...previousPost,
          upvote_count: Math.max(0, previousPost.upvote_count - 1),
        });
      }

      // Optimistically update post lists
      previousPosts.forEach(([queryKey, posts]) => {
        if (posts) {
          queryClient.setQueryData<Post[]>(
            queryKey,
            posts.map((p) =>
              p.id === postId
                ? { ...p, upvote_count: Math.max(0, p.upvote_count - 1) }
                : p
            )
          );
        }
      });

      return { previousPost, previousPosts };
    },
    onSuccess: (_data, postId, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.upvotes.mine() });
      
      // Get post title for feedback message - check from optimistic update or cache
      const post = 
        context?.previousPost || 
        queryClient.getQueryData<Post>(queryKeys.posts.detail(postId)) ||
        (() => {
          // Fallback: search in post lists
          const allPosts = queryClient.getQueriesData<Post[]>({
            queryKey: queryKeys.posts.lists(),
          });
          for (const [, posts] of allPosts) {
            if (Array.isArray(posts)) {
              const found = posts.find((p) => p.id === postId);
              if (found) return found;
            }
          }
          return null;
        })();
      
      const postTitle = post?.title;
      toast.success(
        postTitle 
          ? `You removed your upvote from "${postTitle.length > 50 ? postTitle.substring(0, 50) + '...' : postTitle}"`
          : "You removed your upvote"
      );
    },
    onError: (error: ApiError, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData<Post>(
          queryKeys.posts.detail(postId),
          context.previousPost
        );
      }
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, posts]) => {
          if (posts) {
            queryClient.setQueryData<Post[]>(queryKey, posts);
          }
        });
      }
      // Silently handle if upvote doesn't exist
      if (error.status !== 404) {
        toast.error(error.message || "Failed to remove upvote");
      }
    },
  });
};
