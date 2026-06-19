"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { ES_LANDING_PAGES } from "@/lib/landing-pages";

/**
 * AdScript component.
 * Conditionally loads the ads.js script on pages other than the Bible app landing page.
 */
export function AdScript() {
  const pathname = usePathname();

  // Exclude the comparison landing pages from having ads script
  const isLandingPage = ES_LANDING_PAGES.some((page) => page.path === pathname);
  
  if (isLandingPage) {
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
