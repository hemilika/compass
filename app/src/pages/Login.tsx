import { useForm } from "@tanstack/react-form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "../components/ui/Input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "@tanstack/react-router";
import { useLogin } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const response = await loginMutation.mutateAsync({
        email: value.email,
        password: value.password,
      });
      login(response.accessToken, response.user);
      navigate({ to: "/" });
    },
  });

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Welcome back
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Sign in to your account to continue
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.trim()) return "Email is required";
                    if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      type="email"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter your email"
                      className={
                        field.state.meta.errors.length > 0
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Password is required" : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      type="password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter your password"
                      className={
                        field.state.meta.errors.length > 0
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Remember me
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-primary"
                disabled={loginMutation.isPending || !form.state.canSubmit}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-foreground hover:text-foreground/80"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
