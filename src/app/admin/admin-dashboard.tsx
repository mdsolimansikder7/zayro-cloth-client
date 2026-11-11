"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  CircleDollarSign,
  LoaderCircle,
  Mail,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/store-api";
import type { Product } from "@/types/product";
import { formatMoney } from "@/lib/format-money";

type AdminProduct = Product & { id: string; createdAt?: string };
type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt?: string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  shippingAddress?: {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
  };
};
type AdminUser = { id: string; name: string; email: string; createdAt?: string };
type Subscriber = {
  email: string;
  status?: "pending" | "active" | "unsubscribed";
  source?: string;
  subscribedAt?: string;
  createdAt?: string;
};
type DashboardData = {
  stats: { products: number; orders: number; users: number; subscribers: number; revenue: number };
  products: AdminProduct[];
  orders: AdminOrder[];
  users: AdminUser[];
  subscribers: Subscriber[];
};
type Section = "overview" | "products" | "orders" | "users" | "subscribers";
type ProductDraft = {
  id?: string;
  slug: string;
  title: string;
  image: string;
  brand: string;
  images: string;
  oldPrice: string;
  discount: string;
  collection: Product["collection"];
  category: string;
  styles: string;
  description: string;
  price: string;
  colors: string;
  sizes: string;
};

const initialProductDraft: ProductDraft = {
  slug: "",
  title: "",
  image: "",
  brand: "ZARA",
  images: "",
  oldPrice: "",
  discount: "",
  collection: "new",
  category: "",
  styles: "Casual",
  description: "",
  price: "",
  colors: "",
  sizes: "",
};

