import { useState } from "react";

import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    navigate("/");
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
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                fullWidth
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                fullWidth
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
                <Link
                  to="/forgot-password"
                  className="text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth>
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
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
