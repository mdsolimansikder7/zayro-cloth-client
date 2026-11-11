"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStorefront, type Storefront } from "@/lib/store-api";

type StorefrontContextValue = {
  storefront: Storefront | null;
  isLoading: boolean;
  error: string;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setStorefront(await getStorefront());
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load storefront content.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(frame);
  }, [load]);

  const value = useMemo(() => ({ storefront, isLoading, error }), [storefront, isLoading, error]);
  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error("useStorefront must be used within StorefrontProvider.");
  return value;
}
