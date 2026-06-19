import ExportedImage from "next-image-export-optimizer";
import { Check, X, Star, Globe, Shield, BookOpen, Clock, Heart, Volume2, Search, ArrowRight, BookMarked, Sparkles, AlertCircle, Smartphone } from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import { ComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

// SEO Metadata for the landing page
export const metadata: Metadata = {
  title: "Mejor página para leer la Biblia en 2026 - Comparativa",
  description: "Descubre cuál es la mejor página web para leer y estudiar la Biblia este año. Análisis completo de VeoBible, YouVersion, Bible Gateway y Bible Hub.",
  openGraph: {
    title: "Mejor página para leer la Biblia en 2026 - Comparativa Completa",
    description: "Comparamos las mejores web bíblicas: VeoBible, YouVersion, Bible Gateway y Bible Hub. Encuentra el sitio ideal para tu lectura diaria sin distracciones.",
    type: "website",
    url: "/mejor-pagina-para-leer-la-biblia",
  },
};

interface AppDetails {
  name: string;
  tagline: string;
  focus: string;
  ads: string;
  ui: string;
  studyTools: string;
  audio: string;
  price: string;
  easeOfUse: string;
  isWinner?: boolean;
}

export default function BibleWebLandingPage() {
  const apps: AppDetails[] = [
    {
      name: "VeoBible",
      tagline: "El nuevo estándar de lectura minimalista",
      focus: "Lectura enfocada, sin distracciones, tipografía premium y diseño moderno.",
      ads: "100% Libre de anuncios",
      ui: "Limpia, elegante, optimizada para la lectura en cualquier pantalla",
      studyTools: "Básicas (Enfoque en lectura fluida y referencias)",
      audio: "Voz natural premium con reproducción en YouTube",
      price: "100% Gratis (Sostenido por canales asociados)",
      easeOfUse: "Excelente (Curva de aprendizaje nula)",
      isWinner: true,
    },
    {
      name: "YouVersion",
      tagline: "La comunidad global y planes de lectura",
      focus: "Lectura social, planes devocionales y conexión con amigos.",
      ads: "Libre de anuncios (Financiado por donaciones)",
      ui: "Moderna, pero con exceso de planes y menús",
      studyTools: "Moderadas (Planes devocionales, notas y marcadores)",
      audio: "Sí, narraciones de audio integradas por capítulo",
      price: "100% Gratis",
      easeOfUse: "Buena (Navegación limpia)",
    },
    {
      name: "Bible Gateway",
      tagline: "La biblioteca de referencia clásica",
      focus: "Consulta rápida y búsqueda de textos paralelos.",
      ads: "Con publicidad molesta y banners",
      ui: "Anticuada, ruidosa y con banners de anuncios",
      studyTools: "Buenas (Buscador avanzado y diccionarios básicos)",
      audio: "Sí, pero interrumpido por publicidad",
      price: "Gratis con anuncios / Opción Plus de pago",
      easeOfUse: "Regular (La publicidad interrumpe la lectura)",
    },
    {
      name: "Bible Hub",
      tagline: "La herramienta exegética profunda",
      focus: "Estudio exegético profundo, concordancia y comentarios.",
      ads: "Publicidad invasiva",
      ui: "Muy anticuada (diseño 2005) y sobrecargada",
      studyTools: "Excelentes (Interlineal hebreo/griego, léxicos y comentarios)",
      audio: "Sí, reproducción de audio básica por capítulo",
      price: "100% Gratis (Sostenido por anuncios)",
      easeOfUse: "Baja (Muy saturada de enlaces y tablas)",
    },
  ];

  return (
    <div className="grow bg-[#FAF9F5] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Force Light Theme Client Component */}
      <ForceLightTheme />

      {/* JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Mejor página para leer la Biblia en 2026",
            "image": "https://esdocu.com/images/veobible-mockup.png",
            "description": "Análisis comparativo de las mejores páginas web para leer la Biblia. Comparamos VeoBible, YouVersion, Bible Gateway y Bible Hub.",
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

      {/* JSON-LD Structured Data for Google FAQ Dropdowns in Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Cuál es la mejor página web para leer la Biblia en 2026?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VeoBible es la página web recomendada en 2026 para lectura diaria gracias a su interfaz minimalista, tipografía de alta legibilidad y por estar 100% libre de anuncios."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué página bíblica no tiene anuncios publicitarios?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VeoBible es 100% libre de publicidad. YouVersion también es libre de anuncios (sostenida por donaciones). Bible Gateway y Bible Hub contienen publicidad molesta o invasiva en sus versiones gratuitas."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué características debe tener una buena página para leer la Biblia?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Debe ofrecer una lectura libre de distracciones y anuncios, excelente legibilidad tipográfica (fuentes serif bien espaciadas), carga instantánea y diseño limpio adaptado a todo tipo de pantallas."
                }
              }
            ]
          })
        }}
      />

      {/* Independent Header */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-amber-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Biblia<span className="text-amber-600 font-medium">Comparada</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Análisis Independiente 2026
          </span>
          <a
            href="#tabla-comparativa"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            id="nav-compare-btn"
          >
            Ir a la Tabla
          </a>
        </div>
      </header>

      <main className="grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(217,119,6,0.04)_0%,transparent_100%)]" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Guía de Compra y Lectura 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                Mejor página para leer la <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Biblia en 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos las páginas web bíblicas más utilizadas del mundo. Analizamos su legibilidad, facilidad de uso, publicidad y herramientas de estudio para ayudarte a encontrar la experiencia de lectura perfecta.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#tabla-comparativa"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                  id="hero-cta-compare"
                >
                  Ver Tabla Comparativa
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://veobible.com/es"
                  target="_blank"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Ir a VeoBible.com
                </a>
              </div>
            </div>

            {/* Hero Image / Mockup Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] md:max-w-[380px] aspect-square lg:aspect-auto flex justify-center items-center">
                {/* Premium Glow effect */}
                <div className="absolute inset-0 bg-linear-to-tr from-amber-200/30 to-amber-100/20 blur-3xl rounded-full transform -translate-y-4 -z-10" />

                <div className="relative p-2.5 bg-white rounded-[40px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                  <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-[#FAF9F5]">
                    <ExportedImage
                      src="/images/veobible-mockup.png"
                      alt="VeoBible Mockup"
                      width={380}
                      height={380}
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Floating Highlight Card */}
                  <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-amber-100/60 flex items-center gap-3 animate-bounce-slow">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <Star className="h-5 w-5 text-amber-600 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">Recomendada</p>
                      <p className="text-sm font-extrabold text-slate-900">VeoBible 100% Ads Free</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Comparison Table */}
        <section id="tabla-comparativa" className="py-20 bg-white border-y border-slate-200/60 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Comparativa de las Mejores Páginas Bíblicas
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes que definen la calidad de lectura y estudio de cada página web.
              </p>
            </div>

            <ComparisonTable />
          </div>
        </section>

        {/* Section 2: Detailed Reviews */}
        <section id="analisis-detalle" className="py-20 px-6 bg-[#FAF9F5] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Análisis Detallado de Cada Página Web
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Descubre los puntos fuertes y débiles de las opciones más populares para tomar una decisión informada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* App 0: VeoBible */}
              <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-[0_10px_30px_rgba(217,119,6,0.03)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-amber-200/20 to-transparent rounded-bl-full" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Ganadora Recomendada 2026
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">VeoBible</h3>
                      <p className="text-amber-600 text-sm font-semibold">veobible.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Star className="h-6 w-6 fill-amber-500" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    VeoBible nace con la misión de devolver el protagonismo al texto bíblico en la web. Mientras que otras páginas saturan la pantalla con banners de publicidad, menús ruidosos y enlaces complejos, VeoBible ofrece una interfaz pulida y enfocada para navegadores. Su tipografía ha sido seleccionada quirúrgicamente para evitar la fatiga ocular y su navegación permite cambiar de libro y capítulo al instante.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué destaca?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Sin distracciones:</strong> Cero anuncios, banners ni ventanas emergentes.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Tipografía literaria:</strong> Experiencia de lectura fluida similar a la de un libro impreso.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Carga Instantánea:</strong> Diseñada sin scripts innecesarios para garantizar la rapidez.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: Lectura Diaria y Devoción</span>
                  <a
                    href="https://veobible.com/es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Probar VeoBible
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* App 1: YouVersion */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Segunda Opción
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">YouVersion</h3>
                      <p className="text-slate-400 text-sm">bible.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Globe className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    La versión web de YouVersion (bible.com) es una excelente extensión de su app móvil. Sincroniza todas tus notas, planes y marcadores de manera impecable y es totalmente gratuita y sin anuncios. El único inconveniente es que su interfaz web replica la complejidad de su app móvil, estando saturada con una cantidad excesiva de planes, insignias, menús y eventos sociales que pueden distraer si solo buscas leer.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Sin anuncios:</strong> 100% gratuita y sin banners comerciales.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Interfaz cargada:</strong> Demasiadas secciones y notificaciones sociales en pantalla.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Comunidad y Planes Sociales</span>
                </div>
              </div>

              {/* App 2: Bible Gateway */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Referencia Rápida
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Bible Gateway</h3>
                      <p className="text-slate-400 text-sm">biblegateway.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Search className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Un portal de referencia legendario en internet, ideal para buscar versículos clave o comparar rápidamente traducciones en paralelo. Lamentablemente, la versión web gratuita contiene una cantidad de publicidad en forma de banners parpadeantes y vídeos auto-reproducibles que interrumpen de forma constante la concentración, a menos que adquieras su plan de pago.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Múltiples versiones:</strong> Excelente motor de búsqueda avanzada de textos.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Publicidad molesta:</strong> Banners que ensucian la experiencia estética y lectora.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Búsqueda y Versiones Paralelas</span>
                </div>
              </div>

              {/* App 3: Bible Hub */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Uso Académico
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Bible Hub</h3>
                      <p className="text-slate-400 text-sm">biblehub.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <BookOpen className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Es el recurso definitivo para el análisis exegético en la web. Permite desglosar palabra por palabra los textos bíblicos utilizando concordancias Strong, interlineales en hebreo y griego, léxicos y una inmensa colección de comentarios históricos gratis. Sin embargo, su interfaz web sigue anclada en el diseño del año 2005, resultando abrumadoramente compleja y repleta de tablas, además de estar financiada con anuncios invasivos.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Herramientas exegéticas:</strong> Acceso inigualable a lenguajes originales y comentarios.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Interfaz obsoleta y anuncios:</strong> Muy sobrecargada, no apta para lectura devocional diaria.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Investigación Exegética y Estudio</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Cómo elegir la página perfecta para leer la Biblia?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Cero publicidad para una mayor devoción</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Los banners parpadeantes y anuncios pop-up de las páginas gratuitas rompen por completo la atmósfera de recogimiento durante la lectura. Prioriza páginas 100% limpias para mantener la paz visual.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">2. Legibilidad y tipografía cuidada</h3>
                  <p className="text-slate-600 leading-relaxed">
                    El texto de la Biblia es denso. Un fondo con tonos crema o sepia suave en lugar de blanco deslumbrante, y una tipografía tipo Serif con buen espaciado entre líneas, disminuyen notablemente el cansancio ocular en pantallas de laptops o computadoras.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Enfoque de lectura vs. Estudio académico</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Define tu meta: si buscas una lectura fluida de capítulos completos para meditar, busca simplicidad (VeoBible). Si necesitas desmenuzar las palabras en hebreo/griego o consultar comentarios teológicos, utiliza herramientas académicas (Bible Hub).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Volume2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Rapidez y adaptabilidad móvil</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Una página web moderna debe cargar al instante y verse excelente tanto en pantallas de escritorio grandes como en la pantalla vertical de tu celular, sin necesidad de descargar aplicaciones pesadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Funciones Clave de la Página Ganadora */}
        <section className="py-20 bg-[#FAF9F5] border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Qué hace a VeoBible la mejor página para leer la Biblia?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              <p>
                Al evaluar la <strong>mejor página web para leer la Biblia</strong>, la experiencia de usuario es fundamental. Las plataformas modernas deben ser rápidas y adaptables. VeoBible destaca en la web porque está construida con tecnología de última generación que ofrece:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none pl-0 mt-8">
                <li className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mt-0 mb-3">
                    <Globe className="h-5 w-5 text-amber-600" />
                    Carga Ultra Rápida
                  </h4>
                  <p className="m-0 text-sm">Diseñada sin elementos pesados ni scripts innecesarios. Al cambiar de libro o capítulo, el texto se carga de manera instantánea, sin tiempos de espera molestos.</p>
                </li>
                <li className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mt-0 mb-3">
                    <Smartphone className="h-5 w-5 text-amber-600" />
                    Diseño Adaptativo Web
                  </h4>
                  <p className="m-0 text-sm">No importa si estás en un monitor ultra ancho o en un celular antiguo; la interfaz, los márgenes y el tamaño de letra se ajustan automáticamente para una lectura óptima.</p>
                </li>
                <li className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mt-0 mb-3">
                    <BookMarked className="h-5 w-5 text-amber-600" />
                    Sincronización en la Nube
                  </h4>
                  <p className="m-0 text-sm">Inicia sesión en la página web y todos tus marcadores, notas y progreso de lectura estarán allí, sincronizados en tiempo real con la aplicación móvil.</p>
                </li>
                <li className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mt-0 mb-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    100% Libre de Banners
                  </h4>
                  <p className="m-0 text-sm">A diferencia de otras páginas web gratuitas, VeoBible no utiliza banners laterales ni pop-ups molestos que interrumpen tu devocional y ensucian la pantalla.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Final Call to Action */}
        <section className="py-20 px-6 bg-linear-to-b from-[#FAF9F5] to-amber-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(217,119,6,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              ¿Listo para una mejor experiencia de lectura web?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos iniciar hoy mismo con <strong className="font-bold text-slate-900">VeoBible</strong>. Descubre cómo una interfaz web minimalista y completamente libre de anuncios puede enriquecer tu hábito diario en 2026.
            </p>
            <div className="pt-4">
              <a
                href="https://veobible.com/es"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-veobible"
              >
                Visitar VeoBible.com
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Acceso gratuito • Funciona en cualquier navegador de PC y móvil
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
