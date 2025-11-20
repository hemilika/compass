import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/providers/theme/theme-provider";
import { AuthProvider } from "@/providers/auth/auth-provider";
import { queryClient } from "./lib/queryClient";
import { router } from "./lib/router";

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
