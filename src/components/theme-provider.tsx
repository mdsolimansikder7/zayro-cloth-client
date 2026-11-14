"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children, defaultTheme = "system" }: { children: ReactNode; defaultTheme?: Theme }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored) setThemeState(stored);
    } catch {}
  }, []);

  const applyTheme = useCallback((next: "light" | "dark") => {
    setResolvedTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let resolved: "light" | "dark";
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolved = theme;
    }
    applyTheme(resolved);
  }, [theme, mounted, applyTheme]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = mq.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted, applyTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
      document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    if (nextTheme === "system") {
      const resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } else {
      setResolvedTheme(nextTheme);
      applyTheme(nextTheme);
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
