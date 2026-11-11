"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartData } from "@/components/cart-data-provider";
import { useAccountData } from "@/components/account-data-provider";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format-money";

export default function Cart() {
  const { cart, isLoading, error, setQuantity, removeItem, applyPromo, createOrder } = useCartData();
  const { addresses } = useAccountData();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  async function handlePromo() {
    setPromoError("");
    try {
      await applyPromo(promoCode);
      toast.add({ title: "Promo applied", type: "success" });
    } catch (requestError) {
      setPromoError(requestError instanceof Error ? requestError.message : "Could not apply promo code.");
    }
  }

  async function handleQuantity(itemId: string, quantity: number) {
    try {
      await setQuantity(itemId, quantity);
    } catch (requestError) {
      toast.add({
        title: "Could not update quantity",
        description: requestError instanceof Error ? requestError.message : "Please try again.",
        type: "error",
      });
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setPromoError("");
    const formData = new FormData(event.currentTarget);
    try {
      const order = await createOrder({
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        addressLine1: String(formData.get("addressLine1") ?? "").trim(),
        addressLine2: String(formData.get("addressLine2") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        postalCode: String(formData.get("postalCode") ?? "").trim(),
        country: String(formData.get("country") ?? "").trim(),
      });
      setOrderId(order.id);
      setShowCheckout(false);
    } catch (requestError) {
      setPromoError(requestError instanceof Error ? requestError.message : "Could not place your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPending || isLoading) {
    return <p className="mt-6 rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">Loading your cart…</p>;
  }

  if (!session?.user) {
    return (
      <div className="mt-6 rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Sign in to view and manage your saved cart.</p>
        <Link href="/sign-in" className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="mt-6 rounded-2xl border border-border p-8 text-center">
        <h2 className="text-xl font-semibold">Order placed</h2>
        <p className="mt-2 text-sm text-muted-foreground">Order #{orderId.slice(-8).toUpperCase()} was saved. Payment is cash on delivery.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push("/profile")} className="rounded-full">View my orders</Button>
          <Button variant="outline" onClick={() => router.push("/category/casual")} className="rounded-full">Continue shopping</Button>
        </div>
      </div>
    );
  }

  if (!cart) {
    return <p role="alert" className="mt-6 rounded-2xl border border-destructive/30 p-6 text-center text-sm text-destructive">{error || "Could not load your cart."}</p>;
  }

  return (
    <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-[20px] border border-border px-4 lg:px-6">
        {error && <p role="alert" className="py-4 text-sm text-destructive">{error}</p>}
        {cart.items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Your cart is empty.{" "}
            <Link href="/category/casual" className="underline">Continue shopping</Link>
          </p>
        )}

        {cart.items.map((item) => (
          <div key={item._id} className="flex gap-3 border-b border-border py-5 last:border-b-0 sm:gap-4">
            <Link href={`/product/${item.product.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
              <Image src={item.product.image} alt={item.product.title} fill sizes="100px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/product/${item.product.slug}`} className="text-sm font-semibold hover:underline sm:text-base">{item.product.title}</Link>
                  <p className="mt-1 text-xs text-muted-foreground">Size: {item.size}</p>
                  <p className="text-xs text-muted-foreground">Color: {item.color}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.product.title}`}
                  onClick={() => void removeItem(item._id).catch((requestError: unknown) => toast.add({ title: "Could not remove item", description: requestError instanceof Error ? requestError.message : "Please try again.", type: "error" }))}
                  className="text-destructive hover:opacity-70"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                <span className="text-lg font-bold sm:text-xl">{formatMoney(item.product.price * item.quantity)}</span>
                <div className="flex h-9 items-center gap-3 rounded-full bg-muted px-3">
                  <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => void handleQuantity(item._id, item.quantity - 1)} className="text-muted-foreground hover:text-foreground disabled:opacity-40"><Minus className="size-4" /></button>
                  <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                  <button type="button" aria-label="Increase quantity" disabled={item.quantity >= 99} onClick={() => void handleQuantity(item._id, item.quantity + 1)} className="text-muted-foreground hover:text-foreground disabled:opacity-40"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-border p-5 lg:p-6">
        <h2 className="text-lg font-bold lg:text-2xl">Order Summary</h2>
        <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4 text-sm">
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">{formatMoney(cart.subtotal)}</span></div>
          {cart.discountAmount > 0 && <div className="flex items-center justify-between"><span className="text-muted-foreground">First order discount (-20%)</span><span className="font-bold text-destructive">-{formatMoney(cart.discountAmount)}</span></div>}
          {cart.promoDiscount > 0 && <div className="flex items-center justify-between"><span className="text-muted-foreground">Promo ({cart.promoCode})</span><span className="font-bold text-destructive">-{formatMoney(cart.promoDiscount)}</span></div>}
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className="font-bold">{formatMoney(cart.deliveryFee)}</span></div>
        </div>
        <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Total</span><span className="text-xl font-bold">{formatMoney(cart.total)}</span></div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder={cart.promoCode || "Add promo code"} className="h-11 rounded-full border-transparent bg-muted pl-10 text-sm" />
          </div>
          <Button type="button" onClick={() => void handlePromo()} disabled={!promoCode.trim() || cart.items.length === 0} className="h-11 rounded-full px-6">Apply</Button>
        </div>
        {promoError && <p role="alert" className="mt-2 text-xs text-destructive">{promoError}</p>}

        {!showCheckout ? (
          <Button onClick={() => setShowCheckout(true)} disabled={cart.items.length === 0} className="mt-3 h-12 w-full gap-2 rounded-full">
            Go to Checkout <ArrowRight className="size-4" />
          </Button>
        ) : (
          <form onSubmit={handleCheckout} className="mt-5 space-y-3">
            <h3 className="font-semibold">Delivery details</h3>
            {[
              ["name", "Full name", defaultAddress?.name || session.user.name],
              ["phone", "Phone number", defaultAddress?.phone || ""],
              ["addressLine1", "Address", defaultAddress?.addressLine1 || ""],
              ["addressLine2", "Apartment, suite (optional)", defaultAddress?.addressLine2 || ""],
              ["city", "City", defaultAddress?.city || ""],
              ["postalCode", "Postal code", defaultAddress?.postalCode || ""],
              ["country", "Country", "Bangladesh"],
            ].map(([name, label, value]) => (
              <label key={name} className="block space-y-1 text-xs font-medium">
                <span>{label}</span>
                <Input name={name} required={name !== "addressLine2"} value={name === "country" ? "Bangladesh" : undefined} defaultValue={name === "country" ? undefined : value} readOnly={name === "country"} maxLength={name === "addressLine1" ? 200 : 100} className="h-10 rounded-lg" />
              </label>
            ))}
            <p className="text-xs text-muted-foreground">Cash on delivery. Payment is collected when your order arrives.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCheckout(false)} className="flex-1 rounded-full">Back</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-full">{isSubmitting ? "Placing..." : "Place order"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