const navigation: Array<{ id: Section; label: string; icon: typeof Boxes }> = [
  { id: "overview", label: "Overview", icon: Boxes },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "users", label: "Customers", icon: Users },
  { id: "subscribers", label: "Subscribers", icon: Mail },
];
const orderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function productToDraft(product: AdminProduct): ProductDraft {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    brand: product.brand ?? "ZARA",
    images: product.images?.join(", ") ?? "",
    oldPrice: product.oldPrice == null ? "" : String(product.oldPrice),
    discount: product.discount == null ? "" : String(product.discount),
    collection: product.collection,
    category: product.category,
    styles: product.styles?.join(", ") ?? "",
    description: product.description,
    price: String(product.price),
    colors: product.colors?.join(", ") ?? "",
    sizes: product.sizes?.join(", ") ?? "",
  };
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);

  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) router.replace("/sign-in");
    else if (!isAdmin) router.replace("/");
  }, [isAdmin, isPending, router, session]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch("admin") as DashboardData;
      setData(result);
    } catch (loadError) {
      setError(messageFrom(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending || !isAdmin) return;
    const initialLoad = window.setTimeout(() => void loadData(), 0);
    window.addEventListener("focus", loadData);
    window.addEventListener("zayro:order-created", loadData);
    window.addEventListener("zayro:session-change", loadData);
    return () => {
      window.removeEventListener("focus", loadData);
      window.removeEventListener("zayro:order-created", loadData);
      window.removeEventListener("zayro:session-change", loadData);
      window.clearTimeout(initialLoad);
    };
  }, [isAdmin, isPending, loadData]);

  const filteredProducts = useMemo(
    () => data?.products.filter((product) =>
      `${product.title} ${product.slug} ${product.brand ?? ""} ${product.category}`.toLowerCase().includes(filter.toLowerCase()),
    ) ?? [],
    [data?.products, filter],
  );

  function updateDraft(name: keyof ProductDraft, value: string) {
    setDraft((current) => current ? { ...current, [name]: value } : current);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSavingProduct(true);

    try {
      let image = draft.image;
      if (mainImageFile) {
        const formData = new FormData();
        formData.append("images", mainImageFile);
        const upload = await apiFetch("admin/uploads", { method: "POST", body: formData }) as { urls: string[] };
        image = upload.urls[0];
      }
      if (!image) throw new Error("Choose a main product image.");
      let images = splitList(draft.images);
      if (galleryImageFiles.length) {
        const formData = new FormData();
        galleryImageFiles.forEach((file) => formData.append("images", file));
        const upload = await apiFetch("admin/uploads", { method: "POST", body: formData }) as { urls: string[] };
        images = [...images, ...upload.urls].slice(0, 10);
      }

      const body = {
        slug: draft.slug,
        title: draft.title,
        image,
        brand: draft.brand,
        images,
        oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
        discount: draft.discount ? Number(draft.discount) : null,
        collectionName: draft.collection,
        category: draft.category,
        styles: splitList(draft.styles),
        description: draft.description,
        price: Number(draft.price),
        colors: splitList(draft.colors),
        sizes: splitList(draft.sizes),
      };

      await apiFetch(
        draft.id ? `admin/products/${draft.id}` : "admin/products",
        {
          method: draft.id ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      setDraft(null);
      setMainImageFile(null);
      setGalleryImageFiles([]);
      toast.add({ title: draft.id ? "Product updated" : "Product created", type: "success" });
      await loadData();
    } catch (saveError) {
      toast.add({ title: "Product could not be saved", description: messageFrom(saveError), type: "error" });
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(product: AdminProduct) {
    try {
      await apiFetch(`admin/products/${product.id}`, { method: "DELETE" });
      setPendingDelete(null);
      toast.add({ title: "Product deleted", description: product.title, type: "success" });
      await loadData();
    } catch (deleteError) {
      toast.add({ title: "Product could not be deleted", description: messageFrom(deleteError), type: "error" });
    }
  }

  async function updateOrder(order: AdminOrder) {
    const status = orderDrafts[order.id] ?? order.status;
    setSavingOrder(order.id);
    try {
      await apiFetch(`admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.add({ title: "Order status updated", type: "success" });
      await loadData();
    } catch (updateError) {
      toast.add({ title: "Order could not be updated", description: messageFrom(updateError), type: "error" });
    } finally {
      setSavingOrder(null);
    }

  }

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignSubject.trim() || !campaignBody.trim()) return;
    setCampaignDialogOpen(true);
  }

  async function confirmSendCampaign() {
    setCampaignDialogOpen(false);
    setSendingCampaign(true);
    try {
      const result = await apiFetch("admin/newsletter/campaign", {
        method: "POST",
        body: JSON.stringify({ subject: campaignSubject, body: campaignBody }),
      }) as { sent: number; failed: number };
      toast.add({
        title: "Campaign sent",
        description: `${result.sent} email${result.sent === 1 ? "" : "s"} sent${result.failed ? `, ${result.failed} failed` : ""}.`,
        type: result.failed ? "error" : "success",
      });
      setCampaignSubject("");
      setCampaignBody("");
      await loadData();
    } catch (sendError) {
      toast.add({ title: "Campaign could not be sent", description: messageFrom(sendError), type: "error" });
    } finally {
      setSendingCampaign(false);
    }
  }

  if (isPending || !session?.user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center gap-3 bg-background text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span>Checking admin access…</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Zayro store</p>
              <h1 className="text-xl font-bold sm:text-2xl">Admin dashboard</h1>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadData()} disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
            Refresh data
          </Button>
        </header>

        <nav aria-label="Admin sections" className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-border bg-background p-2">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setSection(id); setFilter(""); }}
              aria-current={section === id ? "page" : undefined}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                section === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <span>{error}</span>
            <Button type="button" variant="outline" onClick={() => void loadData()}>Try again</Button>
          </div>
        )}

        {loading && !data ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" /> Loading store data…
          </div>
        ) : data ? (
          <>
            {section === "overview" && (
              <section aria-labelledby="overview-title">
                <div className="mb-5">
                  <h2 id="overview-title" className="text-lg font-semibold">Store overview</h2>
                  <p className="text-sm text-muted-foreground">Live counts from your store database.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard label="Products" value={data.stats.products} icon={Package} />
                  <StatCard label="Orders" value={data.stats.orders} icon={ShoppingBag} />
                  <StatCard label="Customers" value={data.stats.users} icon={Users} />
                  <StatCard label="Subscribers" value={data.stats.subscribers} icon={Mail} />
                  <StatCard label="Order revenue" value={formatMoney(data.stats.revenue)} icon={CircleDollarSign} />
                </div>
                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Recent orders</h3>
                      <button type="button" onClick={() => setSection("orders")} className="text-sm text-muted-foreground hover:text-foreground">See all</button>
                    </div>
                    <div className="space-y-3">
                      {data.orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">#{order.id.slice(-8)} · {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatMoney(order.total)}</p>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                      {data.orders.length === 0 && <p className="py-5 text-sm text-muted-foreground">No orders yet.</p>}
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Recently added products</h3>
                      <button type="button" onClick={() => setSection("products")} className="text-sm text-muted-foreground hover:text-foreground">Manage</button>
                    </div>
                    <div className="space-y-3">
                      {data.products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.category} · {formatDate(product.createdAt)}</p>
                          </div>
                          <p className="shrink-0 font-medium">{formatMoney(product.price)}</p>
                        </div>
                      ))}
                      {data.products.length === 0 && <p className="py-5 text-sm text-muted-foreground">No products yet.</p>}
                    </div>
                  </section>
                </div>
              </section>
            )}

            {section === "products" && (
              <section aria-labelledby="products-title">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 id="products-title" className="text-lg font-semibold">Products</h2>
                    <p className="text-sm text-muted-foreground">{data.products.length} products loaded (up to 200).</p>
                  </div>
                  {!draft && <Button type="button" onClick={() => { setMainImageFile(null); setGalleryImageFiles([]); setDraft({ ...initialProductDraft }); }}><Plus /> Add product</Button>}
                </div>

                {draft && (
                  <form onSubmit={saveProduct} className="mb-6 rounded-xl border border-border bg-background p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{draft.id ? "Edit product" : "Add product"}</h3>
                      <Button type="button" variant="ghost" onClick={() => { setMainImageFile(null); setGalleryImageFiles([]); setDraft(null); }}>Cancel</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="Product title" name="title" value={draft.title} onChange={updateDraft} required />
                      <Field label="URL slug (lowercase, hyphens)" name="slug" value={draft.slug} onChange={updateDraft} required />
                      <label className="grid gap-1.5 text-sm font-medium">
                        Main product image — choose from PC
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setMainImageFile(event.target.files?.[0] ?? null)}
                          className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        />
                        <span className="text-xs font-normal text-muted-foreground">JPG, PNG, WEBP up to 5 MB.</span>
                      </label>
                      <Field label="Price" name="price" value={draft.price} onChange={updateDraft} required type="number" />
                      <Field label="Old price (optional)" name="oldPrice" value={draft.oldPrice} onChange={updateDraft} type="number" />
                      <Field label="Discount % (optional)" name="discount" value={draft.discount} onChange={updateDraft} type="number" />
                      <Field label="Category" name="category" value={draft.category} onChange={updateDraft} required />
                      <Field label="Brand" name="brand" value={draft.brand} onChange={updateDraft} required />
                      <label className="grid gap-1.5 text-sm font-medium">
                        Collection
                        <select
                          value={draft.collection}
                          onChange={(event) => updateDraft("collection", event.target.value)}
                          className="h-10 rounded-lg border border-border bg-background px-3 font-normal"
                        >
                          {["new", "top", "detail", "related"].map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <Field label="Additional gallery image URLs (comma separated)" name="images" value={draft.images} onChange={updateDraft} wide />
                      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-3">
                        Additional gallery images — choose from PC
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) => setGalleryImageFiles(Array.from(event.target.files ?? []))}
                          className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        />
                        <span className="text-xs font-normal text-muted-foreground">Select one or more files, up to 5 MB each.</span>
                      </label>
                      <Field label="Styles (comma separated)" name="styles" value={draft.styles} onChange={updateDraft} />
                      <Field label="Colors (comma separated)" name="colors" value={draft.colors} onChange={updateDraft} />
                      <Field label="Sizes (comma separated)" name="sizes" value={draft.sizes} onChange={updateDraft} />
                      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-3">
                        Description
                        <textarea
                          value={draft.description}
                          onChange={(event) => updateDraft("description", event.target.value)}
                          required
                          rows={3}
                          className="resize-y rounded-lg border border-border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </label>
                    </div>
                    <Button type="submit" className="mt-5" disabled={savingProduct}>
                      {savingProduct && <LoaderCircle className="animate-spin" />}
                      {savingProduct ? "Saving…" : "Save product"}
                    </Button>
                  </form>
                )}

                <input
                  type="search"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Search title, slug, brand, or category"
                  aria-label="Search products"
                  className="mb-3 h-10 w-full max-w-sm rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="overflow-x-auto rounded-xl border border-border bg-background">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                      <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Added</th><th className="px-4 py-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="max-w-[280px] px-4 py-3">
                            <p className="truncate font-medium">{product.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{product.slug}</p>
                          </td>
                          <td className="px-4 py-3">{product.category}</td>
                          <td className="px-4 py-3">{formatMoney(product.price)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(product.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => { setMainImageFile(null); setGalleryImageFiles([]); setDraft(productToDraft(product)); }}><Pencil /> Edit</Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => setPendingDelete(product)}><Trash2 /> Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No matching products.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {section === "orders" && (
              <section aria-labelledby="orders-title">
                <div className="mb-5">
                  <h2 id="orders-title" className="text-lg font-semibold">Orders</h2>
                  <p className="text-sm text-muted-foreground">{data.orders.length} recent orders loaded (up to 200).</p>
                </div>
                <div className="space-y-4">
                  {data.orders.map((order) => (
                    <article key={order.id} className="rounded-xl border border-border bg-background p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{order.customerName} · {order.customerEmail}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{formatMoney(order.total)}</span>
                          <select
                            value={orderDrafts[order.id] ?? order.status}
                            onChange={(event) => setOrderDrafts((current) => ({ ...current, [order.id]: event.target.value }))}
                            aria-label={`Status for order ${order.id}`}
                            className="h-9 rounded-lg border border-border bg-background px-2 text-sm capitalize"
                          >
                            {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                          <Button type="button" size="sm" disabled={savingOrder === order.id || (orderDrafts[order.id] ?? order.status) === order.status} onClick={() => void updateOrder(order)}>
                            {savingOrder === order.id && <LoaderCircle className="animate-spin" />}
                            Save
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Items</p>
                          <ul className="space-y-1 text-sm">
                            {order.items.map((item, index) => <li key={`${item.title}-${index}`}>{item.title} × {item.quantity} <span className="text-muted-foreground">({formatMoney(item.unitPrice)})</span></li>)}
                          </ul>
                        </div>
                        {order.shippingAddress && (
                          <div className="text-sm">
                            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Shipping</p>
                            <p>{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
                            <p className="text-muted-foreground">{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                  {data.orders.length === 0 && <EmptyState label="No orders yet." />}
                </div>
              </section>
            )}

            {section === "users" && (
              <DataTable
                title="Customers"
                description={`${data.users.length} customer accounts loaded (up to 200).`}
                headers={["Name", "Email", "Joined"]}
                rows={data.users.map((user) => [user.name, user.email, formatDate(user.createdAt)])}
                empty="No customer accounts yet."
              />
            )}

            {section === "subscribers" && (
              <section aria-labelledby="subscribers-title" className="space-y-6">
                <div>
                  <h2 id="subscribers-title" className="text-lg font-semibold">Newsletter subscribers</h2>
                  <p className="text-sm text-muted-foreground">{data.subscribers.length} subscribers loaded (up to 200).</p>
                </div>
                <form onSubmit={sendCampaign} className="rounded-xl border border-border bg-background p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="font-semibold">Send a campaign</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Campaigns go only to active subscribers, in batches of 10, with a 400-email daily safety cap.</p>
                  </div>
                  <div className="grid gap-3">
                    <input
                      value={campaignSubject}
                      onChange={(event) => setCampaignSubject(event.target.value)}
                      placeholder="Subject"
                      maxLength={160}
                      required
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      value={campaignBody}
                      onChange={(event) => setCampaignBody(event.target.value)}
                      placeholder="Write your campaign message…"
                      maxLength={10000}
                      required
                      rows={7}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={sendingCampaign || !data.subscribers.some((subscriber) => subscriber.status === "active" || !subscriber.status)}>
                        {sendingCampaign ? <LoaderCircle className="animate-spin" /> : <Send />}
                        {sendingCampaign ? "Sending…" : "Send campaign"}
                      </Button>
                    </div>
                  </div>
                </form>
                <DataTable
                  title="Subscriber list"
                  description="Pending subscribers must confirm by email before receiving campaigns."
                  headers={["Email", "Status", "Source", "Subscribed"]}
                  rows={data.subscribers.map((subscriber) => [
                    subscriber.email,
                    subscriber.status || "active",
                    subscriber.source || "footer",
                    formatDate(subscriber.subscribedAt || subscriber.createdAt),
                  ])}
                  empty="No subscribers yet."
                />
              </section>
            )}
          </>
        ) : null}
      </div>
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          size="default"
          className="max-w-[calc(100%-2rem)] overflow-hidden border border-destructive/15 p-0 shadow-2xl shadow-black/20 sm:max-w-md"
        >
          <AlertDialogHeader>
            <div className="space-y-4 p-6 pb-5">
              <AlertDialogMedia className="size-11 rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-5" aria-hidden="true" />
              </AlertDialogMedia>
              <div className="space-y-1.5">
                <AlertDialogTitle className="text-lg font-bold tracking-tight">
                  Delete this product?
                </AlertDialogTitle>
                <AlertDialogDescription className="leading-6">
                  {pendingDelete
                    ? `"${pendingDelete.title}" will be permanently deleted. This action cannot be undone.`
                    : "This product will be permanently deleted."}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-border/70 bg-muted/30 px-6 py-4">
            <AlertDialogCancel onClick={() => setPendingDelete(null)} className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive font-semibold text-destructive-foreground shadow-sm shadow-destructive/20 hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) void deleteProduct(pendingDelete);
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send this campaign?</DialogTitle>
            <DialogDescription>
              This campaign will be sent to all active subscribers in small batches.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium">{campaignSubject}</p>
            <p className="mt-1 line-clamp-3 text-muted-foreground">{campaignBody}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCampaignDialogOpen(false)}
              disabled={sendingCampaign}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void confirmSendCampaign()} disabled={sendingCampaign}>
              {sendingCampaign ? <LoaderCircle className="animate-spin" /> : <Send />}
              {sendingCampaign ? "Sending…" : "Send campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Field({
  label, name, value, onChange, required = false, type = "text", wide = false,
}: {
  label: string;
  name: keyof ProductDraft;
  value: string;
  onChange: (name: keyof ProductDraft, value: string) => void;
  required?: boolean;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        className="h-10 min-w-0 rounded-lg border border-border bg-background px-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Boxes }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground"><Icon className="size-4" aria-hidden="true" /></span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">{status}</span>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-background px-4 py-12 text-center text-sm text-muted-foreground">{label}</div>;
}

function DataTable({
  title, description, headers, rows, empty,
}: {
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`} className="px-4 py-3">{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      ) : <EmptyState label={empty} />}
    </section>
  );
}
