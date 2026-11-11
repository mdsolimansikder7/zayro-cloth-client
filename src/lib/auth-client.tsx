"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, StoreApiError } from "@/lib/store-api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "customer" | "admin";
  emailVerified: boolean;
};

export type AuthSession = { user: AuthUser } | null;
type SessionState = { data: AuthSession; isPending: boolean };
type ApiResult<T> = {
  data?: T;
  error?: { message: string; status?: number; verificationRequired?: boolean; email?: string };
};

const TOKEN_KEY = "zayro-auth-token";
const SESSION_EVENT = "zayro:session-change";
const SessionContext = createContext<SessionState>({ data: null, isPending: true });

export function getAuthToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AuthSession>(null);
  const [isPending, setIsPending] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setData(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    try {
      const result = (await apiFetch("auth/me")) as { user: AuthUser };
      setData({ user: result.user });
    } catch (error) {
      if (error instanceof StoreApiError && (error.status === 401 || error.status === 403)) {
        setAuthToken(null);
        setData(null);
      }
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    window.addEventListener(SESSION_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(SESSION_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const value = useMemo(() => ({ data, isPending }), [data, isPending]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<ApiResult<{ user?: AuthUser; token?: string; verificationRequired?: boolean; email?: string }>> {
  try {
    const result = (await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    })) as { user: AuthUser; token: string };
    if (result.token) setAuthToken(result.token);
    return { data: result };
  } catch (error) {
    if (error instanceof StoreApiError) {
      const details = error.details;
      const verificationRequired =
        typeof details === "object" &&
        details !== null &&
        "verificationRequired" in details &&
        details.verificationRequired === true;
      const email =
        typeof details === "object" &&
        details !== null &&
        "email" in details &&
        typeof details.email === "string"
          ? details.email
          : undefined;
      return {
        error: {
          message: error.message,
          status: error.status,
          verificationRequired,
          email,
        },
      };
    }
    return { error: { message: error instanceof Error ? error.message : "Authentication failed." } };
  }
}

export const signIn = {
  email: ({ email, password }: { email: string; password: string }) =>
    postAuth("auth/login", { email, password }),
  google: ({ credential }: { credential: string }) => postAuth("auth/google", { credential }),
};

export const authClient = {
  signUp: {
    email: ({ name, email, password }: { name: string; email: string; password: string }) =>
      postAuth("auth/register", { name, email, password }),
  },
  sendEmailOtp: async ({ email }: { email: string }) => {
    try {
      await apiFetch("auth/send-email-otp", { method: "POST", body: JSON.stringify({ email }) });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : "Could not send a verification code." } };
    }
  },
  verifyEmailOtp: async ({ email, otp }: { email: string; otp: string }) => {
    try {
      const result = await apiFetch("auth/verify-email-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }) as { user: AuthUser; token: string };
      setAuthToken(result.token);
      return { data: result };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : "Could not verify your email." } };
    }
  },
  signIn: {
    google: ({ credential }: { credential: string }) => postAuth("auth/google", { credential }),
  },
  updateUser: async ({ name }: { name: string }) => {
    try {
      await apiFetch("auth/me", { method: "PATCH", body: JSON.stringify({ name }) });
      window.dispatchEvent(new Event(SESSION_EVENT));
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : "Could not update profile." } };
    }
  },
  uploadAvatar: async (file: File) => {
    try {
      const body = new FormData();
      body.append("avatar", file);
      const result = (await apiFetch("account/avatar", { method: "POST", body })) as { user: { image: string } };
      window.dispatchEvent(new Event(SESSION_EVENT));
      return { data: result };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : "Could not upload profile picture." } };
    }
  },
  changePassword: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await apiFetch("auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return {};
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : "Could not update password." } };
    }
  },
};

export async function signOut() {
  setAuthToken(null);
}
