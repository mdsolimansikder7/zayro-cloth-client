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
// nav > ol, single line (no wrap). The chevron separator lives inside the li,
// right before the next label, so nothing can wrap to a new line.
export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn("flex flex-nowrap items-center gap-1.5 text-sm overflow-hidden whitespace-nowrap text-muted-foreground", className)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href ?? item.label ?? index} className="flex items-center gap-1.5 min-w-0">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    !isLast ? "flex-shrink-0" : "",
                    "truncate transition-colors hover:text-foreground",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    !isLast ? "flex-shrink-0" : "",
                    "truncate",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-4 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
