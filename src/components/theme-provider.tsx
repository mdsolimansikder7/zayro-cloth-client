"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";
import { Toaster } from "@/components/ui/toast";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <Toaster>{children}</Toaster>
    </NextThemesProvider>
  );
}
