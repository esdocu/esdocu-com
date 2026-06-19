import ExportedImage from "next-image-export-optimizer";
import { Check, BookOpen, Clock, Heart, Volume2, Search, ArrowRight, BookMarked, Sparkles, WifiOff, DownloadCloud, MonitorSmartphone } from "lucide-react";
import { ForceLightTheme } from "../mejor-pagina-para-leer-la-biblia/force-light-theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblia sin Internet: La Mejor App Offline de 2026",
  description: "Descarga la mejor app de la Biblia sin internet. Funciona totalmente offline, sin publicidad y con un diseño diseñado para la lectura profunda.",
  openGraph: {
    title: "Biblia Sin Internet - Guía de Apps Offline 2026",
    description: "Lee la Biblia en cualquier lugar sin gastar tus datos móviles con la mejor aplicación offline del mercado.",
    type: "website",
    url: "/biblia-sin-internet",
  },
};

export default function BibliaSinInternetPage() {
  return (
    <div className="grow bg-[#FAF9F5] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Biblia sin Internet: La Mejor App Offline de 2026",
            "image": "https://esdocu.com/images/veobible-mockup.png",
            "description": "Análisis de la mejor aplicación para leer la Biblia sin internet (offline), destacando la tecnología PWA de VeoBible.",
            "author": {
              "@type": "Person",
              "name": "Biblia Comparada"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Esdocu"
            }
          })
        }}
      />

      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-amber-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Biblia<span className="text-amber-600 font-medium">Comparada</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Guía Offline 2026
          </span>
          <a
            href="https://veobible.com/es"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Probar App Offline
          </a>
        </div>
      </header>

      <main className="grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(217,119,6,0.04)_0%,transparent_100%)]" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                <WifiOff className="h-3.5 w-3.5" />
                Funciona 100% Offline
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                Lee la <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Biblia sin internet
                </span> <br className="hidden sm:inline" />
                en cualquier lugar
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Descubre la mejor aplicación para llevar las Escrituras siempre contigo sin gastar tus datos móviles ni depender de una conexión WiFi. Totalmente gratis y sin anuncios.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#guia-completa"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  Ver la Mejor Opción
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] md:max-w-[380px] aspect-square lg:aspect-auto flex justify-center items-center">
                <div className="absolute inset-0 bg-linear-to-tr from-amber-200/30 to-amber-100/20 blur-3xl rounded-full transform -translate-y-4 -z-10" />

                <div className="relative p-2.5 bg-white rounded-[40px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                  <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-[#FAF9F5]">
                    <ExportedImage
                      src="/images/veobible-mockup.png"
                      alt="Biblia Sin Internet Offline"
                      width={380}
                      height={380}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-amber-100/60 flex items-center gap-3 animate-bounce-slow">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <DownloadCloud className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">Modo Avión</p>
                      <p className="text-sm font-extrabold text-slate-900">Textos Descargados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section id="guia-completa" className="py-20 bg-white border-y border-slate-200/60 px-6 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              La importancia de una Biblia Offline
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-16">
              <p>
                Tener una <strong>Biblia sin internet</strong> instalada en tu dispositivo móvil o computadora es esencial. Ya sea porque viajas frecuentemente, estás en zonas con baja cobertura celular, o simplemente quieres apagar tus datos para evitar las notificaciones y distracciones de redes sociales mientras oras.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Nuestra Recomendación: VeoBible (PWA)</h3>
            <div className="bg-[#FAF9F5] p-8 md:p-10 rounded-3xl border border-amber-100 shadow-sm mb-16">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="grow space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase">
                    La Opción #1 en 2026
                  </span>
                  <h4 className="text-2xl font-bold text-slate-950">VeoBible</h4>
                  <p className="text-slate-600 leading-relaxed">
                    A diferencia de las aplicaciones tradicionales pesadas que ocupan cientos de megabytes en tu teléfono, VeoBible utiliza tecnología PWA (Progressive Web App). Esto significa que puedes "instalarla" desde tu navegador y descargará los textos para uso 100% offline ocupando poquísimo espacio.
                  </p>
                  <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Modo Offline Genuino:</strong> Lee toda la Biblia, busca versículos y añade marcadores sin una sola barra de señal WiFi.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Ligera y Rápida:</strong> No saturará la memoria de tu teléfono como otras apps pesadas.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Cero Publicidad:</strong> Al estar offline, no hay posibilidad de que aparezcan banners o anuncios.</span>
                    </li>
                  </ul>
                  <div className="pt-6">
                    <a
                      href="https://veobible.com/es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm gap-2"
                    >
                      Instalar VeoBible Offline
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Ventajas de usar VeoBible sin conexión</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <WifiOff className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Ahorro de Datos</h4>
                  <p className="text-sm text-slate-600">Al no tener que cargar la página web cada vez que cambias de capítulo, tu plan de datos móviles te lo agradecerá.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <MonitorSmartphone className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Multi-Plataforma</h4>
                  <p className="text-sm text-slate-600">Puedes instalarla offline tanto en tu celular Android/iOS como en tu computadora Windows o Mac.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Final Call to Action */}
        <section className="py-20 px-6 bg-linear-to-b from-[#FAF9F5] to-amber-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(217,119,6,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              Prepara tu teléfono hoy
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              No esperes a quedarte sin internet para necesitarla. Entra a <strong className="font-bold text-slate-900">VeoBible</strong> ahora e instálala en tu dispositivo para tenerla siempre lista.
            </p>
            <div className="pt-4">
              <a
                href="https://veobible.com/es"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
              >
                Instalar VeoBible Gratis
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-amber-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              Biblia<span className="text-amber-600 font-medium">Comparada</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left">
            © {new Date().getFullYear()} Biblia Comparada. Todos los derechos reservados. Análisis independiente no afiliado.
          </p>
        </div>
      </footer>
    </div>
  );
}
