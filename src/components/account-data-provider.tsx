"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/store-api";

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AccountData = {
  addresses: Address[];
  wishlistSlugs: string[];
};

type AccountDataContextValue = AccountData & {
  isLoading: boolean;
  error: string;
  saveAddresses: (addresses: Address[]) => Promise<void>;
  saveWishlist: (wishlistSlugs: string[]) => Promise<void>;
};

const AccountDataContext = createContext<AccountDataContextValue | null>(null);

export function AccountDataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const [data, setData] = useState<AccountData>({ addresses: [], wishlistSlugs: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!userId) {
      setData({ addresses: [], wishlistSlugs: [] });
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const result = (await apiFetch("account")) as AccountData;
      setData({
        addresses: result.addresses,
        wishlistSlugs: result.wishlistSlugs,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load account data.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isPending) return;
    const frame = requestAnimationFrame(() => void refresh());
    window.addEventListener("focus", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("focus", refresh);
    };
  }, [isPending, refresh]);

  const save = useCallback(async (updates: Partial<AccountData>) => {
    setError("");
    const result = (await apiFetch("account", {
      method: "PATCH",
      body: JSON.stringify(updates),
    })) as AccountData;
    setData({
      addresses: result.addresses,
      wishlistSlugs: result.wishlistSlugs,
    });
  }, []);

  const saveAddresses = useCallback(
    (addresses: Address[]) => save({ addresses }),
    [save],
  );
  const saveWishlist = useCallback(
    (wishlistSlugs: string[]) => save({ wishlistSlugs }),
    [save],
  );

  const value = useMemo(
    () => ({ ...data, isLoading: isLoading || isPending, error, saveAddresses, saveWishlist }),
    [data, error, isLoading, isPending, saveAddresses, saveWishlist],
  );

  return <AccountDataContext.Provider value={value}>{children}</AccountDataContext.Provider>;
}

export function useAccountData() {
  const value = useContext(AccountDataContext);
  if (!value) throw new Error("useAccountData must be used within AccountDataProvider.");
  return value;
}
