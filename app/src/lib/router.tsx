import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import ErrorBoundary from "@/components/ErrorBoundary";
import Shell from "@/components/Shell";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Shell>
        <Outlet />
      </Shell>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </ErrorBoundary>
  ),
});

const homepageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Signup route
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  homepageRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
