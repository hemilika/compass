import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/httpClient";
import { postsApi, threadsApi } from "@/services/api";
import type { CreatePostRequest, Post } from "@/types/api";
import { queryKeys } from "../query-keys";
import { useAuth } from "@/hooks/use-auth";

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.create(data),
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.list(newPost.thread_id),
      });

      // Snapshot previous values
      const previousPosts = queryClient.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.lists(),
      });
      const previousThreadPosts = queryClient.getQueryData<Post[]>(
        queryKeys.posts.list(newPost.thread_id)
      );

      // Generate temporary ID
      const tempId = -Date.now(); // Negative to avoid conflicts

      // Optimistically update
      if (user) {
        const optimisticPost: Post = {
          id: tempId,
          thread_id: newPost.thread_id,
          bu_id: newPost.bu_id,
          author_id: user.id,
          title: newPost.title,
          content: newPost.content,
          icon_url: newPost.icon_url,
          image_urls: newPost.image_urls || [],
          upvote_count: 0,
          created_at: new Date().toISOString(),
          author: user,
        };

        // Update all post lists
        previousPosts.forEach(([queryKey, posts]) => {
          if (posts) {
            queryClient.setQueryData<Post[]>(queryKey, [
              optimisticPost,
              ...posts,
            ]);
          }
        });

        // Update thread-specific list
        if (previousThreadPosts) {
          queryClient.setQueryData<Post[]>(
            queryKeys.posts.list(newPost.thread_id),
            [optimisticPost, ...previousThreadPosts]
          );
        }
      }

      return {
        previousPosts,
        previousThreadPosts,
        threadId: newPost.thread_id,
        tempId,
      };
    },
    onSuccess: async (data, _variables, context) => {
      if (context) {
        // Replace optimistic post with real one
        context.previousPosts.forEach(([queryKey, posts]) => {
          if (posts) {
            queryClient.setQueryData<Post[]>(
              queryKey,
              posts.map((p) => (p.id === context.tempId ? data : p))
            );
          }
        });
        if (context.previousThreadPosts) {
          queryClient.setQueryData<Post[]>(
            queryKeys.posts.list(context.threadId),
            context.previousThreadPosts.map((p) =>
              p.id === context.tempId ? data : p
            )
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.list(context?.threadId || data.thread_id),
      });
      // Get thread name for toast message
      try {
        const thread = await threadsApi.getById(data.thread_id);
        toast.success(`You created a post to ${thread.name} hive`);
      } catch {
        toast.success("You created a post");
      }
    },
    onError: (error: ApiError, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, posts]) => {
          if (posts) {
            queryClient.setQueryData<Post[]>(queryKey, posts);
          }
        });
      }
      if (context?.previousThreadPosts && context.threadId) {
        queryClient.setQueryData<Post[]>(
          queryKeys.posts.list(context.threadId),
          context.previousThreadPosts
        );
      }
      toast.error(error.message || "You couldn't create the post");
    },
  });
};
