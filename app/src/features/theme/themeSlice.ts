import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
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

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

// Apply initial theme
applyTheme(initialState.mode);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      }

      // Apply theme to document
      applyTheme(action.payload);
    },
    initializeTheme: (state) => {
      // Re-apply current theme (useful for hydration)
      applyTheme(state.mode);
    },
  },
});

export const { setThemeMode, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;

// Selectors
export const selectThemeMode = (state: { theme: ThemeState }) =>
  state.theme.mode;
export const selectIsDarkMode = (state: { theme: ThemeState }) => {
  const mode = state.theme.mode;
  if (mode === "system") {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return mode === "dark";
};
