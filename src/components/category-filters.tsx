"use client";

import { useEffect, useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductFilters } from "@/lib/store-api";

export type SelectedFilters = {
  category: string;
  style: string;
  color: string;
  size: string;
  maxPrice: number;
};

export default function CategoryFilters({
  facets,
  initialFilters,
  onApply,
}: {
  facets: ProductFilters;
  initialFilters: SelectedFilters;
  onApply: (filters: SelectedFilters) => void;
}) {
  const [filters, setFilters] = useState(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const minimumPrice = Math.min(facets.minPrice, facets.maxPrice);
  const maximumPrice = Math.max(facets.minPrice, facets.maxPrice);
  const maxPrice = Math.min(Math.max(filters.maxPrice, minimumPrice), maximumPrice);

  function update<K extends keyof SelectedFilters>(key: K, value: SelectedFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <aside className="rounded-[20px] border border-border p-4 lg:p-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="font-medium">Filters</h2>
        <SlidersHorizontal className="size-4 text-muted-foreground" />
      </div>

      <div className="border-b border-border py-4">
        <h3 className="font-medium">Category</h3>
        <ul className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
          {facets.categories.map((category) => (
            <li key={category}>
              <button
                type="button"
                onClick={() => {
                  const next = { ...filters, category: filters.category === category ? "" : category, style: "" };
                  setFilters(next);
                  onApply(next);
                }}
                aria-pressed={filters.category === category}
                className={`flex w-full items-center justify-between hover:text-foreground ${filters.category === category ? "text-foreground" : ""}`}
              >
                {category}<ChevronRight className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-border py-4">
        <h3 className="font-medium">Maximum price</h3>
        <input type="range" min={minimumPrice} max={maximumPrice} step={5} value={maxPrice} onChange={(event) => update("maxPrice", Number(event.target.value))} aria-label="Maximum price" className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>৳{minimumPrice}</span><span>৳{maxPrice}</span></div>
      </div>

      {facets.colors.length > 0 && (
        <div className="border-b border-border py-4">
          <h3 className="font-medium">Color</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  const next = { ...filters, color: filters.color === color ? "" : color };
                  setFilters(next);
                  onApply(next);
                }}
                aria-label={`Color ${color}`}
                aria-pressed={filters.color === color}
                className={`rounded-full border border-border px-3 py-1.5 text-xs transition-colors ${filters.color === color ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.sizes.length > 0 && (
        <div className="border-b border-border py-4">
          <h3 className="font-medium">Size</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  const next = { ...filters, size: filters.size === size ? "" : size };
                  setFilters(next);
                  onApply(next);
                }}
                aria-pressed={filters.size === size}
                className={`min-h-8 rounded-full px-3 text-xs ${filters.size === size ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.styles.length > 0 && (
        <div className="py-4">
          <h3 className="font-medium">Style</h3>
          <ul className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
            {facets.styles.map((style) => (
              <li key={style}>
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...filters, style: filters.style === style ? "" : style, category: "" };
                    setFilters(next);
                    onApply(next);
                  }}
                  aria-pressed={filters.style === style}
                  className={`flex w-full items-center justify-between hover:text-foreground ${filters.style === style ? "text-foreground" : ""}`}
                >
                  {style}<ChevronRight className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" onClick={() => { const cleared = { category: "", style: "", color: "", size: "", maxPrice: facets.maxPrice }; setFilters(cleared); onApply(cleared); }} className="h-11 flex-1 rounded-full">Reset</Button>
        <Button type="button" onClick={() => onApply(filters)} className="h-11 flex-1 rounded-full">Apply</Button>
      </div>
    </aside>
  );
}
