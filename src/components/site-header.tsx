// src/components/site-header.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import ThemeToggle from "@/components/theme-toggle";
import { useStorefront } from "@/components/storefront-provider";
import { useCartData } from "@/components/cart-data-provider";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: session, isPending } = useSession();
  const { storefront } = useStorefront();
  const { cart } = useCartData();
  const navLinks = storefront?.navigation ?? [];
  const router = useRouter();
  const accountName = session?.user?.name?.trim() || session?.user?.email?.trim() || "User";
  const accountInitials = accountName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleAccountClick = () => {
    if (session?.user) {
      router.push("/profile");
    } else {
      router.push("/sign-in");
    }
  };

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    setIsMenuOpen(false);
    router.push(`/category/casual?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background transition-colors">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:h-20 md:gap-8 md:px-8 lg:px-16">
        {/* mobile menu button */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:opacity-70 md:hidden"
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* logo */}
        <Link href="/" className="font-heading text-2xl tracking-tight md:text-[32px]">
          ZAYRO
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium hover:text-muted-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* search bar - desktop */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 md:block lg:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for products..."
            className="h-12 rounded-full border-transparent bg-muted pl-11 text-sm placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0"
          />
        </form>

        {/* icons */}
        <div className="ml-auto flex items-center gap-4">
          {/* mobile search */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:opacity-70 md:hidden"
          >
            <Search className="size-5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Cart"}
            className="relative hover:opacity-70"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={session?.user ? "Open profile dashboard" : isPending ? "Checking account" : "Sign in"}
            title={session?.user ? "Profile dashboard" : isPending ? "Checking account" : "Sign in"}
            disabled={isPending}
            className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={handleAccountClick}
          >
            {session?.user ? (
              <Avatar className="size-9 border border-border bg-muted">
                <AvatarImage src={session.user.image ?? undefined} alt={`${accountName}'s avatar`} />
                <AvatarFallback>{accountInitials}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full border border-border">
                <User className="size-5" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden transition-colors">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for products..."
              className="h-11 rounded-full bg-muted pl-11 text-sm placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0"
            />
          </form>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-base font-medium">
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-base font-medium"
              >
                <LayoutDashboard className="size-4" />
                Profile dashboard
              </Link>
            ) : !isPending ? (
              <Link
                href="/sign-up"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium"
              >
                Sign Up
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
