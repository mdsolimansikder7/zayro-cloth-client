import type { Product } from "@/types/product";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
const TOKEN_KEY = "zayro-auth-token";

export class StoreApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: unknown) {
    super(message);
    this.name = "StoreApiError";
  }
}

export type ProductQuery = {
  category?: string;
  brand?: string;
  collection?: Product["collection"];
  style?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: "popular" | "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
};

export type ProductsResponse = {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type ProductFilters = {
  categories: string[];
  sizes: string[];
  colors: string[];
  styles: string[];
  minPrice: number;
  maxPrice: number;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  productTitle?: string;
  productSlug?: string;
};

export type Storefront = {
  navigation: { label: string; href: string }[];
  heroStats: { value: string; label: string }[];
  brands: { name: string; style: string }[];
  faqs: { question: string; answer: string }[];
  socialLinks: { name: string; url: string }[];
  companyLinks: (string | { label: string; url: string })[];
  helpLinks: (string | { label: string; url: string })[];
  faqLinks: (string | { label: string; url: string })[];
  paymentMethods: string[];
  brandDescription: string;
  copyrightText: string;
  hero: { title: string; description: string; ctaLabel: string; ctaUrl: string; image: string };
  dressStyles: { name: string; image: string; span: string; flip: boolean }[];
  announcement: { text: string; linkText: string; linkUrl: string };
  shipping: {
    deliveryFee: number;
    freeOver: number | null;
    returnWindowDays: number;
    cityDeliveryDays: string;
    otherDeliveryDays: string;
  };
};

export type CartItem = {
  _id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

export type CartData = {
  id: string;
  items: CartItem[];
  promoCode: string | null;
  subtotal: number;
  discountAmount: number;
  promoDiscount: number;
  deliveryFee: number;
  total: number;
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : response.statusText || "Request failed.";
    throw new StoreApiError(message, response.status, body);
  }
  return body;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}/api/${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function request<T>(url: URL): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : response.statusText;
    throw new Error(`Store API request failed (${response.status}): ${message}`);
  }
  return body as T;
}

export function getProductPage(query: ProductQuery = {}) {
  return request<ProductsResponse>(buildUrl("products", query));
}

export async function getProducts(query: ProductQuery = {}) {
  const firstPage = await getProductPage({ ...query, page: 1, limit: 50 });
  const products = [...firstPage.products];
  for (let page = 2; page <= firstPage.pagination.pages; page += 1) {
    const nextPage = await getProductPage({ ...query, page, limit: 50 });
    products.push(...nextPage.products);
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(buildUrl(`products/${encodeURIComponent(slug)}`), {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : response.statusText;
    throw new Error(`Store API request failed (${response.status}): ${message}`);
  }
  return (body as { product: Product }).product;
}

export async function getProductCategories(): Promise<string[]> {
  const result = await request<{ categories: string[] }>(buildUrl("products/categories"));
  return result.categories;
}

export function getProductFilters() {
  return request<ProductFilters>(buildUrl("products/filters"));
}

export async function getProductReviews(productId: string) {
  const firstPage = await request<{
    reviews: ProductReview[];
    rating: number;
    pagination: { pages: number };
  }>(buildUrl(`products/${encodeURIComponent(productId)}/reviews`, { page: 1, limit: 50 }));
  const reviews = [...firstPage.reviews];
  for (let page = 2; page <= firstPage.pagination.pages; page += 1) {
    const nextPage = await request<{ reviews: ProductReview[] }>(
      buildUrl(`products/${encodeURIComponent(productId)}/reviews`, { page, limit: 50 }),
    );
    reviews.push(...nextPage.reviews);
  }
  return { reviews, rating: firstPage.rating };
}

export async function getLatestReviews(limit = 10) {
  const result = await request<{ reviews: ProductReview[] }>(
    buildUrl("reviews/latest", { limit }),
  );
  return result.reviews;
}

export async function getStorefront() {
  const result = await request<{ storefront: Storefront }>(buildUrl("storefront"));
  const storefront = result.storefront;
  return {
    ...storefront,
    navigation: storefront.navigation ?? [],
    heroStats: storefront.heroStats ?? [],
    brands: storefront.brands ?? [],
    faqs: storefront.faqs ?? [],
    socialLinks: storefront.socialLinks ?? [],
    companyLinks: storefront.companyLinks ?? [],
    helpLinks: storefront.helpLinks ?? [],
    faqLinks: storefront.faqLinks ?? [],
    paymentMethods: storefront.paymentMethods ?? [],
    dressStyles: storefront.dressStyles ?? [],
  };
}
