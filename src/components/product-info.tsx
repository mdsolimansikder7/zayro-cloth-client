"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import Stars from "@/components/stars";
import type { Product } from "@/types/product";
import { useAccountData } from "@/components/account-data-provider";
import { useSession } from "@/lib/auth-client";
import { useCartData } from "@/components/cart-data-provider";
import { formatMoney } from "@/lib/format-money";

// Details page er dan pash: name, rating, price, color, size, quantity, Add to Cart
export default function ProductInfo({ product }: { product: Product }) {
  // kon color ar size selected (0 mane prothom ta)
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes.length > 2 ? 2 : 0);
  const [quantity, setQuantity] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlistSlugs, saveWishlist } = useAccountData();
  const { addItem } = useCartData();
  const [isAdding, setIsAdding] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
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

  async function handleAddToCart() {
    if (!session?.user) {
      setLoginDialogOpen(true);
      return;
    }
    const color = product.colors[selectedColor];
    const size = product.sizes[Math.min(selectedSize, product.sizes.length - 1)];
    if (!color || !size) {
      toast.add({ title: "Product options unavailable", type: "error" });
      return;
    }
    setIsAdding(true);
    try {
      await addItem({ productSlug: product.slug, size, color, quantity });
      toast.add({
        title: "Added to cart",
        description: `${product.title} added to your cart.`,
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Could not add to cart",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      <div>
      {/* product name */}
      <h1 className="font-heading text-3xl uppercase leading-tight tracking-tight lg:text-[40px]">
        {product.title}
      </h1>

      {/* rating */}
      <div className="mt-3 flex items-center gap-2">
        <Stars rating={product.rating} size="md" />
        <span className="text-sm text-muted-foreground">{product.rating}/5</span>
      </div>

      {/* price + old price + discount */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold lg:text-3xl">{formatMoney(product.price)}</span>

        {product.oldPrice && (
          <span className="text-2xl font-bold text-muted-foreground line-through lg:text-3xl">
            {formatMoney(product.oldPrice)}
          </span>
        )}

        {product.discount && (
          <span className="rounded-full bg-[#FF3333]/10 px-3 py-1 text-sm font-medium text-[#FF3333]">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* description */}
      <p className="mt-4 border-b border-border pb-5 text-sm leading-6 text-muted-foreground">
        {product.description}
      </p>

      {/* color choose */}
      <div className="border-b border-border py-5">
        <p className="text-sm text-muted-foreground">Select Colors</p>
        <div className="mt-3 flex items-center gap-3">
          {product.colors.map((color, index) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(index)}
              aria-label={`Color ${index + 1}`}
              style={{ backgroundColor: color }}
              className={`size-9 rounded-full ${
                selectedColor === index
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "ring-1 ring-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* size choose */}
      <div className="border-b border-border py-5">
        <p className="text-sm text-muted-foreground">Choose Size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size, index) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(index)}
              className={`h-10 rounded-full px-5 text-sm ${
                selectedSize === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* quantity + add to cart */}
      <div className="mt-5 flex items-center gap-3">
        {/* quantity: - shongkha + */}
        <div className="flex h-12 items-center gap-3 rounded-full bg-muted px-4">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-4 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity(quantity + 1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* add to cart button */}
        <Button
          onClick={() => void handleAddToCart()}
          disabled={isAdding}
          className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-60"
        >
          {isAdding ? "Adding…" : "Add to Cart"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isSaved}
          onClick={toggleWishlist}
          className="size-12 rounded-full"
        >
          <Heart className={`size-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      </div>
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to add items</DialogTitle>
            <DialogDescription>
              Please sign in or create an account before adding products to your cart.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLoginDialogOpen(false)}>
              Continue browsing
            </Button>
            <Button type="button" onClick={() => router.push("/sign-in")}>
              Sign in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
