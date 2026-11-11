"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Check,
  Camera,
  CreditCard,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useAccountData, type Address } from "@/components/account-data-provider";
import AnnouncementBar from "@/components/announcement-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { toast } from "@/components/ui/toast";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/store-api";
import { formatMoney } from "@/lib/format-money";

const menuItems = [
  { key: "orders", icon: Package, label: "My Orders", desc: "View your order history" },
  { key: "wishlist", icon: Heart, label: "Wishlist", desc: "Items you saved for later" },
  { key: "addresses", icon: MapPin, label: "Addresses", desc: "Add and manage delivery addresses" },
  { key: "payments", icon: ShoppingBag, label: "Payment Methods", desc: "Secure payment information" },
  { key: "settings", icon: Settings, label: "Account Settings", desc: "Update your name or password" },
] as const;

type Section = (typeof menuItems)[number]["key"];
type AddressForm = Omit<Address, "id"> & { id?: string };
type OrderSummary = {
  id: string;
  _id?: string;
  status: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  promoDiscount: number;
  deliveryFee: number;
  promoCode?: string | null;
  paymentMethod?: string;
  createdAt: string;
  items: Array<{ title: string; slug: string; image: string; quantity: number; unitPrice: number; size?: string; color?: string }>;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

const orderStatuses = ["placed", "processing", "shipped", "delivered"] as const;

function orderStatusLabel(status: string) {
  return status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const emptyAddress: AddressForm = {
  label: "Home",
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "Bangladesh",
  isDefault: false,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const { addresses, wishlistSlugs, isLoading: isAccountLoading, error: accountError, saveAddresses, saveWishlist } = useAccountData();
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressForm | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [ordersError, setOrdersError] = useState("");
  const [nameDraft, setNameDraft] = useState<{ userId: string; value: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/sign-in");
  }, [session, isPending, router]);

  useEffect(() => {
    if (section !== "orders" || !session?.user) return;

    let active = true;
    const loadOrders = () => {
      void apiFetch("orders")
        .then((result) => {
          const orderList = (result as { orders: OrderSummary[] }).orders;
          if (active) setOrders(orderList.map((order) => ({ ...order, id: order.id || order._id || "" })));
        })
        .catch((error: unknown) => {
          if (active) setOrdersError(getErrorMessage(error, "Could not load orders."));
        });
    };
    loadOrders();
    window.addEventListener("focus", loadOrders);
    window.addEventListener("zayro:order-created", loadOrders);

    return () => {
      active = false;
      window.removeEventListener("focus", loadOrders);
      window.removeEventListener("zayro:order-created", loadOrders);
    };
  }, [section, session?.user]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  const user = session.user;
  const displayName = user.name?.trim() || user.email || "User";
  const name = nameDraft?.userId === user.id ? nameDraft.value : user.name ?? "";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addressDraft) return;
    setIsSavingAddress(true);

    const formData = new FormData(event.currentTarget);
    const existingAddress = addresses.find((address) => address.id === addressDraft.id);
    const isDefault =
      formData.get("isDefault") === "on" ||
      addresses.length === 0 ||
      Boolean(existingAddress?.isDefault && !addresses.some((address) => address.id !== existingAddress.id && address.isDefault));
    const nextAddress: Address = {
      id: addressDraft.id ?? crypto.randomUUID(),
      label: String(formData.get("label") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      addressLine1: String(formData.get("addressLine1") ?? "").trim(),
      addressLine2: String(formData.get("addressLine2") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim(),
      country: "Bangladesh",
      isDefault,
    };
    const nextAddresses = addresses
      .filter((address) => address.id !== nextAddress.id)
      .map((address) => ({ ...address, isDefault: isDefault ? false : address.isDefault }));
    nextAddresses.push(nextAddress);

    try {
      await saveAddresses(nextAddresses);
      setAddressDraft(null);
      toast.add({
        title: addressDraft.id ? "Address updated" : "Address added",
        description: "Your address has been saved to your account.",
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Could not save address",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function setDefaultAddress(addressId: string) {
    try {
      await saveAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === addressId })));
      toast.add({ title: "Default address updated", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not update address",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    }
  }

  async function deleteAddress(addressId: string) {
    if (!window.confirm("Delete this saved address?")) return;
    const remaining = addresses.filter((address) => address.id !== addressId);
    if (!remaining.some((address) => address.isDefault) && remaining[0]) {
      remaining[0].isDefault = true;
    }
    try {
      await saveAddresses(remaining);
      toast.add({ title: "Address deleted", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not delete address",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    }
  }

  async function saveProfileName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSettings(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) throw new Error(result.error.message ?? "Could not update your name.");
      toast.add({ title: "Profile updated", description: "Your name has been saved.", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not update profile",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSettings(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword });
      if (result.error) throw new Error(result.error.message ?? "Could not update your password.");
      setCurrentPassword("");
      setNewPassword("");
      toast.add({ title: "Password updated", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not update password",
        description: getErrorMessage(error, "Check your current password and try again."),
        type: "error",
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.replace("/");
    } catch {
      toast.add({ title: "Sign out failed", description: "Please try again.", type: "error" });
      setIsSigningOut(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.add({ title: "Invalid image", description: "Choose a JPG, PNG, WEBP or GIF image.", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: "Image is too large", description: "Profile pictures must be 5 MB or smaller.", type: "error" });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await authClient.uploadAvatar(file);
      if (result.error) throw new Error(result.error.message);
      toast.add({ title: "Profile picture updated", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not update profile picture",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function removeFromWishlist(slug: string) {
    try {
      await saveWishlist(wishlistSlugs.filter((savedSlug) => savedSlug !== slug));
      toast.add({ title: "Removed from wishlist", type: "success" });
    } catch (error) {
      toast.add({
        title: "Could not update wishlist",
        description: getErrorMessage(error, "Please try again."),
        type: "error",
      });
    }
  }

  function inputClassName() {
    return "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      <AnnouncementBar />
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-16 lg:py-12">
        <div className="mb-6 flex flex-col gap-1 sm:mb-8">
          <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">My Account</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, orders, saved addresses and wishlist.</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3 sm:mb-8 sm:gap-4">
          {[
            { label: "Orders", value: orders === null ? "—" : String(orders.length), section: "orders" as const },
            { label: "Wishlist", value: String(wishlistSlugs.length), section: "wishlist" as const },
            { label: "Addresses", value: String(addresses.length), section: "addresses" as const },
          ].map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => setSection(section === stat.section ? null : stat.section)}
              className={`rounded-2xl border p-3 text-center shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:flex sm:items-center sm:gap-4 sm:px-5 sm:py-4 sm:text-left ${
                section === stat.section
                  ? "border-foreground/30 bg-muted"
                  : "border-border bg-card hover:bg-muted/70"
              }`}
            >
              <span className="block text-xl font-bold sm:text-2xl">{stat.value}</span>
              <span className="mt-1 block text-[11px] leading-tight text-muted-foreground sm:mt-0 sm:text-sm">{stat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-8">
          <aside className="space-y-4">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Open admin dashboard
              </Link>
            )}
            <section className="flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="relative shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={`${displayName}'s avatar`}
                    width={72}
                    height={72}
                    className="size-16 rounded-full object-cover ring-2 ring-border sm:size-[72px]"
                  />
                ) : (
                  <div className="flex size-16 select-none items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground ring-2 ring-border sm:size-[72px]">
                    {initials}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow-sm transition-opacity hover:opacity-80"
                  title="Change profile picture"
                >
                  <Camera className="size-4" />
                  <span className="sr-only">Change profile picture</span>
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} className="sr-only" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{displayName}</h2>
                <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                <span className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {isUploadingAvatar ? "Uploading..." : "Member"}
                </span>
              </div>
            </section>

            <nav aria-label="Profile sections" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {menuItems.map((item, index) => {
                const isActive = section === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-controls={`${item.key}-panel`}
                    aria-current={isActive ? "page" : undefined}
                    aria-expanded={isActive}
                    onClick={() => {
                      setSection(isActive ? null : item.key);
                      setAddressDraft(null);
                    }}
                    className={`flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ring sm:gap-4 sm:px-5 ${
                      isActive ? "bg-muted" : "hover:bg-muted/60"
                    } ${index !== menuItems.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                      <item.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{item.desc}</span>
                    </span>
                    <ChevronRight className={`size-4 shrink-0 text-muted-foreground transition-transform ${isActive ? "rotate-90 lg:rotate-0" : ""}`} />
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-card px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="size-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </aside>

          <div className="min-w-0 space-y-4">
            {accountError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {accountError}
              </p>
            )}

            {!section && (
              <section id="account-overview-panel" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold">Account overview</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Choose a section to manage your account. Saved addresses and wishlist items are kept with your account so they&apos;re available when you sign in again.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setSection("addresses")} className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90">
                    Manage addresses
                  </button>
                  <Link href="/category/casual" className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-muted">
                    Continue shopping
                  </Link>
                </div>
              </section>
            )}

            {section === "orders" && (
          <section id="orders-panel" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">My Orders</h2>
            {orders === null && !ordersError ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading your orders...</p>
            ) : ordersError ? (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{ordersError}</p>
            ) : orders?.length ? (
              <ul className="mt-4 space-y-3">
                {orders.map((order) => (
                  <li key={order.id}>
                    <details className="group rounded-xl border border-border bg-card">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 text-sm [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Package className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold">Order #{order.id.slice(-8).toUpperCase()}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                            </span>
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            order.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-muted text-foreground"
                          }`}>{orderStatusLabel(order.status)}</span>
                          <span className="font-semibold">{formatMoney(order.total)}</span>
                          <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                        </span>
                      </summary>
                      <div className="space-y-5 border-t border-border p-4">
                        {order.status !== "cancelled" && (
                          <div className="grid grid-cols-4 gap-2">
                            {orderStatuses.map((status, index) => {
                              const currentIndex = orderStatuses.indexOf(order.status as typeof orderStatuses[number]);
                              const complete = currentIndex >= index;
                              return (
                                <div key={status} className="text-center text-xs">
                                  <span className={`mx-auto flex size-7 items-center justify-center rounded-full ${complete ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                                    {complete ? <Check className="size-4" /> : index + 1}
                                  </span>
                                  <span className={`mt-1 block ${complete ? "font-medium text-foreground" : "text-muted-foreground"}`}>{orderStatusLabel(status)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={`${order.id}-${index}`} className="flex gap-3 rounded-xl border border-border p-3">
                              <Image src={item.image} alt={item.title} width={64} height={80} className="size-16 shrink-0 rounded-lg object-cover" />
                              <div className="min-w-0 flex-1">
                                <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">{item.title}</Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Size: {item.size || "—"} · Color: {item.color || "—"} · Quantity: {item.quantity}
                                </p>
                                <p className="mt-2 text-sm font-medium">{formatMoney(item.unitPrice)} × {item.quantity}</p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold">{formatMoney(item.unitPrice * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-muted/60 p-4">
                            <h3 className="text-sm font-semibold">Delivery details</h3>
                            <p className="mt-2 text-sm font-medium">{order.shippingAddress.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                              {order.shippingAddress.addressLine1}
                              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                              <br />{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                          </div>
                          <div className="rounded-xl bg-muted/60 p-4">
                            <h3 className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="size-4" />Payment & summary</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : order.paymentMethod || "Cash on Delivery"}</p>
                            <dl className="mt-3 space-y-2 text-sm">
                              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
                              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Discount</dt><dd>-{formatMoney((order.discountAmount || 0) + (order.promoDiscount || 0))}</dd></div>
                              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Delivery</dt><dd>{order.deliveryFee ? formatMoney(order.deliveryFee) : "Free"}</dd></div>
                              {order.promoCode && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Promo</dt><dd>{order.promoCode}</dd></div>}
                              <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">No orders found for this account yet.</p>
                <Link href="/category/casual" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Continue shopping
                </Link>
              </>
            )}
          </section>
        )}

            {section === "wishlist" && (
          <section id="wishlist-panel" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Wishlist</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your saved items are stored with your account.</p>
              </div>
              <Link href="/category/casual" className="text-sm font-medium underline underline-offset-4">Browse products</Link>
            </div>
            {isAccountLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">Loading wishlist...</p>
            ) : wishlistSlugs.length === 0 ? (
              <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">Your wishlist is empty. Save products with the heart button while shopping.</p>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {wishlistSlugs.map((slug) => (
                  <li key={slug} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Heart className="size-4 shrink-0 fill-red-500 text-red-500" />
                    <Link href={`/product/${slug}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
                      {slug.replaceAll("-", " ")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void removeFromWishlist(slug)}
                      aria-label={`Remove ${slug.replaceAll("-", " ")} from wishlist`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

            {section === "addresses" && (
          <section id="addresses-panel" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Saved addresses</h2>
                <p className="mt-1 text-sm text-muted-foreground">Manage where your orders should be delivered.</p>
              </div>
              {!addressDraft && (
                <button
                  type="button"
                  onClick={() => setAddressDraft({ ...emptyAddress, isDefault: addresses.length === 0 })}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Add address
                </button>
              )}
            </div>

            {isAccountLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">Loading addresses...</p>
            ) : addresses.length === 0 && !addressDraft ? (
              <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">No saved addresses yet. Add one to make checkout quicker.</div>
            ) : (
              <ul className="mt-5 space-y-3">
                {addresses.map((address) => (
                  <li key={address.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold">{address.label}{address.isDefault && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal">Default</span>}</p>
                          <p className="mt-1">{address.name} · {address.phone}</p>
                          <p className="mt-1 text-muted-foreground">
                            {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.postalCode}, {address.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {!address.isDefault && (
                          <button type="button" onClick={() => void setDefaultAddress(address.id)} className="text-xs font-medium underline underline-offset-4">Set default</button>
                        )}
                        <button type="button" onClick={() => setAddressDraft(address)} className="text-xs font-medium underline underline-offset-4">Edit</button>
                        <button type="button" onClick={() => void deleteAddress(address.id)} aria-label={`Delete ${address.label} address`} className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {addressDraft && (
              <form key={addressDraft.id ?? "new"} onSubmit={submitAddress} className="mt-5 space-y-4 rounded-xl border border-border p-4">
                <h3 className="font-semibold">{addressDraft.id ? "Edit address" : "New address"}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span>Address label</span>
                    <input name="label" required maxLength={40} defaultValue={addressDraft.label} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Recipient name</span>
                    <input name="name" required maxLength={80} autoComplete="name" defaultValue={addressDraft.name} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Phone number</span>
                    <input name="phone" required maxLength={30} autoComplete="tel" defaultValue={addressDraft.phone} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Address line 1</span>
                    <input name="addressLine1" required maxLength={200} autoComplete="address-line1" defaultValue={addressDraft.addressLine1} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Address line 2 (optional)</span>
                    <input name="addressLine2" maxLength={200} autoComplete="address-line2" defaultValue={addressDraft.addressLine2} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>City</span>
                    <input name="city" required maxLength={100} autoComplete="address-level2" defaultValue={addressDraft.city} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Postal code</span>
                    <input name="postalCode" required maxLength={20} autoComplete="postal-code" defaultValue={addressDraft.postalCode} className={inputClassName()} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Country</span>
                    <input name="country" value="Bangladesh" readOnly maxLength={100} autoComplete="country-name" className={`${inputClassName()} bg-muted`} />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="isDefault" type="checkbox" defaultChecked={addressDraft.isDefault || addresses.length === 0} className="size-4 accent-primary" />
                  Make this my default address
                </label>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setAddressDraft(null)} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={isSavingAddress} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                    {isSavingAddress ? "Saving..." : "Save address"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

            {section === "payments" && (
          <section id="payments-panel" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <div className="mt-4 rounded-xl border border-border p-4">
              <p className="text-sm font-medium">No payment methods are saved</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Orders currently support Cash on Delivery only. For your safety, card numbers are not collected or stored; online payments are not connected yet.
              </p>
              <Link href="/cart" className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                View your cart
              </Link>
            </div>
          </section>
        )}

            {section === "settings" && (
          <section id="settings-panel" className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update the name shown on your profile or change your password.</p>
            </div>
            <form onSubmit={saveProfileName} className="space-y-3">
              <label className="block space-y-1 text-sm">
                <span>Full name</span>
                <input value={name} onChange={(event) => setNameDraft({ userId: user.id, value: event.target.value })} required minLength={1} maxLength={80} autoComplete="name" className={inputClassName()} />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Email address</span>
                <input value={user.email} disabled className={`${inputClassName()} opacity-60`} />
              </label>
              <button type="submit" disabled={isSavingSettings || name.trim() === (user.name ?? "")} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {isSavingSettings ? "Saving..." : "Save profile"}
              </button>
            </form>
            <form onSubmit={changePassword} className="space-y-3 border-t border-border pt-5">
              <h3 className="font-semibold">Change password</h3>
              <label className="block space-y-1 text-sm">
                <span>Current password</span>
                <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" className={inputClassName()} />
              </label>
              <label className="block space-y-1 text-sm">
                <span>New password</span>
                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} autoComplete="new-password" className={inputClassName()} />
              </label>
              <button type="submit" disabled={isSavingSettings || newPassword.length < 8} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60">
                {isSavingSettings ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>
        )}

            <div className="pt-1">
              <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                ← Back to shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter showNewsletter={false} />
    </div>
  );
}
