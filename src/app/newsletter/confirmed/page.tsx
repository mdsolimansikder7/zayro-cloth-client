"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmedContent() {
  const invalid = useSearchParams().get("status") === "invalid";
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Zayro newsletter</p>
        <h1 className="mt-4 font-heading text-4xl uppercase">{invalid ? "Link unavailable" : "You’re confirmed"}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {invalid
            ? "This confirmation link is invalid or has already been used."
            : "Welcome to the Zayro edit. Watch your inbox for new drops and subscriber-only offers."}
        </p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}

export default function NewsletterConfirmedPage() {
  return <Suspense fallback={null}><ConfirmedContent /></Suspense>;
}
