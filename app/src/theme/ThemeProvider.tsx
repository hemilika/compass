import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
const THEME_STORAGE = "app-theme-mode";

const ThemeContext = createContext<
  | {
      mode: ThemeMode;
      setMode: (mode: ThemeMode) => void;
    }
  | undefined
>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE) as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      setModeState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE, mode);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = mode === "dark" || (mode === "system" && prefersDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [mode]);

  const setMode = (m: ThemeMode) => setModeState(m);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
