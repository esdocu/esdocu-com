import ExportedImage from "next-image-export-optimizer";
import { Check, BookOpen, Clock, Heart, Volume2, Search, ArrowRight, BookMarked, Sparkles, Book, FileText, History } from "lucide-react";
import { ForceLightTheme } from "../mejor-pagina-para-leer-la-biblia/force-light-theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblia Reina Valera Online: Dónde Leerla Gratis en 2026",
  description: "Descubre la mejor plataforma para leer la Biblia Reina Valera 1960 online gratis. Sin anuncios, con buscador avanzado y diseño elegante.",
  openGraph: {
    title: "Biblia Reina Valera Online Gratis - Guía 2026",
    description: "Lee la versión más querida por los hispanohablantes (Reina Valera 1960) online, sin distracciones y completamente gratis.",
    type: "website",
    url: "/biblia-reina-valera-online",
  },
};

export default function BibliaReinaValeraPage() {
  return (
    <div className="grow bg-[#FAF9F5] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Biblia Reina Valera Online: Guía 2026",
            "image": "https://esdocu.com/images/veobible-mockup.png",
            "description": "Descubre la mejor plataforma para leer la Biblia Reina Valera 1960 online gratis en español.",
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
            Guía de Versiones 2026
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
                <Book className="h-3.5 w-3.5" />
                La Versión Clásica
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                Lee la Biblia <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Reina Valera Online
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                La Reina Valera 1960 (RVR1960) es la traducción más amada por el pueblo cristiano hispanohablante. Te mostramos el mejor sitio para estudiarla y leerla gratis en internet, libre de distracciones.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#guia-completa"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  Conocer Más
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
                      alt="Biblia Reina Valera"
                      width={380}
                      height={380}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-amber-100/60 flex items-center gap-3 animate-bounce-slow">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">Texto Clásico</p>
                      <p className="text-sm font-extrabold text-slate-900">RVR 1960 Incluida</p>
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
              ¿Por qué la Reina Valera 1960 sigue siendo la favorita?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-16">
              <p>
                Aunque existen docenas de traducciones modernas de las Sagradas Escrituras, la <strong>Biblia Reina Valera 1960</strong> mantiene su lugar como el texto estándar en la mayoría de las congregaciones hispanas. Su riqueza literaria, el uso majestuoso del idioma español y la familiaridad que genera en los creyentes la hacen insustituible.
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
                    Si buscas leer la <strong>Biblia Reina Valera online gratis</strong>, VeoBible es la elección indiscutible. Ha sido diseñada respetando la estética de las biblias impresas clásicas, pero dotada de tecnología moderna.
                  </p>
                  <ul className="space-y-3 mt-6">
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Buscador Ultrarrápido:</strong> Encuentra cualquier pasaje de la RVR1960 en milisegundos.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Sin distracciones comerciales:</strong> Nada de publicidad. Solo tú y el texto bíblico.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Tipografía Serif Clásica:</strong> Experimenta una lectura que honra la solemnidad de esta histórica traducción.</span>
                    </li>
                  </ul>
                  <div className="pt-6">
                    <a
                      href="https://veobible.com/es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm gap-2"
                    >
                      Leer RVR1960 en VeoBible
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Otras herramientas que ofrece VeoBible</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <BookMarked className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Resaltador Avanzado</h4>
                  <p className="text-sm text-slate-600">Subraya los versículos de la Reina Valera con diferentes colores y añade notas personales a cada uno.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
                <Volume2 className="h-8 w-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Audio Incluido</h4>
                  <p className="text-sm text-slate-600">Escucha la narración de los textos clásicos si prefieres el formato de audiolibro.</p>
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
              Regresa a las Escrituras Clásicas
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Experimenta la belleza de la traducción <strong>Reina Valera</strong> en la mejor plataforma web de 2026. <strong className="font-bold text-slate-900">VeoBible</strong> está lista para ti.
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
