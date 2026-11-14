"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Single reusable breadcrumb used on every page.
// nav > ol, single line (no wrap), separator rendered inside the same li as its item.
export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className={cn("flex flex-nowrap items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href ?? item.label ?? index} className="inline-flex items-center gap-1 min-w-0">
              {item.href ? (
                <Link href={item.href} className="truncate max-w-[260px] hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate max-w-[260px]",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
