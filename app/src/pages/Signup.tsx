import React, { useMemo, useCallback } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSignup, useBusinessUnits } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessUnit: string;
  techStack: string;
  companyRole: string;
  hobbies: string;
};

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (score === 0) {
    return {
      score,
      label: "Enter a password",
      color: "text-zinc-400",
      bgColor: "bg-zinc-200",
      checks,
    };
  } else if (score <= 2) {
    return {
      score,
      label: "Weak",
      color: "text-red-600",
      bgColor: "bg-red-500",
      checks,
    };
  } else if (score <= 3) {
    return {
      score,
      label: "Fair",
      color: "text-orange-600",
      bgColor: "bg-orange-500",
      checks,
    };
  } else if (score <= 4) {
    return {
      score,
      label: "Good",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
      checks,
    };
  } else {
    return {
      score,
      label: "Strong",
      color: "text-green-600",
      bgColor: "bg-green-500",
      checks,
    };
  }
};

const PasswordRequirement = ({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center ${
        met ? "bg-green-100 dark:bg-green-900" : "bg-zinc-100 dark:bg-zinc-800"
      }`}
    >
      {met ? (
        <svg
          className="w-3 h-3 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      )}
    </div>
    <span
      className={
        met
          ? "text-green-600 dark:text-green-400"
          : "text-zinc-500 dark:text-zinc-400"
      }
    >
      {children}
    </span>
  </div>
);

const defaultValues: SignupFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  businessUnit: "",
  techStack: "",
  companyRole: "",
  hobbies: "",
};
const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const signupMutation = useSignup();
  const { data: businessUnits } = useBusinessUnits();

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      try {
        // Convert comma-separated strings to arrays, filtering out empty values
        const techStackArray = value.techStack
          ? value.techStack
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
        const companyRoleArray = value.companyRole
          ? value.companyRole
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
        const hobbiesArray = value.hobbies
          ? value.hobbies
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

        const response = await signupMutation.mutateAsync({
          email: value.email,
          password: value.password,
          firstname: value.firstName,
          lastname: value.lastName,
          bu_id: value.businessUnit
            ? parseInt(value.businessUnit, 10)
            : undefined,
          techstack:
            techStackArray && techStackArray.length > 0
              ? techStackArray
              : undefined,
          user_roles:
            companyRoleArray && companyRoleArray.length > 0
              ? companyRoleArray
              : undefined,
          hobbies:
            hobbiesArray && hobbiesArray.length > 0 ? hobbiesArray : undefined,
        });
        // Auto-login after signup
        login(response.accessToken, response.user);
        navigate({ to: "/", replace: true });
      } catch {
        // Error is handled by the mutation hook
      }
    },
  });

  // Track password value for strength calculation
  const [passwordValue, setPasswordValue] = React.useState("");
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(passwordValue),
    [passwordValue]
  );

  const handleGoogleClick = useCallback(() => {
    // TODO: Implement Google OAuth
    console.log("Google login clicked");
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Create your account
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Join us today and get started
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
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) =>
                      !value.trim() ? "First name is required" : undefined,
                  }}
                >
                  {(field) => (
                    <div>
                      <Input
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="John"
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
                  name="lastName"
                  validators={{
                    onChange: ({ value }) =>
                      !value.trim() ? "Last name is required" : undefined,
                  }}
                >
                  {(field) => (
                    <div>
                      <Input
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Doe"
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
              </div>

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
                      placeholder="john.doe@example.com"
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

              <div className="space-y-3">
                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) => {
                      setPasswordValue(value ?? "");
                      if (!value) return "Password is required";
                      if (value.length < 8)
                        return "Password must be at least 8 characters";
                      if (!/[a-z]/.test(value))
                        return "Password must contain at least one lowercase letter";
                      if (!/[A-Z]/.test(value))
                        return "Password must contain at least one uppercase letter";
                      if (!/\d/.test(value))
                        return "Password must contain at least one number";
                      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
                        return "Password must contain at least one special character";
                      return undefined;
                    },
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
                        placeholder="Create a strong password"
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

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Password strength
                      </span>
                      <span className={`font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Strength Bar */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.bgColor
                              : "bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Password Requirements */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <PasswordRequirement met={passwordStrength.checks.length}>
                        At least 8 characters
                      </PasswordRequirement>
                      <PasswordRequirement
                        met={passwordStrength.checks.lowercase}
                      >
                        One lowercase letter
                      </PasswordRequirement>
                      <PasswordRequirement
                        met={passwordStrength.checks.uppercase}
                      >
                        One uppercase letter
                      </PasswordRequirement>
                      <PasswordRequirement met={passwordStrength.checks.number}>
                        One number
                      </PasswordRequirement>
                      <PasswordRequirement
                        met={passwordStrength.checks.special}
                      >
                        One special character (!@#$%^&*)
                      </PasswordRequirement>
                    </div>
                  </div>
                )}
              </div>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return "Please confirm your password";
                    const password = fieldApi.form.getFieldValue("password");
                    if (value !== password) return "Passwords do not match";
                    return undefined;
                  },
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
                      placeholder="Confirm your password"
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

              <form.Field name="businessUnit">
                {(field) => (
                  <div>
                    <Select
                      value={field.state.value || ""}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        className={
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select Business Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(businessUnits) &&
                        businessUnits.length > 0 ? (
                          businessUnits.map((bu) => (
                            <SelectItem key={bu.id} value={bu.id.toString()}>
                              {bu.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No business units available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="techStack">
                {(field) => (
                  <div>
                    <Input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., React, Node.js, TypeScript (comma-separated)"
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
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Separate multiple technologies with commas
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="companyRole">
                {(field) => (
                  <div>
                    <Input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Developer, Designer, Product Owner (comma-separated)"
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
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Separate multiple roles with commas
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="hobbies">
                {(field) => (
                  <div>
                    <Input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Reading, Gaming, Hiking (comma-separated)"
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
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Separate multiple hobbies with commas
                    </p>
                  </div>
                )}
              </form.Field>

              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={signupMutation.isPending || !form.state.canSubmit}
              >
                {signupMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogleClick}
              className="mb-6"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
