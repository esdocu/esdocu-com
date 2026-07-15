export interface LandingPage {
  path: string;
  title: string;
  locale: string;
}

export const ES_LANDING_PAGES: LandingPage[] = [
  { path: "/mejor-hosting", title: "El Mejor Hosting", locale: "es" },
  { path: "/mejor-vps", title: "El Mejor VPS", locale: "es" },
  { path: "/mejor-vpn", title: "La Mejor VPN", locale: "es" },
  { path: "/mejor-hosting-wordpress", title: "El Mejor Hosting WordPress", locale: "es" },
  { path: "/cuanto-cuesta-pagina-web", title: "Cuánto Cuesta una Página Web", locale: "es" },
  { path: "/cuanto-cuesta-una-app", title: "Cuánto Cuesta una App", locale: "es" },
];

export function getLandingPagesByLocale(locale: string): LandingPage[] {
  if (locale === "es") {
    return ES_LANDING_PAGES;
  }
  return [];
}
