export interface LandingPage {
  path: string;
  title: string;
  locale: string;
}

export const ES_LANDING_PAGES: LandingPage[] = [
  { path: "/mejor-hosting", title: "El Mejor Hosting", locale: "es" },
  { path: "/mejor-vps", title: "El Mejor VPS", locale: "es" },
  { path: "/mejor-vpn", title: "La Mejor VPN", locale: "es" },
];

export function getLandingPagesByLocale(locale: string): LandingPage[] {
  if (locale === "es") {
    return ES_LANDING_PAGES;
  }
  return [];
}
