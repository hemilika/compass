import { useState } from "react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "../components/ui/Input";
import { Button } from "@/components/ui/button";

import { useNavigate, Link } from "@tanstack/react-router";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    navigate({ to: "/" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />

              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />

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

              <Button type="submit" size="lg" className="bg-primary">
                Sign in
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
