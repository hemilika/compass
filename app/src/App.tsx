import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "./lib/queryClient";
import { router } from "./lib/router";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
