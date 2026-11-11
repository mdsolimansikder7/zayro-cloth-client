"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/store-api";

type SubmissionState = "idle" | "success" | "error";
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await apiFetch("newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email, source: "footer", website: "" }),
      }) as { message?: string };

      setStatus("success");
      setMessage(result.message || "Check your inbox to confirm your subscription.");
      toast.add({
        title: "Check your inbox",
        description: result.message || "Confirm your subscription to join the Zayro edit.",
        type: "success",
      });
      setEmail("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again in a moment.";
      setStatus("error");
      setMessage(errorMessage);
      toast.add({
        title: "Couldn't subscribe",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="newsletter-title"
      className="relative isolate overflow-hidden rounded-[24px] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_70px_-38px_rgba(0,0,0,0.65)] sm:px-9 sm:py-10 lg:px-14 lg:py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-32 -z-10 size-80 rounded-full border border-primary-foreground/10 sm:-right-8 sm:-top-44 sm:size-[440px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-28 -z-10 size-64 rounded-full border border-primary-foreground/10 sm:-right-0 sm:-top-36 sm:size-[360px]"
      />

      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80 sm:text-xs">
            <Sparkles aria-hidden="true" className="size-3.5" />
            The Zayro edit
          </span>
          <h2
            id="newsletter-title"
            className="mt-5 max-w-[15ch] font-heading text-[30px] uppercase leading-[1.08] tracking-tight sm:text-4xl lg:text-[44px]"
          >
            A little style in your inbox.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/70 sm:text-base">
            Get first dibs on new drops, fresh fits, and subscriber-only offers.
          </p>
        </div>

        <div className="w-full lg:justify-self-end">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-2 rounded-[18px] bg-background p-2 sm:flex-row sm:items-center sm:rounded-full">
              <div className="relative min-w-0 flex-1">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  disabled={isSubmitting}
                  aria-invalid={status === "error"}
                  aria-describedby={message ? "newsletter-message" : undefined}
                  className="h-11 rounded-full border-0 bg-transparent pl-10 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 shrink-0 gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:bg-primary/90 active:scale-[0.98] sm:px-6"
              >
                {isSubmitting ? "Joining..." : "Subscribe"}
                {!isSubmitting && <ArrowRight aria-hidden="true" className="size-4" />}
              </Button>
            </div>
            <p
              id="newsletter-message"
              aria-live="polite"
              role={status === "error" ? "alert" : "status"}
              className={`min-h-5 px-1 text-xs leading-5 ${
                status === "error"
                  ? "text-destructive"
                  : status === "success"
                    ? "text-primary-foreground"
                    : "text-primary-foreground/60"
              }`}
            >
              {status === "success" && <Check aria-hidden="true" className="mr-1 inline size-3.5" />}
              {message || "No spam. Just good style. Unsubscribe whenever you like."}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
