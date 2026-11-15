import { NextResponse } from "next/server";
import { serverApiBase } from "@/lib/api-base";
import type { ServerAuthUser } from "@/lib/server-auth";

const SESSION_COOKIE = "zayro-session";
const sessionCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token || token.length > 4096) {
    return NextResponse.json({ error: "A valid session token is required." }, { status: 401 });
  }

  try {
    const authResponse = await fetch(`${serverApiBase()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!authResponse.ok) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const payload = (await authResponse.json()) as { user?: ServerAuthUser };
    if (!payload.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const response = NextResponse.json({ user: payload.user });
    response.cookies.set(SESSION_COOKIE, token, sessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Could not verify the session." }, { status: 503 });
  }
}

export function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookie, maxAge: 0 });
  return response;
}
