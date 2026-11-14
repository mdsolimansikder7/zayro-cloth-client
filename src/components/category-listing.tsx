"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import CategoryFilters, { type SelectedFilters } from "@/components/category-filters";
import FiltersPanel from "@/components/filters-panel";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      drawerCloseButtonRef.current?.focus({ preventScroll: true });
    }
  }, [drawerOpen]);

  function applyFilters(nextFilters: SelectedFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleApply(nextFilters: SelectedFilters) {
    applyFilters(nextFilters);
    setDrawerOpen(false);
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > pagination.pages) return;
    setPage(nextPage);
  }

  const defaultTitle = props.slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const title = props.initialBrand || filters.category || filters.style || routeStyle || defaultTitle;
  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.style ? 1 : 0) +
    (filters.color ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.maxPrice < facets.maxPrice ? 1 : 0);
  const visiblePages = Array.from({ length: Math.min(pagination.pages, 5) }, (_, index) => {
    const first = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
    return first + index;
  });

  return (
    <div className="mt-6 grid items-start gap-6 lg:mt-5 lg:grid-cols-[250px_1fr]">
      <CategoryFilters facets={facets} initialFilters={filters} onApply={applyFilters} />
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl uppercase tracking-tight lg:text-[32px]">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:justify-end sm:text-sm">
            <span>{isLoading ? "Loading products…" : `Showing ${products.length} of ${pagination.total} products`}</span>
            <Button
              type="button"
              variant="outline"
              aria-label="Filters"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="size-2 mr-1.5" />
              Filters
              {activeCount > 0 && <Badge className="ml-2">{activeCount}</Badge>}
            </Button>
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
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-5 sm:flex-row sm:justify-between">
            <button type="button" disabled={pagination.page <= 1 || isLoading} onClick={() => changePage(pagination.page - 1)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"><ArrowLeft className="size-4" />Previous</button>
            <div className="flex items-center gap-1 text-sm">
              {visiblePages.map((page) => <button key={page} type="button" aria-current={page === pagination.page ? "page" : undefined} disabled={isLoading} onClick={() => changePage(page)} className={`size-8 rounded-lg ${page === pagination.page ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{page}</button>)}
            </div>
            <button type="button" disabled={pagination.page >= pagination.pages || isLoading} onClick={() => changePage(pagination.page + 1)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:text-foreground disabled:opacity-40">Next<ArrowRight className="size-4" /></button>
          </div>
        )}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            "fixed z-50 left-0 top-0 flex flex-col h-full w-[85%] max-w-[360px] bg-background border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-4 py-4 bg-background/80 backdrop-blur-sm">
            <h2 className="font-medium">Filters</h2>
            <button
              ref={drawerCloseButtonRef}
              type="button"
              aria-label="Close filters"
              className="size-10 rounded-full border border-border hover:bg-muted text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <FiltersPanel facets={facets} filters={filters} onFilterChange={handleApply} mobile resetLabel="Clear all" />
        </aside>
      </div>
    </div>
  );
}
