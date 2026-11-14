import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="w-full max-w-xl text-center">
        <Link href="/" className="font-heading text-3xl tracking-tight sm:text-4xl">ZAYRO</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-heading text-4xl uppercase tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">The page you&apos;re looking for has moved, changed, or doesn&apos;t exist.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-85">Back to home</Link>
          <Link href="/category/casual" className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted">Keep shopping</Link>
        </div>
      </section>
    </main>
  );
}
