"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import CategoryFilters, { type SelectedFilters } from "@/components/category-filters";
import ProductCard from "@/components/product-card";
import { getProductFilters, getProductPage, type ProductFilters, type ProductQuery, type ProductsResponse } from "@/lib/store-api";
import type { Product } from "@/types/product";

type Props = {
  slug: string;
  initialSearch?: string;
  initialCollection?: string;
  initialSort?: string;
  initialPage?: number;
  initialCategory?: string;
  initialBrand?: string;
  initialStyle?: string;
  initialColor?: string;
  initialSize?: string;
  initialMaxPrice?: number;
};

const EMPTY_FACETS: ProductFilters = {
  categories: [],
  sizes: [],
  colors: [],
  styles: [],
  minPrice: 0,
  maxPrice: 300,
};
const SORT_OPTIONS: { label: string; value: NonNullable<ProductQuery["sort"]> }[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

function categorySlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CategoryListing(props: Props) {
  const routeStyle = props.slug.toLowerCase() === "casual" ? "Casual" : "";
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"]>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [filters, setFilters] = useState<SelectedFilters>({
    category: routeStyle ? "" : props.initialCategory ?? "",
    style: props.initialStyle ?? routeStyle,
    color: props.initialColor ?? "",
    size: props.initialSize ?? "",
    maxPrice: props.initialMaxPrice ?? EMPTY_FACETS.maxPrice,
  });
  const [sort, setSort] = useState<ProductQuery["sort"]>(
    SORT_OPTIONS.some((option) => option.value === props.initialSort)
      ? props.initialSort as ProductQuery["sort"]
      : "popular",
  );
  const [page, setPage] = useState(props.initialPage ?? 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadProducts = useCallback(async (nextFilters: SelectedFilters, page: number, nextSort: ProductQuery["sort"]) => {
    const request = ++requestId.current;
    setIsLoading(true);
    setError("");
    const categoryFromSlug = facets.categories.find((category) => categorySlug(category) === props.slug.toLowerCase());
    const query: ProductQuery = {
      category: nextFilters.category || (routeStyle ? undefined : categoryFromSlug),
      brand: props.initialBrand || undefined,
      style: nextFilters.style || (nextFilters.category ? undefined : routeStyle) || undefined,
      color: nextFilters.color || undefined,
      size: nextFilters.size || undefined,
      maxPrice: nextFilters.maxPrice < facets.maxPrice ? nextFilters.maxPrice : undefined,
      q: props.initialSearch || undefined,
      collection: props.initialCollection === "new" || props.initialCollection === "top" || props.initialCollection === "detail" || props.initialCollection === "related" ? props.initialCollection : undefined,
      sort: nextSort,
      page,
      limit: 12,
    };
    try {
      const result = await getProductPage(query);
      if (request === requestId.current) {
        setProducts(result.products);
        setPagination(result.pagination);
      }
    } catch (requestError) {
      if (request === requestId.current) setError(requestError instanceof Error ? requestError.message : "Could not load products.");
    } finally {
      if (request === requestId.current) setIsLoading(false);
    }
  }, [facets.categories, facets.maxPrice, props.initialBrand, props.initialCollection, props.initialSearch, props.slug, routeStyle]);

  useEffect(() => {
    let active = true;
    getProductFilters()
      .then((result) => {
        if (!active) return;
        setFacets(result);
        setFilters((current) => ({
          ...current,
          category: routeStyle ? "" : current.category,
          style: routeStyle || current.style,
          maxPrice: props.initialMaxPrice === undefined
            ? result.maxPrice
            : Math.min(Math.max(props.initialMaxPrice, result.minPrice), result.maxPrice),
        }));
      })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load product filters."); });
    return () => {
      active = false;
    };
  }, [props.initialMaxPrice]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void loadProducts(filters, page, sort));
    return () => {
      cancelAnimationFrame(frame);
      requestId.current += 1;
    };
  }, [filters, loadProducts, page, sort]);

  function applyFilters(nextFilters: SelectedFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > pagination.pages) return;
    setPage(nextPage);
  }

  const defaultTitle = props.slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const title = props.initialBrand || filters.category || filters.style || routeStyle || defaultTitle;
  const visiblePages = Array.from({ length: Math.min(pagination.pages, 5) }, (_, index) => {
    const first = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
    return first + index;
  });

  return (
    <div className="mt-5 grid items-start gap-6 lg:grid-cols-[250px_1fr]">
      <CategoryFilters facets={facets} initialFilters={filters} onApply={applyFilters} />
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-2xl uppercase tracking-tight lg:text-[32px]">{title}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground sm:text-sm">
            <span>{isLoading ? "Loading products…" : `Showing ${products.length} of ${pagination.total} products`}</span>
            <label className="relative flex items-center gap-1">
              <span className="hidden sm:inline">Sort by:</span>
              <select value={sort} onChange={(event) => {
                const nextSort = event.target.value as ProductQuery["sort"];
                setSort(nextSort);
                setPage(1);
              }} className="h-8 appearance-none rounded-full bg-transparent pr-6 font-medium text-foreground focus:outline-none">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-foreground" />
            </label>
          </div>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p>}
        {!error && !isLoading && products.length === 0 && <p className="mt-8 rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">No products match these filters.</p>}
        <div className={`mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 ${isLoading ? "opacity-60" : ""}`}>
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>

        {pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
            <button type="button" disabled={pagination.page <= 1 || isLoading} onClick={() => changePage(pagination.page - 1)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"><ArrowLeft className="size-4" />Previous</button>
            <div className="flex items-center gap-1 text-sm">
              {visiblePages.map((page) => <button key={page} type="button" aria-current={page === pagination.page ? "page" : undefined} disabled={isLoading} onClick={() => changePage(page)} className={`size-8 rounded-lg ${page === pagination.page ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{page}</button>)}
            </div>
            <button type="button" disabled={pagination.page >= pagination.pages || isLoading} onClick={() => changePage(pagination.page + 1)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:text-foreground disabled:opacity-40">Next<ArrowRight className="size-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
