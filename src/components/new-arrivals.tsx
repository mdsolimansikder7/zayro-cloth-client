import Link from "next/link";
import ProductCard from "@/components/product-card";
import type { Product } from "@/types/product";

export default function NewArrivals({ products }: { products: Product[] }) {
  const newArrivals = products.filter((product) => product.collection === "new");
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 lg:px-16 lg:py-16">
        {/* section title */}
        <h2 className="text-center font-heading text-[32px] uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
          New Arrivals
        </h2>

        {/* 2 column mobile e, 4 column desktop e */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:mt-10 lg:grid-cols-4 lg:gap-5">
          {newArrivals.map((product) => (
            <div key={product.slug}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All button - majhkhane */}
        <div className="mt-8 flex justify-center lg:mt-10">
          <Link href="/category/casual?collection=new" className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-14 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto lg:h-12 lg:text-base">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
