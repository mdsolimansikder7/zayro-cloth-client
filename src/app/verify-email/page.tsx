"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

const EMPTY_CODE = ["", "", "", "", "", ""];

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const requestedReturnTo = params.get("returnTo") || "/";
  const returnTo = requestedReturnTo.startsWith("/") ? requestedReturnTo : "/";
  const [code, setCode] = useState(EMPTY_CODE);
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !code[index] && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!pasted.length) return;
    setCode(EMPTY_CODE.map((_item, index) => pasted[index] || ""));
    inputs.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const otp = code.join("");
    if (!email || otp.length !== 6) {
      setError("Enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    const result = await authClient.verifyEmailOtp({ email, otp });
    if (result.error) {
      setError(result.error.message);
    } else {
      toast.add({ title: "Email verified", description: "Your Zayro account is ready.", type: "success" });
      window.location.assign(returnTo);
    }
    setLoading(false);
  }

  async function resendCode() {
    if (cooldown > 0 || !email) return;
    setError("");
    setResending(true);
    const result = await authClient.sendEmailOtp({ email });
    if (result.error) {
      setError(result.error.message);
    } else {
      setCooldown(60);
      setCode(EMPTY_CODE);
      inputs.current[0]?.focus();
      toast.add({ title: "New code sent", description: "Check your inbox for the latest code.", type: "success" });
    }
    setResending(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950">
      <section className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-400">Zayro security</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Verify your email</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-zinc-400">
            We sent a 6-digit code to <strong className="text-gray-800 dark:text-zinc-200">{email || "your email"}</strong>. It expires in 5 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</div>}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputs.current[index] = element; }}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                inputMode="numeric"
                maxLength={1}
                autoFocus={index === 0}
                aria-label={`Verification digit ${index + 1}`}
                className="size-11 rounded-xl border border-gray-300 bg-white text-center text-xl font-bold outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-white dark:focus:ring-white"
              />
            ))}
          </div>
          <button type="submit" disabled={loading || !email} className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80">
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="space-y-3 text-center text-sm text-gray-500 dark:text-zinc-400">
          <button type="button" onClick={() => void resendCode()} disabled={cooldown > 0 || resending || !email} className="font-semibold text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-white">
            {resending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <p>
            Wrong email?{" "}
            <Link href="/sign-in" className="font-semibold text-gray-900 hover:underline dark:text-white">Change email</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyEmailContent /></Suspense>;
}
