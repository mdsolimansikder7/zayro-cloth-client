"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="w-full max-w-xl text-center">
        <Link href="/" className="font-heading text-3xl tracking-tight sm:text-4xl">ZAYRO</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Something went wrong</p>
        <h1 className="mt-3 font-heading text-4xl uppercase tracking-tight sm:text-5xl">Let&apos;s try that again</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">We couldn&apos;t load this page right now. Please try again or return to the shop.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-85">Try again</button>
          <Link href="/" className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
