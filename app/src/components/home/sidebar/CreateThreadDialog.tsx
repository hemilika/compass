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
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateThread, useBusinessUnits } from "@/hooks/api";

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateThreadDialog = ({
  open,
  onOpenChange,
}: CreateThreadDialogProps) => {
  const createThreadMutation = useCreateThread();
  const { data: businessUnits } = useBusinessUnits();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      bu_id: undefined as number | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        await createThreadMutation.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          bu_id: value.bu_id || undefined,
        });
        onOpenChange(false);
        form.reset();
      } catch {
        // Error handled by mutation
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Thread</DialogTitle>
          <DialogDescription>Create a new discussion thread</DialogDescription>
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
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value?.trim() ? "Thread name is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Thread Name *</Label>
                <Input
                  id="name"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter thread name"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe what this thread is about..."
                  rows={4}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="bu_id">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="bu_id">Business Unit (Optional)</Label>
                <Select
                  value={field.state.value?.toString() || ""}
                  onValueChange={(value) =>
                    field.handleChange(value ? parseInt(value, 10) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {businessUnits?.map((bu) => (
                      <SelectItem key={bu.id} value={bu.id.toString()}>
                        {bu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={createThreadMutation.isPending || !form.state.canSubmit}
            >
              {createThreadMutation.isPending ? "Creating..." : "Create Thread"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

