"use client";

import { SlidersHorizontal } from "lucide-react";
import FiltersPanel, { type SelectedFilters } from "@/components/filters-panel";
import type { ProductFilters } from "@/lib/store-api";

export type { SelectedFilters } from "@/components/filters-panel";

export default function CategoryFilters({
  facets,
  initialFilters,
  onApply,
}: {
  facets: ProductFilters;
  initialFilters: SelectedFilters;
  onApply: (filters: SelectedFilters) => void;
}) {
  return (
    <aside className="hidden lg:block w-full rounded-[18px] border border-border bg-background p-4 lg:sticky lg:top-24 lg:rounded-[20px] lg:p-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="font-medium">Filters</h2>
        <SlidersHorizontal className="size-4 text-muted-foreground" />
      </div>
      <FiltersPanel facets={facets} filters={initialFilters} onFilterChange={onApply} />
    </aside>
  );
}
