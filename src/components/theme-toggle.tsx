"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  if (!mounted) return <div className="size-5" />;

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
      className="hover:opacity-70 transition-opacity"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}