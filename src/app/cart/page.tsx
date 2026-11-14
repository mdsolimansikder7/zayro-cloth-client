import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Cart from "@/components/cart";
import Breadcrumb from "@/components/breadcrumb";

// Cart page - URL: /cart
export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />

      <main className="bg-background">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 md:px-8 lg:px-16 lg:pb-24">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", current: true }]} />

          {/* page title */}
          <h1 className="mt-3 font-heading text-[32px] uppercase tracking-tight lg:text-5xl">
            Your Cart
          </h1>

          <Cart />
        </div>
      </main>

      <SiteFooter showNewsletter={false} />
    </>
  );
}
