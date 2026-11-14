"use client";

import Newsletter from "@/components/newsletter";
import { useStorefront } from "@/components/storefront-provider";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

function SocialIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase();
  if (normalized === "instagram") {
    return <FaInstagram className="size-5" aria-hidden="true" />;
  }
  if (normalized === "facebook") {
    return <FaFacebookF className="size-[18px]" aria-hidden="true" />;
  }
  return <FaXTwitter className="size-[18px]" aria-hidden="true" />;
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
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 py-10 sm:gap-8 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-6 lg:py-12">
          <div className="col-span-3 lg:col-span-1">
            <Link href="/" className="font-heading text-2xl tracking-tight lg:text-[32px]">ZAYRO</Link>
            {storefront.brandDescription && <p className="mt-3 max-w-[250px] text-xs leading-5 text-muted-foreground">{storefront.brandDescription}</p>}
            <div className="mt-5 flex items-center gap-3">
              {storefront.socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name.toLowerCase() === "twitter" ? "X" : social.name}
                  className="flex size-10 items-center justify-center rounded-full border border-black/10 text-foreground transition-all duration-200 hover:scale-105 hover:bg-black hover:text-white dark:border-white/15 dark:hover:bg-white dark:hover:text-black"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h3 className="text-xs font-medium uppercase tracking-[0.15em]">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((item, index) => {
                  const link = linkDetails(item);
                  return <li key={`${link.label}-${index}`}>{link.url ? <a href={link.url} className="text-sm leading-5 text-muted-foreground hover:text-foreground">{link.label}</a> : <span className="text-sm leading-5 text-muted-foreground">{link.label}</span>}</li>;
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
