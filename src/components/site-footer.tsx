"use client";

import Newsletter from "@/components/newsletter";
import { useStorefront } from "@/components/storefront-provider";
import Link from "next/link";

function SocialIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase();
  if (normalized === "instagram") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>;
  }
  if (normalized === "facebook") {
    return <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" /></svg>;
  }
  return <span aria-hidden="true" className="text-xs font-semibold">{name.slice(0, 1).toUpperCase()}</span>;
}

function linkDetails(link: string | { label: string; url: string }) {
  return typeof link === "string" ? { label: link, url: "" } : link;
}

export default function SiteFooter({ showNewsletter = true }: { showNewsletter?: boolean }) {
  const { storefront } = useStorefront();
  if (!storefront) return null;
  const footerColumns = [
    { title: "Company", links: storefront.companyLinks },
    { title: "Help", links: storefront.helpLinks },
    { title: "FAQ", links: storefront.faqLinks },
  ];

  return (
    <footer className="bg-muted">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-16">
        {showNewsletter && <div className="-mt-4 lg:-mt-10"><Newsletter /></div>}
        <div className="grid gap-8 py-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-6 lg:py-12">
          <div>
            <Link href="/" className="font-heading text-2xl tracking-tight lg:text-[32px]">ZAYRO</Link>
            {storefront.brandDescription && <p className="mt-3 max-w-[250px] text-xs leading-5 text-muted-foreground">{storefront.brandDescription}</p>}
            <div className="mt-5 flex items-center gap-2">
              {storefront.socialLinks.map((social) => (
                <a key={social.name} href={social.url} aria-label={social.name} className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground">
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-medium uppercase tracking-[0.15em]">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((item, index) => {
                  const link = linkDetails(item);
                  return <li key={`${link.label}-${index}`}>{link.url ? <a href={link.url} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</a> : <span className="text-sm text-muted-foreground">{link.label}</span>}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">{storefront.copyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
