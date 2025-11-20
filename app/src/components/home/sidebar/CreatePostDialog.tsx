import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreatePost, useThreads, useBusinessUnits } from "@/hooks/api";
import type { CreatePostRequest } from "@/types/api";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultThreadId?: number;
}

const defaultValues: CreatePostRequest = {
  thread_id: 0,
  bu_id: undefined,
  title: "",
  content: "",
  icon_url: "",
  image_urls: [],
};

export const CreatePostDialog = ({
  open,
  onOpenChange,
  defaultThreadId,
}: CreatePostDialogProps) => {
  const createPostMutation = useCreatePost();
  const { data: threads } = useThreads();
  const { data: businessUnits } = useBusinessUnits();

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      try {
        await createPostMutation.mutateAsync({
          thread_id: value.thread_id,
          bu_id: value.bu_id || undefined,
          title: value.title,
          content: value.content,
          icon_url: value.icon_url || undefined,
          image_urls: value.image_urls || undefined,
        });
        onOpenChange(false);
        form.reset();
      } catch {
        // Error handled by mutation
      }
    },
  });

  // Reset form when dialog opens/closes or defaultThreadId changes
  useEffect(() => {
    if (open) {
      form.reset({
        thread_id: defaultThreadId || 0,
        bu_id: undefined,
        title: "",
        content: "",
        icon_url: "",
        image_urls: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultThreadId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="thread_id"
            validators={{
              onChange: ({ value }) =>
                !value || value === 0 ? "Hive is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="thread_id">Hive *</Label>
                <Select
                  value={field.state.value?.toString() || ""}
                  onValueChange={(value) =>
                    field.handleChange(parseInt(value, 10))
                  }
                  disabled={!!defaultThreadId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hive" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(threads) && threads.length > 0 ? (
                      threads.map((thread) => (
                        <SelectItem
                          key={thread.id}
                          value={thread.id.toString()}
                        >
                          {thread.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hives available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {defaultThreadId && (
                  <p className="text-xs text-muted-foreground">
                    Hive is pre-selected for this page
                  </p>
                )}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="bu_id">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="bu_id">Business Unit (Optional)</Label>
                <Select
                  value={field.state.value?.toString() || "none"}
                  onValueChange={(value) =>
                    field.handleChange(
                      value && value !== "none"
                        ? parseInt(value, 10)
                        : undefined
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {Array.isArray(businessUnits) && businessUnits.length > 0
                      ? businessUnits.map((bu) => (
                          <SelectItem key={bu.id} value={bu.id.toString()}>
                            {bu.name}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value?.trim() ? "Title is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter post title"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="content"
            validators={{
              onChange: ({ value }) =>
                !value?.trim() ? "Content is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Write your post content..."
                  rows={6}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="icon_url">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL (Optional)</Label>
                <Input
                  id="icon_url"
                  type="url"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || !form.state.canSubmit}
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
