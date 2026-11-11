import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import Hero from "@/components/hero";
import BrandStrip from "@/components/brand-strip";
import NewArrivals from "@/components/new-arrivals";
import TopSelling from "@/components/top-selling";
import DressStyle from "@/components/dress-style";
import Reviews from "@/components/reviews";
import SiteFooter from "@/components/site-footer";
import { getProductPage } from "@/lib/store-api";

// Zayro homepage - screenshot er moto: bar + header + hero + brands + products + footer
export default async function Home() {
  const [newArrivals, topSelling] = await Promise.all([
    getProductPage({ collection: "new", limit: 4 }),
    getProductPage({ collection: "top", limit: 4 }),
  ]);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <BrandStrip />
        <NewArrivals products={newArrivals.products} />
        <TopSelling products={topSelling.products} />
        <DressStyle />
        <Reviews />
      </main>
      <SiteFooter />
    </>
  );
}
