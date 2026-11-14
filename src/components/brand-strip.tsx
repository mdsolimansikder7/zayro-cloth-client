"use client";

import { useStorefront } from "@/components/storefront-provider";
import Link from "next/link";

export default function BrandStrip() {
  const { storefront } = useStorefront();
  const brands = storefront?.brands ?? [];
  if (brands.length === 0) return null;

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1440px] items-center justify-start gap-8 overflow-x-auto px-4 py-6 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-5 sm:overflow-visible sm:py-8 md:justify-between md:px-8 lg:px-16 lg:py-10 [&::-webkit-scrollbar]:hidden">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            href={`/category/brand?brand=${encodeURIComponent(brand.name)}`}
            className={`shrink-0 text-xl sm:text-2xl lg:text-[32px] ${(brand.style ?? "").includes("serif") ? "font-serif" : "font-sans"} ${(brand.style ?? "").includes("bold") ? "font-black" : "font-medium"} ${(brand.style ?? "").includes("wide") ? "tracking-wide" : "tracking-tight"}`}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
