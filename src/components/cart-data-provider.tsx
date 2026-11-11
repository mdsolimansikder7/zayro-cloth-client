"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { apiFetch, type CartData } from "@/lib/store-api";

type ShippingAddress = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

type CartContextValue = {
  cart: CartData | null;
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addItem: (item: { productSlug: string; size: string; color: string; quantity: number }) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<void>;
  createOrder: (shippingAddress: ShippingAddress) => Promise<{ id: string }>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartDataProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!session?.user) {
      setCart(null);
      setError("");
      return;
    }
    setIsLoading(true);
    try {
      const result = (await apiFetch("cart")) as { cart: CartData };
      setCart(result.cart);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load cart.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (isPending) return;
    const frame = requestAnimationFrame(() => void refresh());
    window.addEventListener("focus", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("focus", refresh);
    };
  }, [isPending, refresh]);

  const addItem = useCallback<CartContextValue["addItem"]>(async (item) => {
    const result = (await apiFetch("cart/items", {
      method: "POST",
      body: JSON.stringify(item),
    })) as { cart: CartData };
    setCart(result.cart);
    setError("");
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(async (itemId, quantity) => {
    const result = (await apiFetch(`cart/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    })) as { cart: CartData };
    setCart(result.cart);
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>(async (itemId) => {
    const result = (await apiFetch(`cart/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    })) as { cart: CartData };
    setCart(result.cart);
  }, []);

  const applyPromo = useCallback<CartContextValue["applyPromo"]>(async (code) => {
    const result = (await apiFetch("cart/promo", {
      method: "POST",
      body: JSON.stringify({ code }),
    })) as { cart: CartData };
    setCart(result.cart);
  }, []);

  const createOrder = useCallback<CartContextValue["createOrder"]>(async (shippingAddress) => {
    const result = (await apiFetch("orders", {
      method: "POST",
      body: JSON.stringify({ shippingAddress }),
    })) as { order: { id: string; _id?: string } };
    await refresh();
    window.dispatchEvent(new Event("zayro:order-created"));
    return { id: result.order.id || result.order._id || "" };
  }, [refresh]);

  const value = useMemo(
    () => ({ cart, isLoading, error, refresh, addItem, setQuantity, removeItem, applyPromo, createOrder }),
    [cart, isLoading, error, refresh, addItem, setQuantity, removeItem, applyPromo, createOrder],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartData() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCartData must be used within CartDataProvider.");
  return value;
}
