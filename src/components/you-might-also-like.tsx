import ProductCard from "@/components/product-card";
import type { Product } from "@/types/product";

// Details page er niche "You Might Also Like" section
export default function YouMightAlsoLike({ products }: { products: Product[] }) {
  const relatedProducts = products.filter(
    (product) => product.collection === "related",
  );

  return (
    <section className="bg-background">
      <h2 className="text-center font-heading text-[32px] uppercase leading-none tracking-tight sm:text-4xl lg:text-5xl">
        You Might Also Like
      </h2>

      {/* 2 column mobile e, 4 column desktop e */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:mt-10 lg:grid-cols-4 lg:gap-5">
        {relatedProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
