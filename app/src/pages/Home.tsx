import { useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent } from "../components/ui/Card";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          React{" "}
          <span className="bg-linear-to-r from-zinc-600 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            Boilerplate
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          A beautiful, modern starter template built with React, TypeScript,
          Tailwind CSS, and Redux Toolkit. Features authentication, theme
          switching, and responsive design.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate({ to: "/signup" })}
            variant="default"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate({ to: "/login" })}
            variant="outline"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 py-12">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Lightning Fast
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 dark:text-zinc-400">
              Built with Vite for instant hot reload and optimized builds.
              Experience blazing fast development.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Beautiful Design
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 dark:text-zinc-400">
              Modern UI components with Tailwind CSS, featuring light/dark
              themes and responsive design.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Type Safe
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 dark:text-zinc-400">
              Full TypeScript support with strict type checking for better
              development experience and fewer bugs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack */}
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Built with Modern Technologies
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Redux Toolkit",
            "React Router",
            "Vite",
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
