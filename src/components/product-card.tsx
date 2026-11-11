"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import Stars from "@/components/stars";
import type { Product } from "@/types/product";
import { useAccountData } from "@/components/account-data-provider";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/format-money";

// Ekta product card - New Arrivals ar Top Selling duitatei ei card ta use hoy
// card e click korle oi product er details page khule jay
export default function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlistSlugs, saveWishlist } = useAccountData();
  const isSaved = wishlistSlugs.includes(product.slug);

  async function toggleWishlist() {
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    try {
      await saveWishlist(
        isSaved
          ? wishlistSlugs.filter((slug) => slug !== product.slug)
          : [...wishlistSlugs, product.slug],
      );
      toast.add({
        title: isSaved ? "Removed from wishlist" : "Added to wishlist",
        description: product.title,
        type: "success",
      });
    } catch {
      toast.add({
        title: "Wishlist update failed",
        description: "Please try again.",
        type: "error",
      });
    }
  }

  return (
    <article className="relative">
      <button
        type="button"
        aria-label={isSaved ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
        aria-pressed={isSaved}
        onClick={toggleWishlist}
        className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Heart className={`size-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
      </button>
      <Link href={`/product/${product.slug}`} className="group block">
        {/* product image - card er background #F0EEED (image er background o same) */}
        <div className="overflow-hidden rounded-[20px] bg-muted">
          <div className="relative aspect-square">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* product name */}
        <h3 className="mt-4 truncate text-sm font-semibold sm:text-base">
          {product.title}
        </h3>
      </Link>

      {/* rating + number (4.5/5) */}
      <div className="mt-1.5 flex items-center gap-2">
        <Stars rating={product.rating} />
        <span className="text-xs text-muted-foreground">{product.rating}/5</span>
      </div>

      {/* price row: notun dam, purano dam kete, discount badge */}
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold sm:text-xl">{formatMoney(product.price)}</span>

        {product.oldPrice && (
          <span className="text-lg font-bold text-muted-foreground line-through sm:text-xl">
            {formatMoney(product.oldPrice)}
          </span>
        )}

        {product.discount && (
          <span className="rounded-full bg-[#FF3333]/10 px-2 py-0.5 text-[11px] font-medium text-[#FF3333]">
            -{product.discount}%
          </span>
        )}
      </div>
    </article>
  );
}
