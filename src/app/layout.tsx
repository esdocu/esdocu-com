import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AdScript } from "@/components/ad-script";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { getDictionary, getLocale } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  const locale = getLocale();
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://esdocu.com"),
    title: {
      template: dict.layout.titleTemplate,
      default: dict.layout.defaultTitle,
    },
    description: dict.layout.description,
    openGraph: {
      title: dict.layout.ogTitle,
      description: dict.layout.description,
      url: "/",
      siteName: "Esdocu",
      locale: locale === 'es' ? 'es_ES' : (locale === 'fr' ? 'fr_FR' : locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.layout.twitterTitle,
      description: dict.layout.description,
    },
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        {process.env.NODE_ENV === "production" && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-YPEZ7EJ1LQ"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-YPEZ7EJ1LQ');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <AdScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
