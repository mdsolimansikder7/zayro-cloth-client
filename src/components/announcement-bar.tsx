"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useStorefront } from "@/components/storefront-provider";

// Top er black promotional bar - X button e click korle hide hoye jay
export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: session, isPending } = useSession();
  const { storefront } = useStorefront();
  const announcement = storefront?.announcement;

  // close kore dile pura bar tai remove
  if (!isVisible || !announcement?.text) return null;

  return (
    <div className="relative bg-primary px-12 py-2 text-center text-[11px] text-primary-foreground md:text-sm">
      <p>
        {session?.user || isPending ? (
          announcement.text
        ) : (
          <>
            {announcement.text}{" "}
            {announcement.linkText && announcement.linkUrl && <Link href={announcement.linkUrl} className="font-medium underline underline-offset-2 hover:opacity-80">{announcement.linkText}</Link>}
          </>
        )}
      </p>

      {/* close button */}
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
