import { useStore } from "@tanstack/react-store";
import { store, setThemeMode } from "./store";
import type { AppState } from "./store";

// Hook to use the store
export const useAppStore = () => useStore(store);

// Hook to get theme mode
export const useThemeMode = () => {
  return useStore(store, (state) => state.theme.mode);
};

// Hook to check if dark mode is active
export const useIsDarkMode = () => {
  return useStore(store, (state) => {
    const mode = state.theme.mode;
    if (mode === "system") {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return mode === "dark";
  });
};

// Export store for direct access if needed
export { store, setThemeMode };
export type { AppState };
