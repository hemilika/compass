import { useState, useMemo } from "react";

import { useNavigate, Link } from "react-router-dom";

import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import type { SignUpFormData, SignUpFormErrors } from "../types/types/SignUp";

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

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo((): PasswordStrength => {
    const password = formData.password;

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
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
  }, [formData.password]);

  const validateForm = (): boolean => {
    const newErrors: SignUpFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to login after successful signup
    navigate("/login", {
      replace: true,
      state: { message: "Account created successfully! Please sign in." },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof SignUpFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  error={errors.firstName}
                  required
                  fullWidth
                />

                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  error={errors.lastName}
                  required
                  fullWidth
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
                error={errors.email}
                required
                fullWidth
              />

              <div className="space-y-3">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  error={errors.password}
                  required
                  fullWidth
                />

                {/* Password Strength Indicator */}
                {formData.password && (
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
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.checks.length
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-zinc-100 dark:bg-zinc-800"
                          }`}
                        >
                          {passwordStrength.checks.length ? (
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
                            passwordStrength.checks.length
                              ? "text-green-600 dark:text-green-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          At least 8 characters
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.checks.lowercase
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-zinc-100 dark:bg-zinc-800"
                          }`}
                        >
                          {passwordStrength.checks.lowercase ? (
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
                            passwordStrength.checks.lowercase
                              ? "text-green-600 dark:text-green-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          One lowercase letter
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.checks.uppercase
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-zinc-100 dark:bg-zinc-800"
                          }`}
                        >
                          {passwordStrength.checks.uppercase ? (
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
                            passwordStrength.checks.uppercase
                              ? "text-green-600 dark:text-green-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          One uppercase letter
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.checks.number
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-zinc-100 dark:bg-zinc-800"
                          }`}
                        >
                          {passwordStrength.checks.number ? (
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
                            passwordStrength.checks.number
                              ? "text-green-600 dark:text-green-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          One number
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passwordStrength.checks.special
                              ? "bg-green-100 dark:bg-green-900"
                              : "bg-zinc-100 dark:bg-zinc-800"
                          }`}
                        >
                          {passwordStrength.checks.special ? (
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
                            passwordStrength.checks.special
                              ? "text-green-600 dark:text-green-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }
                        >
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
                fullWidth
              />

              <div className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Create account
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
              fullWidth
              onClick={() => {
                // TODO: Implement Google OAuth
                console.log("Google login clicked");
              }}
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
