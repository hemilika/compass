import React, { useEffect, useState } from "react";
import { ThemeMode, THEME_STORAGE, ThemeContext } from "./theme-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage immediately to prevent flash
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE) as ThemeMode | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    }
    return "system";
  });

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
