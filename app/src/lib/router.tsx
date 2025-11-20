import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import PostDetailPage from "@/pages/PostDetail";
import ProfilePage from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import ThreadDetailPage from "@/pages/ThreadDetail";
import PopularPage from "@/pages/Popular";
import AllPage from "@/pages/All";
import FollowingPage from "@/pages/Following";
import ErrorBoundary from "@/components/ErrorBoundary";
import Shell from "@/components/Shell";
import { WithSidebars } from "@/components/layouts/WithSidebars";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Shell>
        <Outlet />
      </Shell>
      {/* {import.meta.env.DEV && <TanStackRouterDevtools initialIsOpen={false} />} */}
    </ErrorBoundary>
  ),
});

// Layout route with sidebars for routes that need them
const withSidebarsRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "with-sidebars",
  component: WithSidebars,
});

// Routes without sidebars (direct children of root)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// Routes with sidebars (children of withSidebarsRoute)
const homepageRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/",
  component: HomePage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/posts/$postId",
  component: PostDetailPage,
});

const threadDetailRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/hives/$hiveid",
  component: ThreadDetailPage,
});

const popularRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/popular",
  component: PopularPage,
});

const allRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/all",
  component: AllPage,
});

const followingRoute = createRoute({
  getParentRoute: () => withSidebarsRoute,
  path: "/following",
  component: FollowingPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  profileRoute,
  settingsRoute,
  withSidebarsRoute.addChildren([
    homepageRoute,
    postDetailRoute,
    threadDetailRoute,
    popularRoute,
    allRoute,
    followingRoute,
  ]),
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
