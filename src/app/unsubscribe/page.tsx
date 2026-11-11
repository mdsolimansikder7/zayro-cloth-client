"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/store-api";

function UnsubscribeContent() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState(() => ({
    message: token ? "Updating your subscription…" : "This unsubscribe link is missing its token.",
    error: !token,
  }));

  useEffect(() => {
    if (!token) {
      return;
    }
    void apiFetch("newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((result) => setState({
        message: (result as { message?: string }).message || "You have been unsubscribed.",
        error: false,
      }))
      .catch((requestError: unknown) => {
        setState({
          error: true,
          message: requestError instanceof Error ? requestError.message : "This unsubscribe link is invalid.",
        });
      });
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Zayro newsletter</p>
        <h1 className="mt-4 font-heading text-4xl uppercase">{state.error ? "Link unavailable" : "All set"}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{state.message}</p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Return to Zayro
        </Link>
      </section>
    </main>
  );
}

export default function UnsubscribePage() {
  return <Suspense fallback={null}><UnsubscribeContent /></Suspense>;
}
