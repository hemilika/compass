import { Store } from "@tanstack/store";

export type ThemeMode = "light" | "dark" | "system";

export interface AppState {
  theme: {
    mode: ThemeMode;
  };
}

const THEME_STORAGE_KEY = "app-theme-mode";

// Get initial theme from localStorage or default to system
const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "system";

  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
};

// Apply theme to document
const applyTheme = (mode: ThemeMode) => {
  if (typeof window === "undefined") return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const initialState: AppState = {
  theme: {
    mode: getInitialTheme(),
  },
};

// Apply initial theme
applyTheme(initialState.theme.mode);

export const store = new Store<AppState>(initialState);

// Subscribe to theme changes and apply them
store.subscribe(() => {
  const state = store.state;
  applyTheme(state.theme.mode);
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, state.theme.mode);
  }
});

// Theme actions
export const setThemeMode = (mode: ThemeMode) => {
  store.setState((prev) => ({
    ...prev,
    theme: {
      ...prev.theme,
      mode,
    },
  }));
};

// Selectors
export const selectThemeMode = (state: AppState) => state.theme.mode;

export const selectIsDarkMode = (state: AppState) => {
  const mode = state.theme.mode;
  if (mode === "system") {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return mode === "dark";
};
