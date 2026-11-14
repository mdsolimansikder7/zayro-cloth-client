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
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex w-full flex-nowrap items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href ?? item.label ?? index} className={cn("inline-flex items-center gap-1.5 shrink-0", isLast && "min-w-0 flex-1")}>
              {index > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    isLast && "min-w-0 truncate",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast && "min-w-0 truncate",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
