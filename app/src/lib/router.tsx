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
import PostDetailPage from "@/pages/PostDetail";
import ProfilePage from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import ThreadDetailPage from "@/pages/ThreadDetail";
import PopularPage from "@/pages/Popular";
import AllPage from "@/pages/All";
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

// Post detail route
const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  component: PostDetailPage,
});

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Thread detail route
const threadDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/threads/$threadId",
  component: ThreadDetailPage,
});

// Popular route
const popularRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/popular",
  component: PopularPage,
});

// All route
const allRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/all",
  component: AllPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  homepageRoute,
  postDetailRoute,
  profileRoute,
  settingsRoute,
  threadDetailRoute,
  popularRoute,
  allRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
