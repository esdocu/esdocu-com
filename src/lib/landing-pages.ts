export interface LandingPage {
  path: string;
  title: string;
  locale: string;
}

export const ES_LANDING_PAGES: LandingPage[] = [
  { path: "/biblia-online-gratis", title: "Biblia Online Gratis", locale: "es" },
  { path: "/biblia-reina-valera-online", title: "Biblia Reina Valera Online", locale: "es" },
  { path: "/biblia-sin-internet", title: "Biblia Sin Internet", locale: "es" },
  { path: "/escuchar-la-biblia", title: "Escuchar la Biblia", locale: "es" },
  { path: "/mejor-app-para-leer-la-biblia", title: "Mejor App para leer la Biblia", locale: "es" },
  { path: "/mejor-app-para-leer-libros", title: "Mejor App para leer libros", locale: "es" },
  { path: "/mejor-hosting", title: "El Mejor Hosting", locale: "es" },
  { path: "/mejor-pagina-para-leer-la-biblia", title: "Mejor Página para leer la Biblia", locale: "es" },
];

export function getLandingPagesByLocale(locale: string): LandingPage[] {
  if (locale === "es") {
    return ES_LANDING_PAGES;
  }
  return [];
}
