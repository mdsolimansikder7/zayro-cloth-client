"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Stars from "@/components/stars";
import { apiFetch, type ProductReview } from "@/lib/store-api";
import { useStorefront } from "@/components/storefront-provider";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

const tabs = ["Product Details", "Rating & Reviews", "FAQs"];
type ReviewSort = "latest" | "highest" | "lowest";

function ReviewCard({ review }: { review: ProductReview }) {
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <article className="flex flex-col rounded-[20px] border border-border p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <Stars rating={review.rating} size="md" />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-base font-bold">
        {review.author}
        <BadgeCheck className="size-4 fill-[#01AB31] text-white" />
      </p>
      <p className="mt-2 text-sm font-medium">{review.title}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{review.text}</p>
      <p className="mt-4 text-xs text-muted-foreground">{date}</p>
    </article>
  );
}

export default function ProductTabs({
  productId,
  description,
  rating,
  reviews: initialReviews,
}: {
  productId: string;
  description: string;
  rating: number;
  reviews: ProductReview[];
}) {
  const [activeTab, setActiveTab] = useState("Rating & Reviews");
  const [visibleReviews, setVisibleReviews] = useState(6);
  const [sort, setSort] = useState<ReviewSort>("latest");
  const [reviews, setReviews] = useState(initialReviews);
  const [currentRating, setCurrentRating] = useState(rating);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { storefront } = useStorefront();
  const { data: session } = useSession();
  const router = useRouter();

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((a, b) => {
        if (sort === "highest") return b.rating - a.rating;
        if (sort === "lowest") return a.rating - b.rating;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }),
    [reviews, sort],
  );

  return (
    <div>
      <div className="grid grid-cols-3 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 pb-3 text-center text-xs sm:text-sm lg:text-base ${
              activeTab === tab
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Rating & Reviews" && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold lg:text-2xl">
              All Reviews{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({reviews.length})
              </span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {currentRating > 0 ? `${currentRating}/5 average` : ""}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as ReviewSort)}
                  aria-label="Sort reviews"
                  className="h-10 appearance-none rounded-full bg-background pl-4 pr-9 text-sm ring-1 ring-border focus:outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button type="button" onClick={() => {
                if (!session?.user) {
                  router.push("/sign-in");
                  return;
                }
                setShowReviewForm((visible) => !visible);
              }} className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                {showReviewForm ? "Cancel" : "Write a Review"}
              </Button>
            </div>
          </div>

          {showReviewForm && (
            <form onSubmit={async (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              setIsSubmittingReview(true);
              const form = event.currentTarget;
              const formData = new FormData(form);
              const nextReview = {
                rating: Number(formData.get("rating")),
                title: String(formData.get("title") ?? "").trim(),
                text: String(formData.get("text") ?? "").trim(),
              };
              try {
                const result = await apiFetch(`products/${encodeURIComponent(productId)}/reviews`, {
                  method: "POST",
                  body: JSON.stringify(nextReview),
                }) as { review: ProductReview };
                const updatedReviews = [result.review, ...reviews];
                setReviews(updatedReviews);
                setCurrentRating(Math.round(((currentRating * reviews.length + result.review.rating) / (reviews.length + 1)) * 10) / 10);
                setShowReviewForm(false);
                toast.add({ title: "Review submitted", type: "success" });
              } catch (error) {
                toast.add({ title: "Could not submit review", description: error instanceof Error ? error.message : "Please try again.", type: "error" });
              } finally {
                setIsSubmittingReview(false);
              }
            }} className="mt-5 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">Rating
                <select name="rating" required defaultValue="5" className="h-10 w-full rounded-lg border border-border bg-background px-3">
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium">Title
                <input name="title" required maxLength={100} className="h-10 w-full rounded-lg border border-border bg-background px-3" />
              </label>
              <label className="space-y-1 text-sm font-medium sm:col-span-2">Your review
                <textarea name="text" required maxLength={2000} rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              <Button type="submit" disabled={isSubmittingReview} className="rounded-full sm:col-span-2 sm:justify-self-end">{isSubmittingReview ? "Submitting…" : "Submit review"}</Button>
            </form>
          )}

          {sortedReviews.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {sortedReviews.slice(0, visibleReviews).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No reviews yet.
            </p>
          )}

          {visibleReviews < sortedReviews.length && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleReviews(visibleReviews + 4)}
                className="h-12 rounded-full border-border px-10 text-base font-medium hover:bg-primary hover:text-primary-foreground"
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "Product Details" && (
        <div className="mt-5 text-sm leading-6 text-muted-foreground">
          {description}
        </div>
      )}

      {activeTab === "FAQs" && (
        <div className="mt-5 flex flex-col gap-4 text-sm">
          {(storefront?.faqs ?? []).map((faq, index) => (
            <div key={`${faq.question}-${index}`}>
              <p className="font-medium">{faq.question}</p>
              <p className="mt-1 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
          {storefront?.faqs.length === 0 && <p className="text-muted-foreground">No FAQs have been added yet.</p>}
        </div>
      )}
    </div>
  );
}
