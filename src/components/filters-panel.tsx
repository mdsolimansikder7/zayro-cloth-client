"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductFilters } from "@/lib/store-api";

export type SelectedFilters = {
  category: string;
  style: string;
  color: string;
  size: string;
  maxPrice: number;
};

type FiltersPanelProps = {
  facets: ProductFilters;
  filters: SelectedFilters;
  onFilterChange: (filters: SelectedFilters) => void;
  /**
   * When true, applies mobile-friendly touch targets and a sticky footer.
   * When false, markup is identical to the desktop sidebar variant.
   */
  mobile?: boolean;
  resetLabel?: string;
};

export default function FiltersPanel({
  facets,
  filters,
  onFilterChange,
  mobile = false,
  resetLabel = "Reset",
}: FiltersPanelProps) {
  function update(key: keyof SelectedFilters, value: SelectedFilters[typeof key]) {
    onFilterChange({ ...filters, [key]: value });
  }

  function reset() {
    onFilterChange({ category: "", style: "", color: "", size: "", maxPrice: facets.maxPrice });
  }

  const minimumPrice = Math.min(facets.minPrice, facets.maxPrice);
  const maximumPrice = Math.max(facets.minPrice, facets.maxPrice);
  const maxPrice = Math.min(Math.max(filters.maxPrice, minimumPrice), maximumPrice);

  const sections = (
    <>
      <div className="border-b border-border py-4">
        <h3 className="font-medium">Category</h3>
        <ul className="mt-2 flex flex-col text-sm text-muted-foreground">
          {facets.categories.map((category) => (
            <li key={category} className="border-b border-border/70 last:border-0">
              <button
                type="button"
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    category: filters.category === category ? "" : category,
                    style: "",
                  });
                }}
                aria-pressed={filters.category === category}
                className={`flex min-h-11 w-full items-center justify-between py-2 text-left hover:text-foreground ${filters.category === category ? "font-medium text-foreground" : ""}`}
              >
                {category}<ChevronRight className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-border py-4">
        <h3 className="font-medium">Maximum price</h3>
        <input
          type="range"
          min={minimumPrice}
          max={maximumPrice}
          step={5}
          value={maxPrice}
          onChange={(event) => update("maxPrice", Number(event.target.value))}
          aria-label="Maximum price"
          className={`mt-4 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary ${mobile ? "h-1.5 [&::-webkit-slider-thumb]:size-5" : "h-1 [&::-webkit-slider-thumb]:size-4"}`}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>৳{minimumPrice}</span><span>৳{maxPrice}</span></div>
      </div>

      {facets.colors.length > 0 && (
        <div className="border-b border-border py-4">
          <h3 className="font-medium">Color</h3>
          <div className={`mt-3 flex flex-wrap gap-2 ${mobile ? "items-start" : ""}`}>
            {facets.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => update("color", filters.color === color ? "" : color)}
                aria-label={`Color ${color}`}
                aria-pressed={filters.color === color}
                className={`rounded-full border border-border px-3 py-1.5 text-xs transition-colors ${mobile ? "inline-flex items-center justify-center min-w-[40px] min-h-[40px]" : ""} ${filters.color === color ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
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
          <div className={`mt-3 flex flex-wrap gap-2 ${mobile ? "items-start" : ""}`}>
            {facets.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => update("size", filters.size === size ? "" : size)}
                aria-pressed={filters.size === size}
                className={`rounded-full px-3 text-xs ${mobile ? "inline-flex items-center justify-center min-w-[40px] min-h-[40px]" : "min-h-8"} ${filters.size === size ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.styles.length > 0 && (
        <div className={`py-4 ${mobile ? "pb-16" : ""}`}>
          <h3 className="font-medium">Style</h3>
          <ul className={`mt-3 flex flex-col gap-3 text-sm text-muted-foreground ${mobile ? "" : ""}`}>
            {facets.styles.map((style) => (
              <li key={style}>
                <button
                  type="button"
                  onClick={() => {
                  onFilterChange({
                    ...filters,
                    style: filters.style === style ? "" : style,
                    category: "",
                  });
                }}
                  aria-pressed={filters.style === style}
                  className={`flex w-full items-center justify-between hover:text-foreground ${mobile ? "min-h-[44px]" : ""} ${filters.style === style ? "text-foreground" : ""}`}
                >
                  {style}<ChevronRight className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  const footer = (
    <div className="mt-2 flex gap-2">
      <Button type="button" variant="outline" onClick={reset} className="h-11 flex-1 rounded-full">
        {resetLabel}
      </Button>
      <Button type="button" onClick={() => onFilterChange(filters)} className="h-11 flex-1 rounded-full">
        Apply
      </Button>
    </div>
  );

  if (mobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 pb-16">{sections}</div>
        <footer className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-sm pt-4 pb-4">
          {footer}
        </footer>
      </div>
    );
  }

  return (
    <>
      {sections}
      {footer}
    </>
  );
}
