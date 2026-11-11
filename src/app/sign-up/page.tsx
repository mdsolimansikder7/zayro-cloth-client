// src/app/sign-up/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) router.replace("/profile");
  }, [isPending, router, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const { data: signUpData, error: signUpError } = await authClient.signUp.email({
        name: data.get("name") as string,
        email: data.get("email") as string,
        password: data.get("password") as string,
      });
      if (signUpError) {
        if (signUpError.verificationRequired && signUpError.email) {
          router.push(`/verify-email?email=${encodeURIComponent(signUpError.email)}&returnTo=/profile`);
          return;
        }
        setError("Could not create account. Try another email or try again.");
        toast.add({
          title: "Sign up failed",
          description: "Could not create your account. Please try again.",
          type: "error",
        });
        return;
      }

      if (signUpData?.verificationRequired && signUpData.email) {
        toast.add({
          title: "Check your email",
          description: "Enter the verification code we sent to your email.",
          type: "success",
        });
        router.push(`/verify-email?email=${encodeURIComponent(signUpData.email)}&returnTo=/profile`);
      } else {
        router.push("/profile");
      }
    } catch {
      setError("Could not create account. Try again.");
      toast.add({
        title: "Sign up failed",
        description: "Could not create your account. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError("");
    setGoogleLoading(true);
    const { error: googleError } = await authClient.signIn.google({ credential });
    if (googleError) {
      setError("Google sign-up could not be completed.");
      toast.add({
        title: "Google sign-up failed",
        description: googleError.message,
        type: "error",
      });
    } else {
      toast.add({
        title: "Account created",
        description: "Welcome to Zayro. Your account is ready.",
        type: "success",
      });
      router.push("/profile");
    }
    setGoogleLoading(false);
  };

  const handleGoogleError = (googleError: Error) => {
    setError(googleError.message);
  };

  if (isPending || session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-black dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12 transition-colors">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-md dark:shadow-zinc-800/50 transition-colors">

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Join Zayro and find clothes that match your style.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="block w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-4 py-3 text-sm shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="block w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-4 py-3 text-sm shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black dark:bg-white dark:text-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/80 dark:hover:bg-white/80 disabled:opacity-50 transition"
          >
            {loading ? "Creating account..." : "Create account"}
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

        {/* Sign in link — একদম নিচে */}
        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-black dark:text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
