"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * AdScript component.
 * Conditionally loads the ads.js script on pages other than the Bible app landing page.
 */
export function AdScript() {
  const pathname = usePathname();

  // Exclude the Bible comparison landing page from having ads script
  if (pathname === "/mejor-app-para-leer-la-biblia") {
    return null;
  }

  // Only render if enable ads is active
  if (process.env.NEXT_PUBLIC_ENABLE_ADS !== "true") {
    return null;
  }

  return (
    <Script
      src={
        process.env.NODE_ENV === "development"
          ? "http://localhost:8787/ads.js"
          : "https://static-ads.xeost.com/ads.js"
      }
      strategy="afterInteractive"
    />
  );
}
