import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import CategoryListing from "@/components/category-listing";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const [{ slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const params = searchParams as SearchParams;
  const getParam = (name: string) => {
    const value = params[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const pageValue = Number(getParam("page"));
  const maxPriceValue = Number(getParam("maxPrice"));
  const brand = getParam("brand");
  const title = brand || slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="bg-background">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 md:px-8 lg:px-16 lg:pb-24">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{title}</span>
          </nav>
          <CategoryListing
            slug={slug}
            initialSearch={getParam("q")}
            initialCollection={getParam("collection")}
            initialSort={getParam("sort")}
            initialPage={Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1}
            initialCategory={getParam("category")}
            initialBrand={brand}
            initialStyle={getParam("style")}
            initialColor={getParam("color")}
            initialSize={getParam("size")}
            initialMaxPrice={Number.isFinite(maxPriceValue) && maxPriceValue >= 0 ? maxPriceValue : undefined}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
