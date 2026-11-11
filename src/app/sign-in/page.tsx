// src/app/sign-in/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function SignInPage() {
  const { data: session, isPending } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) window.location.replace("/");
  }, [isPending, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const { error: signInError } = await signIn.email({
        email: data.get("email") as string,
        password: data.get("password") as string,
      });
      if (signInError) {
        if (signInError.verificationRequired && signInError.email) {
          window.location.assign(`/verify-email?email=${encodeURIComponent(signInError.email)}&returnTo=/`);
          return;
        }
        setError("Invalid email or password.");
        toast.add({
          title: "Sign in failed",
          description: "Check your email and password, then try again.",
          type: "error",
        });
        return;
      }

      window.location.replace("/");
    } catch {
      setError("Invalid email or password.");
      toast.add({
        title: "Sign in failed",
        description: "Check your email and password, then try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError("");
    setGoogleLoading(true);
    const { error: googleError } = await signIn.google({ credential });
    if (googleError) {
      setError("Google sign-in could not be completed.");
      toast.add({
        title: "Google sign-in failed",
        description: googleError.message,
        type: "error",
      });
    } else {
      window.location.replace("/");
    }
    setGoogleLoading(false);
  };

  const handleGoogleError = (googleError: Error) => {
    setError(googleError.message);
  };

  if (isPending || session?.user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950">
        <AnnouncementBar />
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black dark:border-zinc-700 dark:border-t-white" />
        </main>
        <SiteFooter showNewsletter={false} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-950 transition-colors">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-md dark:bg-zinc-900 dark:shadow-zinc-800/50">

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Sign in to Zayro
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Email / Password form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-4 py-3 text-sm shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-4 py-3 text-sm shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black dark:bg-white dark:text-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/80 dark:hover:bg-white/80 disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
            <span className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
          </div>
          <div className={googleLoading ? "pointer-events-none opacity-50" : ""}>
            <GoogleSignInButton onCredential={handleGoogleCredential} onError={handleGoogleError} />
          </div>
        </div>

        {/* Sign up link — একদম নিচে */}
        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-black dark:text-white hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </main>
      <SiteFooter showNewsletter={false} />
    </div>
  );
}
