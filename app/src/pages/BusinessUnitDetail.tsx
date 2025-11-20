import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBusinessUnit } from "@/hooks/api";
import { Link } from "@tanstack/react-router";
import { formatTimeAgo } from "@/lib/date-utils";

const BusinessUnitDetail = () => {
  const navigate = useNavigate();
  const { buId } = useParams({ strict: false });

  // Idempotent: Convert buId to number safely
  const buIdNumber = buId
    ? (() => {
        const num = Number(buId);
        return Number.isInteger(num) && !isNaN(num) && num > 0 ? num : null;
      })()
    : null;

  const { data: businessUnit, isLoading: buLoading } = useBusinessUnit(
    buIdNumber || 0
  );

  if (buLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!businessUnit || !buIdNumber) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Business Unit not found</p>
      </div>
    );
  }

  // Idempotent: Use threads and users from API response, with fallback to empty arrays
  const buHives = Array.isArray(businessUnit.threads)
    ? businessUnit.threads
    : [];
  const buUsers = Array.isArray(businessUnit.users) ? businessUnit.users : [];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Business Unit Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {businessUnit.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{businessUnit.name}</CardTitle>
              {businessUnit.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {businessUnit.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Hives
              </p>
              <p className="text-2xl font-bold">{buHives.length}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Members
              </p>
              <p className="text-2xl font-bold">{buUsers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hives Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Hives ({buHives.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buHives.length > 0 ? (
            <div className="space-y-3">
              {buHives.map((hive, index) => {
                // Idempotent: Convert hive.id to string safely
                const hiveId =
                  typeof hive.id === "string" ? hive.id : hive.id.toString();

                return (
                  <div key={hive.id}>
                    <Link
                      to="/hives/$hiveid"
                      params={{ hiveid: hiveId }}
                      className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                            {hive.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {hive.name}
                            </h4>
                            {hive.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {hive.description}
                              </p>
                            )}
                            {hive.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Created {formatTimeAgo(hive.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    {index < buHives.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hives in this business unit yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Members ({buUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {buUsers.length > 0 ? (
            <div className="space-y-3">
              {buUsers.map((user, index) => {
                // Idempotent: Convert user.id to number safely
                const userId =
                  typeof user.id === "string" ? Number(user.id) : user.id;

                const userName =
                  user.firstname && user.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : user.email?.split("@")[0] || "Unknown";
                const initials =
                  user.firstname && user.lastname
                    ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
                    : user.email?.[0].toUpperCase() || "U";

                return (
                  <div key={user.id}>
                    <Link
                      to="/profile"
                      search={{ userId: userId }}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                    >
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{userName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        {Array.isArray(user.user_roles) &&
                          user.user_roles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.user_roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                      {Array.isArray(user.roles) && user.roles.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Link>
                    {index < buUsers.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No members in this business unit yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessUnitDetail;
