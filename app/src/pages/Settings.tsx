import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  Palette,
  User,
  Mail,
  Shield,
  Trash2,
  Edit,
  Settings as SettingsIcon,
  Code,
  Briefcase,
  Heart,
  Building2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();

  const displayUser = profile || user;

  const userInitials =
    displayUser?.firstname && displayUser?.lastname
      ? `${displayUser.firstname[0]}${displayUser.lastname[0]}`.toUpperCase()
      : displayUser?.email?.[0].toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-muted-foreground ml-[52px]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Overview Card */}
      {displayUser && (
        <Card className="border-2 bg-linear-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src="NO-LOGO" alt="User" />
                <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-lg font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {displayUser.firstname && displayUser.lastname
                    ? `${displayUser.firstname} ${displayUser.lastname}`
                    : displayUser.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayUser.email}
                </p>
                {displayUser.roles && displayUser.roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {displayUser.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your preferred theme
              </p>
            </div>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      {/* Account Information Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl">Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Email Address
              </p>
            </div>
            <p className="text-foreground font-medium ml-7">
              {displayUser?.email}
            </p>
          </div>

          {/* Name */}
          {(displayUser?.firstname || displayUser?.lastname) && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
              </div>
              <p className="text-foreground font-medium ml-7">
                {displayUser.firstname || ""} {displayUser.lastname || ""}
              </p>
            </div>
          )}

          {/* Business Unit */}
          {displayUser?.bu && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Business Unit
                </p>
              </div>
              <p className="text-foreground font-medium ml-7">
                {displayUser.bu.name}
              </p>
            </div>
          )}

          {/* Tech Stack */}
          {displayUser?.techstack && displayUser.techstack.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Tech Stack
                </p>
              </div>
              <div className="ml-7 flex flex-wrap gap-2">
                {displayUser.techstack.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User Roles */}
          {displayUser?.user_roles && displayUser.user_roles.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Roles
                </p>
              </div>
              <div className="ml-7 flex flex-wrap gap-2">
                {displayUser.user_roles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-foreground border border-border"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {displayUser?.hobbies && displayUser.hobbies.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Hobbies
                </p>
              </div>
              <div className="ml-7 flex flex-wrap gap-2">
                {displayUser.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-accent/50 px-2 py-1 text-xs font-medium text-foreground border border-border"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Account Created */}
          {displayUser?.created_at && (
            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Member Since
                </p>
              </div>
              <p className="text-foreground font-medium ml-7">
                {new Date(displayUser.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl">Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/20 transition-colors"
            onClick={() => navigate({ to: "/profile" })}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
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
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
