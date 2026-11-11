"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Star } from "lucide-react";
import { getLatestReviews, type ProductReview } from "@/lib/store-api";

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article className="w-full shrink-0 snap-start rounded-[20px] border border-border p-5 sm:w-[360px] lg:w-[400px] lg:p-7">
      <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`size-4 ${n <= review.rating ? "fill-[#FFC633] text-[#FFC633]" : "text-muted-foreground"}`} />
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-base font-bold">
        {review.author}
        <BadgeCheck className="size-4 fill-[#01AB31] text-white" />
      </p>
      {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{review.text}</p>
      {review.productTitle && <p className="mt-3 text-xs text-muted-foreground">Review for {review.productTitle}</p>}
    </article>
  );
}

export default function Reviews() {
  const slider = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getLatestReviews()
      .then((items) => {
        if (active) setReviews(items);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load reviews.");
      });
    return () => {
      active = false;
    };
  }, []);

  function scrollCards(dir: number) {
    slider.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  }

  if (error || reviews.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8 lg:px-16 lg:pb-28">
        <div className="flex items-start justify-between gap-4 lg:items-center">
          <h2 className="font-heading text-[30px] uppercase leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            Our Happy Customers
          </h2>
          <div className="flex shrink-0 items-center gap-4">
            <button type="button" aria-label="Previous reviews" onClick={() => scrollCards(-1)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="size-6" /></button>
            <button type="button" aria-label="Next reviews" onClick={() => scrollCards(1)} className="text-muted-foreground hover:text-foreground"><ArrowRight className="size-6" /></button>
          </div>
        </div>
        <div ref={slider} className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:mt-9 [&::-webkit-scrollbar]:hidden">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
    </section>
  );
}
