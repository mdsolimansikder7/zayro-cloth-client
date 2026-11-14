"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-[#f0eeed] font-sans text-[#09090b] dark:bg-[#09090b] dark:text-[#fafafa]">
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <section className="w-full max-w-xl text-center">
            <a href="/" className="text-3xl font-black tracking-tight sm:text-4xl">ZAYRO</a>
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] opacity-60">Something went wrong</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl">We&apos;ll get you back on track</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 opacity-70 sm:text-base">We couldn&apos;t load the store right now. Please try again or return home.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={reset} className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-black">Try again</button>
              <a href="/" className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-semibold transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10">Back to home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
