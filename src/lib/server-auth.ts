import "server-only";

import { cookies } from "next/headers";

const API_BASE_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export type ServerAuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "customer" | "admin";
  emailVerified: boolean;
};

export async function getServerSession() {
  const token = (await cookies()).get("zayro-session")?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { user?: ServerAuthUser };
    return body.user ? { user: body.user, token } : null;
  } catch {
    // An unavailable auth API is not a valid session. Avoid exposing an API error
    // from a protected route.
    return null;
  }
}

export { API_BASE_URL };
