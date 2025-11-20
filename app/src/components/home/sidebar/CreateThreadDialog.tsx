import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
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
import { useCreateThread, useBusinessUnits } from "@/hooks/api";

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateThreadDialog = ({
  open,
  onOpenChange,
}: CreateThreadDialogProps) => {
  const navigate = useNavigate();
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
        const createdThread = await createThreadMutation.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          bu_id: value.bu_id || undefined,
        });
        onOpenChange(false);
        form.reset();
        // Navigate to the created hive
        navigate({
          to: `/hives/$hiveid`,
          params: { hiveid: createdThread.id.toString() },
        });
      } catch {
        // Error handled by mutation
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Hive</DialogTitle>
          <DialogDescription>Create a new discussion hive</DialogDescription>
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
                !value?.trim() ? "Hive name is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Hive Name *</Label>
                <Input
                  id="name"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter hive name"
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
                  placeholder="Describe what this hive is about..."
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
              {createThreadMutation.isPending ? "Creating..." : "Create Hive"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
