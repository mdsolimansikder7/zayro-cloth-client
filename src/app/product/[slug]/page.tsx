import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ProductGallery from "@/components/product-gallery";
import ProductInfo from "@/components/product-info";
import ProductTabs from "@/components/product-tabs";
import YouMightAlsoLike from "@/components/you-might-also-like";
import {
  getProductBySlug,
  getProductReviews,
  getProductPage,
} from "@/lib/store-api";

// Product details page - URL: /product/one-life-graphic-t-shirt
export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  // URL theke slug ber kora (example: one-life-graphic-t-shirt)
  const { slug } = await props.params;

  // oi slug er product khuje ber kora
  const product = await getProductBySlug(slug);

  // product na paile 404 page dekhabe
  if (!product) notFound();

  const [relatedProductPage, productReviewData] = await Promise.all([
    getProductPage({ collection: "related", limit: 4 }),
    getProductReviews(product._id),
  ]);

  const categoryHref = `/category/${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, "-"))}`;

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />

      <main className="bg-background">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 md:px-8 lg:px-16 lg:pb-24">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href={categoryHref} className="hover:text-foreground">{product.category}</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{product.title}</span>
          </nav>

          {/* bame gallery, daane product info */}
          <div className="mt-5 grid gap-8 lg:grid-cols-[45%_1fr] lg:gap-10">
            <ProductGallery images={product.images} title={product.title} />
            <ProductInfo product={product} />
          </div>

          {/* Product Details / Rating & Reviews / FAQs tabs */}
          <div className="mt-10 lg:mt-14">
            <ProductTabs
              productId={product._id}
              description={product.description}
              rating={productReviewData.rating}
              reviews={productReviewData.reviews}
            />
          </div>

          {/* You Might Also Like - related product card gula */}
          <div className="mt-12 lg:mt-20">
            <YouMightAlsoLike products={relatedProductPage.products} />
          </div>
        </div>
      </main>

      <SiteFooter showNewsletter={false} />
    </>
  );
}
