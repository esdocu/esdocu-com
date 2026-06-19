"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * AdScript component.
 * Conditionally loads the ads.js script on pages other than the Bible app landing page.
 */
export function AdScript() {
  const pathname = usePathname();

  // Exclude the comparison landing pages from having ads script
  if (
    pathname === "/mejor-app-para-leer-la-biblia" ||
    pathname === "/mejor-pagina-para-leer-la-biblia" ||
    pathname === "/mejor-app-para-leer-libros" ||
    pathname === "/mejor-hosting" ||
    pathname === "/biblia-online-gratis" ||
    pathname === "/biblia-reina-valera-online" ||
    pathname === "/biblia-sin-internet" ||
    pathname === "/escuchar-la-biblia"
  ) {
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
