import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/announcement-bar";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Cart from "@/components/cart";

// Cart page - URL: /cart
export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />

      <main className="bg-background">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 md:px-8 lg:px-16 lg:pb-24">
          {/* breadcrumb: Home > Cart */}
          <nav className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Cart</span>
          </nav>

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
