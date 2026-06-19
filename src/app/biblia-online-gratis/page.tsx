import ExportedImage from "next-image-export-optimizer";
import { Check, BookOpen, Clock, Heart, Volume2, Search, ArrowRight, BookMarked, Sparkles, MonitorSmartphone, WifiOff, Globe } from "lucide-react";
import { ForceLightTheme } from "../mejor-pagina-para-leer-la-biblia/force-light-theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblia Online Gratis: Las Mejores Formas de Leer la Biblia en 2026",
  description: "Descubre cómo leer la Biblia online gratis en español. Conoce las mejores plataformas sin anuncios, con audio y fáciles de usar en cualquier dispositivo.",
  openGraph: {
    title: "Biblia Online Gratis - Guía de Lectura 2026",
    description: "La guía definitiva para leer la Biblia online de forma gratuita y sin distracciones publicitarias.",
    type: "website",
    url: "/biblia-online-gratis",
  },
};

export default function BibliaOnlineGratisPage() {
  return (
    <div className="grow bg-[#FAF9F5] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <ForceLightTheme />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Biblia Online Gratis: Guía Completa 2026",
            "image": "https://esdocu.com/images/veobible-mockup.png",
            "description": "Descubre las mejores plataformas para leer la Biblia online gratis en español, sin anuncios ni distracciones.",
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
            Guía de Lectura 2026
          </span>
          <a
            href="https://veobible.com/es"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Leer Ahora
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
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Actualizado para 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                Cómo leer la <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Biblia online gratis
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Encontrar la plataforma ideal para tu lectura devocional diaria puede ser abrumador. Te mostramos las mejores opciones para acceder a la Biblia en español desde cualquier dispositivo, sin costos ocultos ni publicidad molesta.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#guia-completa"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  Ver Opciones
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
                      alt="Leer la Biblia Online"
                      width={380}
                      height={380}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-amber-100/60 flex items-center gap-3 animate-bounce-slow">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <Globe className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">Acceso Web</p>
                      <p className="text-sm font-extrabold text-slate-900">Rápido y Universal</p>
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
              ¿Por qué leer la Biblia en internet?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-16">
              <p>
                Hoy en día, tener acceso a la <strong>Biblia online gratis</strong> nos permite llevar la Palabra de Dios a cualquier lugar. Ya sea que estés en un descanso en el trabajo usando tu computadora de escritorio o viajando con tu celular, las plataformas web modernas ofrecen una flexibilidad increíble.
              </p>
              <p>
                Sin embargo, no todas las páginas son iguales. Muchas de ellas están saturadas de publicidad invasiva (banners, videos auto-reproducibles) que interrumpen tu momento de meditación. Elegir la herramienta adecuada es crucial para mantener un hábito de lectura saludable.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Nuestra Recomendación: VeoBible</h3>
            <div className="bg-[#FAF9F5] p-8 md:p-10 rounded-3xl border border-amber-100 shadow-sm mb-16">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="grow space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase">
                    La Opción #1 en 2026
                  </span>
                  <h4 className="text-2xl font-bold text-slate-950">VeoBible</h4>
                  <p className="text-slate-600 leading-relaxed">
                    VeoBible ha revolucionado la forma en que los creyentes acceden a las Escrituras. Es una plataforma web completamente gratuita que puedes usar directamente desde tu navegador sin instalar nada.
                  </p>
                  <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>100% Sin Publicidad:</strong> Nada de banners o anuncios molestos. Tu lectura es lo primero.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>No requiere instalación:</strong> Accede al instante desde cualquier PC, tablet o smartphone.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Diseño minimalista:</strong> Tipografía literaria y colores que no cansan la vista.</span>
                    </li>
                  </ul>
                  <div className="pt-6">
                    <a
                      href="https://veobible.com/es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm gap-2"
                    >
                      Empezar a Leer en VeoBible
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Características indispensables en una Biblia Online</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <MonitorSmartphone className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Multidispositivo</h4>
                  <p className="text-sm text-slate-600">Tu progreso, marcadores y notas deben sincronizarse automáticamente entre tu teléfono móvil y tu computadora web.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <Search className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Buscador Inteligente</h4>
                  <p className="text-sm text-slate-600">Encontrar un versículo por palabras clave debe ser rápido y preciso. Una buena herramienta web te permite saltar entre libros al instante.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <Volume2 className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Soporte de Audio</h4>
                  <p className="text-sm text-slate-600">Poder escuchar la Biblia online mientras trabajas o realizas otras tareas es una de las funciones más demandadas por los usuarios actuales.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <WifiOff className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Opción PWA</h4>
                  <p className="text-sm text-slate-600">Las mejores plataformas web permiten "instalar" la página en tu dispositivo para poder acceder a los textos incluso cuando no tienes internet.</p>
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
              Inicia tu lectura hoy mismo
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Descubre una experiencia sin igual. Con <strong className="font-bold text-slate-900">VeoBible</strong>, tienes la mejor herramienta para leer la Biblia online completamente gratis.
            </p>
            <div className="pt-4">
              <a
                href="https://veobible.com/es"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
              >
                Ir a VeoBible.com
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              No requiere tarjeta de crédito ni registro obligatorio
            </div>
          </div>
        </section>
      </main>

      {/* Independent Footer */}
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
