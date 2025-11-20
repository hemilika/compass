import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Edit, Save, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserProfile, useUser, useUpdateUser, usePosts } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { formatTimeAgo } from "@/lib/date-utils";
import type { UpdateUserRequest } from "@/types/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  // Get search params from router location
  const router = useRouterState();
  // Idempotent: Parse search params - handle both object and string formats
  const searchParamsRaw = router.location.search;
  const searchParams =
    typeof searchParamsRaw === "object" && searchParamsRaw !== null
      ? (searchParamsRaw as { userId?: string | number })
      : (() => {
          // If it's a string, parse it using URLSearchParams
          const params = new URLSearchParams(
            typeof searchParamsRaw === "string" ? searchParamsRaw : ""
          );
          return { userId: params.get("userId") || undefined };
        })();

  // Idempotent: Get userId from search params, default to current user
  const userId = searchParams?.userId
    ? (() => {
        const num = Number(searchParams.userId);
        return Number.isInteger(num) && !isNaN(num) && num > 0 ? num : null;
      })()
    : null;

  const isViewingOtherUser = userId !== null && userId !== currentUser?.id;

  // Call both hooks unconditionally to follow Rules of Hooks
  const { data: otherUserProfile, isLoading: otherUserLoading } = useUser(
    userId || 0
  );
  const { data: ownProfile, isLoading: ownProfileLoading } = useUserProfile();

  // Use appropriate data based on whether viewing own profile or another user's
  const profile = isViewingOtherUser ? otherUserProfile : ownProfile;
  const profileLoading = isViewingOtherUser
    ? otherUserLoading
    : ownProfileLoading;

  const { data: userPosts } = usePosts();
  const updateUserMutation = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);

  const displayUser = profile || currentUser;
  const isLoading = profileLoading;
  const userInitials =
    displayUser?.firstname && displayUser?.lastname
      ? `${displayUser.firstname[0]}${displayUser.lastname[0]}`.toUpperCase()
      : displayUser?.email?.[0].toUpperCase() || "U";

  const form = useForm({
    defaultValues: {
      firstname: displayUser?.firstname || "",
      lastname: displayUser?.lastname || "",
      techstack: displayUser?.techstack || [],
      user_roles: displayUser?.user_roles || [],
      hobbies: displayUser?.hobbies || [],
    } satisfies UpdateUserRequest,
    onSubmit: async ({ value }) => {
      if (!displayUser) return;
      try {
        await updateUserMutation.mutateAsync({
          id: displayUser.id,
          data: value,
        });
        setIsEditing(false);
      } catch {
        // Error handled by mutation
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">User not found</p>
      </div>
    );
  }

  const userPostsList = Array.isArray(userPosts)
    ? userPosts.filter((post) => post.author_id === displayUser.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Profile</CardTitle>
            {!isViewingOtherUser && !isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : !isViewingOtherUser && isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => form.handleSubmit()}
                  disabled={updateUserMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="NO-LOGO" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {displayUser.firstname && displayUser.lastname
                  ? `${displayUser.firstname} ${displayUser.lastname}`
                  : displayUser.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-muted-foreground">{displayUser.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(displayUser.roles) &&
                displayUser.roles.length > 0
                  ? displayUser.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))
                  : "No roles"}
              </div>
            </div>
          </div>

          <Separator />

          {/* Edit Form */}
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="firstname">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="lastname">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="techstack">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tech Stack (comma-separated)
                    </label>
                    <Input
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="user_roles">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      User Roles (comma-separated)
                    </label>
                    <Input
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="DEV, PO, QA"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="hobbies">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Hobbies (comma-separated)
                    </label>
                    <Input
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Coding, Gaming, Reading"
                    />
                  </div>
                )}
              </form.Field>
            </form>
          ) : (
            <>
              {/* Display Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Tech Stack
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(displayUser.techstack) &&
                    displayUser.techstack.length > 0
                      ? displayUser.techstack.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))
                      : "Not specified"}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    User Roles
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(displayUser.user_roles) &&
                    displayUser.user_roles.length > 0
                      ? displayUser.user_roles.map((role) => (
                          <Badge key={role} variant="outline">
                            {role}
                          </Badge>
                        ))
                      : "Not specified"}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Hobbies
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(displayUser.hobbies) &&
                    displayUser.hobbies.length > 0
                      ? displayUser.hobbies.map((hobby) => (
                          <Badge key={hobby} variant="outline">
                            {hobby}
                          </Badge>
                        ))
                      : "Not specified"}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Member Since
                  </h3>
                  <p className="mt-1">
                    {displayUser.created_at
                      ? formatTimeAgo(displayUser.created_at)
                      : "Unknown date"}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({userPostsList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userPostsList.length > 0 ? (
            <div className="space-y-4">
              {userPostsList.map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                  onClick={() =>
                    navigate({
                      to: "/posts/$postId",
                      params: { postId: post.id.toString() },
                    })
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.upvote_count} upvotes</span>
                        <span>{post.replies?.length || 0} comments</span>
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No posts yet. Start creating content!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
