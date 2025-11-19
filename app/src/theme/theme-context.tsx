import { createContext } from "react";

export type ThemeMode = "light" | "dark" | "system";
export const THEME_STORAGE = "app-theme-mode";

export const ThemeContext = createContext<
  | {
      mode: ThemeMode;
      setMode: (mode: ThemeMode) => void;
    }
  | undefined
>(undefined);
