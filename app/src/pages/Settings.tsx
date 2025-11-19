import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();

  const displayUser = profile || user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Appearance</h3>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <ThemeSwitcher />
            </div>
          </div>

          <Separator />

          {/* Account Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="mt-1">{displayUser?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Roles
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {displayUser?.roles?.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Actions</h3>
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate({ to: "/profile" })}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete your account? This action cannot be undone."
                    )
                  ) {
                    // TODO: Implement account deletion
                    alert("Account deletion coming soon");
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

