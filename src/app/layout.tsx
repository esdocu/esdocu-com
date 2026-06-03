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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://esdocu.com"),
  title: {
    template: "%s | Esdocu",
    default: "Esdocu - Aprende Tecnología en tu Idioma",
  },
  description: "Documentación técnica de alta calidad traducida al español. Bootstrap, Moment.js y más.",
  openGraph: {
    title: "Esdocu - Documentación en Español",
    description: "Documentación técnica de alta calidad traducida al español. Bootstrap, Moment.js y más.",
    url: "/",
    siteName: "Esdocu",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Esdocu - Documentación en Español",
    description: "Documentación técnica de alta calidad traducida al español.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
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
