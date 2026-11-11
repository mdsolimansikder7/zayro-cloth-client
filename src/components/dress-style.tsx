"use client";

import Image from "next/image";
import Link from "next/link";
import { useStorefront } from "@/components/storefront-provider";

const spanClasses: Record<number, string> = {
  1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4",
  5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8",
  9: "lg:col-span-9", 10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12",
};

export default function DressStyle() {
  const { storefront } = useStorefront();
  const styles = storefront?.dressStyles ?? [];
  if (styles.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 md:px-8 lg:px-16 lg:pb-16">
        <div className="rounded-[24px] bg-muted px-4 py-8 sm:rounded-[32px] md:px-6 lg:px-16 lg:py-16">
          <h2 className="text-center font-heading text-[32px] uppercase leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            Browse By Dress Style
          </h2>
          <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2 lg:mt-10 lg:grid-cols-12 lg:gap-4">
            {styles.map((style) => {
              const span = Number(style.span.match(/col-span-(\d+)/)?.[1] ?? 6);
              return (
                <Link
                  key={style.name}
                  href={`/category/casual?style=${encodeURIComponent(style.name)}`}
                  className={`relative h-[190px] overflow-hidden rounded-[20px] bg-background sm:h-[240px] lg:h-[290px] ${spanClasses[Math.min(Math.max(span, 1), 12)]}`}
                >
                  <Image
                    src={style.image}
                    alt={`${style.name} style`}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={`object-cover ${style.flip ? "-scale-x-100" : ""}`}
                  />
                  <span className="absolute left-5 top-4 text-xl font-semibold sm:text-2xl lg:left-9 lg:top-7 lg:text-3xl">
                    {style.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
