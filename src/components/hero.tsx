"use client";

import Link from "next/link";
import { useStorefront } from "@/components/storefront-provider";

function DiamondStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="currentColor">
      <path d="M50 0L64 36L100 50L64 64L50 100L36 64L0 50L36 36L50 0Z" />
    </svg>
  );
}

export default function Hero() {
  const { storefront } = useStorefront();
  const savedHero = storefront?.hero;
  const hero = savedHero?.title?.trim()
    ? savedHero
    : {
        title: "FIND CLOTHES THAT MATCHES YOUR STYLE",
        description:
          "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
        ctaLabel: "Shop Now",
        ctaUrl: "/category/casual",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      };

  const stats = storefront?.heroStats?.length
    ? storefront.heroStats
    : [
        { value: "200+", label: "International Brands" },
        { value: "2,000+", label: "High-Quality Products" },
        { value: "30,000+", label: "Happy Customers" },
      ];

  return (
    <section className="bg-[#f1f0ef] text-[#121212]">
      <div className="mx-auto max-w-[1500px]">
        <div className="overflow-hidden bg-[#f1f0ef] px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
          <div className="relative grid items-center gap-8 lg:min-h-[620px] lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
            <div className="pt-2 lg:pl-2">
              <h1 className="max-w-[620px] font-black uppercase leading-[0.9] tracking-[-0.06em] text-[42px] sm:text-[56px] lg:text-[72px]">
                {hero.title}
              </h1>

              <p className="mt-5 max-w-[560px] text-sm leading-6 text-[#4e4e4e] sm:text-base">
                {hero.description}
              </p>

              {hero.ctaLabel && hero.ctaUrl && (
                <Link
                  href={hero.ctaUrl}
                  className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-7 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
                >
                  {hero.ctaLabel}
                </Link>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:mt-10">
                {stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className={
                      index === 0
                        ? "min-w-[112px]"
                        : index === 1
                          ? "border-l border-[#c5c5c1] pl-4 min-w-[148px]"
                          : "border-l border-[#c5c5c1] pl-4 min-w-[170px]"
                    }
                  >
                    <p className="font-heading text-[26px] font-black leading-none tracking-[-0.05em] sm:text-[30px]">
                      {stat.value}
                    </p>
                    <p className="mt-2 max-w-[150px] text-[13px] leading-5 text-[#4d4d4d] sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <DiamondStar className="absolute right-[8%] top-[9%] size-16 text-[#151515] sm:size-20 lg:size-24" />
              <DiamondStar className="absolute left-[12%] top-[32%] size-9 text-[#151515] sm:size-12" />

              <div className="relative h-[380px] w-[80%] max-w-[520px] overflow-hidden sm:h-[460px] lg:h-[560px]">
                <img
                  src={hero.image}
                  alt={hero.title}
                  className="h-full w-full object-cover object-center grayscale-[0.15]"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
