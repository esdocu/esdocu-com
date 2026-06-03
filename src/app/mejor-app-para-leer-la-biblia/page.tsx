import ExportedImage from "next-image-export-optimizer";
import { Check, X, Star, Smartphone, Shield, BookOpen, Clock, Heart, Volume2, Search, ArrowRight, BookMarked, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForceLightTheme } from "./force-light-theme";
import { ComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

// SEO Metadata for the landing page
export const metadata: Metadata = {
  title: "La Mejor App para Leer la Biblia en 2026 - Comparativa",
  description: "Descubre cuál es la mejor aplicación para leer y estudiar la Biblia este año. Análisis completo de VeoBible, YouVersion, Bible Gateway y Logos.",
  openGraph: {
    title: "La Mejor App para Leer la Biblia en 2026 - Comparativa Completa",
    description: "Comparamos las mejores apps bíblicas: VeoBible, YouVersion, Bible Gateway y Logos. Encuentra la aplicación ideal para tu lectura diaria sin distracciones.",
    type: "website",
    url: "/mejor-app-para-leer-la-biblia",
  },
};

interface AppDetails {
  name: string;
  tagline: string;
  focus: string;
  ads: string;
  ui: string;
  offline: string;
  audio: string;
  price: string;
  easeOfUse: string;
  isWinner?: boolean;
}

export default function BibleLandingPage() {
  const apps: AppDetails[] = [
    {
      name: "VeoBible",
      tagline: "El nuevo estándar de lectura minimalista",
      focus: "Lectura enfocada, sin distracciones, tipografía premium y diseño moderno.",
      ads: "100% Libre de anuncios",
      ui: "Limpia, elegante, optimizada para la lectura",
      offline: "Sí, soporte offline completo",
      audio: "Voz natural premium con planes de audio integrados",
      price: "Gratis (Básico) / Suscripción premium accesible",
      easeOfUse: "Excelente (Curva de aprendizaje nula)",
      isWinner: true,
    },
    {
      name: "YouVersion",
      tagline: "La comunidad global y planes de lectura",
      focus: "Lectura social, planes devocionales y conexión con amigos.",
      ads: "Libre de anuncios (Financiado por donaciones)",
      ui: "Funcional, pero con exceso de pestañas y notificaciones",
      offline: "Sí, requiere descarga manual de versiones",
      audio: "Sí, narraciones variadas por versión",
      price: "100% Gratis",
      easeOfUse: "Buena (Puede resultar abrumadora)",
    },
    {
      name: "Bible Gateway",
      tagline: "La biblioteca de referencia clásica",
      focus: "Consulta rápida, búsquedas de palabras clave y versículos específicos.",
      ads: "Con publicidad molesta en versión gratis",
      ui: "Anticuada, saturada con anuncios e interfaces del 2010",
      offline: "Limitado en app móvil, ausente en web",
      audio: "Sí, básico con anuncios de audio",
      price: "Gratis con anuncios / Suscripción Plus de pago",
      easeOfUse: "Regular (La publicidad interrumpe)",
    },
    {
      name: "Logos Bible Software",
      tagline: "La herramienta académica profesional",
      focus: "Estudio teológico profundo, lenguajes originales (hebreo/griego).",
      ads: "Libre de anuncios",
      ui: "Extremadamente compleja, repleta de paneles científicos",
      offline: "Sí, pero requiere equipos con alta capacidad",
      audio: "De pago, enfocado en audio-libros académicos",
      price: "De pago (Paquetes desde $50 hasta más de $1,000)",
      easeOfUse: "Muy baja (Requiere capacitación técnica)",
    },
  ];

  return (
    <div className="grow bg-[#FAF9F5] text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Force Light Theme Client Component */}
      <ForceLightTheme />

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
                Mejor app para leer la <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Biblia en 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos las plataformas bíblicas más utilizadas del mundo. Analizamos su legibilidad, facilidad de uso, publicidad y coste para ayudarte a encontrar la experiencia de lectura perfecta.
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
                  href="#analisis-detalle"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Leer Reseñas
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
                      alt="VeoBible App Mockup"
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
                Comparativa de las Mejores Apps Bíblicas
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes que definen la calidad de lectura de cada aplicación.
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
                Análisis Detallado de Cada Aplicación
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
                    VeoBible nace con la misión de devolver el protagonismo al texto bíblico. Mientras que otras apps saturan la pantalla con notificaciones, anuncios y redes sociales, VeoBible ofrece una interfaz pulida y enfocada. Su tipografía ha sido seleccionada quirúrgicamente para evitar la fatiga ocular, y su sistema inteligente permite cambiar de capítulo y buscar versículos al instante.
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
                        <span><strong>Modo Offline Completo:</strong> Funciona a la perfección sin cobertura o internet.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: Lectura Diaria y Devoción</span>
                  <a
                    href="https://veobible.com"
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
                      <p className="text-slate-400 text-sm">La app de la comunidad</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Smartphone className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Es la aplicación más descargada de la historia. Cuenta con una librería colosal de traducciones y es fantástica para seguir planes devocionales grupales e interactuar con amigos. Sin embargo, su interfaz se ha vuelto sumamente densa con los años: está repleta de recordatorios de rachas, avatares, fotos de versículos del día y notificaciones push que alejan al usuario de una lectura relajada.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Es 100% gratis:</strong> No contiene pagos dentro de la aplicación.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Mucha distracción visual:</strong> Difícil enfocarse debido a constantes estímulos sociales.</span>
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
                      <p className="text-slate-400 text-sm">Herramienta de consulta rápida</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Search className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Un portal de referencia legendario, ideal para buscar versículos o comparar rápidamente traducciones en paralelo. Lamentablemente, la versión web y la aplicación gratuita contienen una cantidad de publicidad invasiva insostenible para la lectura continuada. Banners parpadeantes y vídeos publicitarios interrumpen la lectura, a menos que pagues su suscripción Plus.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Múltiples versiones:</strong> Excelente motor de búsqueda e indexación.</span>
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

              {/* App 3: Logos Bible */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Uso Académico
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Logos Bible Software</h3>
                      <p className="text-slate-400 text-sm">La biblioteca teológica digital</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <BookOpen className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Es el software definitivo para teólogos, pastores y estudiantes serios de la Biblia. Su poder para cruzar datos en idiomas originales, analizar manuscritos y estudiar comentarios es inigualable. No obstante, es un sistema excesivamente pesado y complejo para el creyente que solo desea realizar su devocional diario antes de comenzar su jornada laboral, además de requerir una inversión económica sustancial.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Poder analítico insuperable:</strong> Permite desglosar palabra por palabra el original griego.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Coste e Interfaz Compleja:</strong> Precios prohibitivos y requiere semanas de aprendizaje.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Investigación Exegética</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Cómo elegir la app perfecta para leer la Biblia?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Cero publicidad para una mayor devoción</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Las interrupciones visuales en forma de anuncios rompen el ambiente de oración y lectura reflexiva. Es preferible optar por aplicaciones totalmente limpias o suscripciones económicas para garantizar la paz visual en tu tiempo de intimidad.
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
                    La Biblia contiene textos extensos. Un diseño con tipografía serif fluida, espaciado adecuado entre líneas y fondos amables (como el color crema) disminuyen notablemente el cansancio ocular frente a pantallas brillantes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Enfoque personal vs. Enfoque social</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Pregúntate si buscas interactuar con otros lectores compartiendo pasajes (YouVersion) o si valoras un rincón privado de meditación personal sin la sensación de estar en una red social más (VeoBible).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Volume2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Rendimiento rápido y modo offline</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Asegúrate de que la app cargue de inmediato y tenga soporte sin conexión a internet. Una aplicación rápida te invita a leer más en cualquier pequeño momento libre de tu día a día.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Final Call to Action */}
        <section className="py-20 px-6 bg-linear-to-b from-[#FAF9F5] to-amber-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(217,119,6,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              ¿Listo para una mejor experiencia de lectura?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos iniciar hoy mismo con <strong className="font-bold text-slate-900">VeoBible</strong>. Descubre cómo el diseño minimalista y libre de publicidad puede transformar tu hábito de lectura bíblica diario en 2026.
            </p>
            <div className="pt-4">
              <a
                href="https://veobible.com"
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
              Disponible para múltiples dispositivos • Sin registros obligatorios
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
