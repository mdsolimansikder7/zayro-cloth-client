"use client";

import { AuthSessionProvider } from "@/lib/auth-client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
