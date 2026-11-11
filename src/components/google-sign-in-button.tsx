"use client";

import { useEffect, useRef } from "react";

type GoogleCredentialResponse = { credential: string };
type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not load."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleSignInButton({
  onCredential,
  onError,
}: {
  onCredential: (credential: string) => void;
  onError: (error: Error) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void loadGoogleScript()
      .then(() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const googleId = window.google?.accounts?.id;
        if (!clientId || !googleId || !containerRef.current || cancelled) {
          throw new Error("Google sign-in is not configured.");
        }

        googleId.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        containerRef.current.replaceChildren();
        googleId.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 360,
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) onError(error instanceof Error ? error : new Error("Google sign-in failed."));
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError]);

  return <div ref={containerRef} className="flex min-h-10 justify-center" />;
}
