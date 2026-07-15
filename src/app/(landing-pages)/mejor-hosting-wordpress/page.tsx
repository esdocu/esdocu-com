import {
  Check,
  X,
  Star,
  Server,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Headphones,
  Gauge,
  HardDrive,
  Cloud,
  Lock,
  TriangleAlert,
  Cpu,
  Activity,
  HelpCircle,
  Paintbrush,
  Puzzle,
  Search,
  RefreshCw,
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import { WpComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Mejor Hosting para WordPress en 2026",
  description:
    "Descubre cuál es el mejor hosting para WordPress en 2026. Análisis completo de Hostinger, Bluehost, SiteGround y WP Engine. Comparativa de velocidad, precio, facilidad y soporte WP.",
  openGraph: {
    title: "El Mejor Hosting para WordPress en 2026 - Comparativa Completa",
    description:
      "Comparamos los mejores hostings para WordPress: Hostinger, Bluehost, SiteGround y WP Engine. Encuentra el plan ideal para tu sitio WordPress.",
    type: "website",
    url: "/mejor-hosting-wordpress",
  },
};

export default function WordPressHostingLandingPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      {/* Hostinger WordPress affiliate impression pixel */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.hostg.xyz/aff_i?offer_id=6&aff_id=17787&url_id=1003"
        width="0"
        height="0"
        alt=""
        style={{ position: "absolute", visibility: "hidden", border: "0" }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "El Mejor Hosting para WordPress en 2026",
            image: "https://esdocu.com/images/wordpress-hosting-comparison.png",
            description:
              "Análisis comparativo de los mejores hostings para WordPress. Comparamos Hostinger, Bluehost, SiteGround y WP Engine.",
            author: {
              "@type": "Person",
              name: "WordPress Hosting Comparado",
            },
            publisher: {
              "@type": "Organization",
              name: "Esdocu",
            }
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "¿Cuál es el mejor hosting para WordPress en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hostinger es el hosting recomendado para WordPress en 2026 gracias a su combinación de servidores LiteSpeed con LiteSpeed Cache a nivel de servidor, panel hPanel intuitivo, AI Website Builder, dominio gratis y un precio imbatible desde $2.99/mes con hasta 100 sitios web incluidos.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué hace que un hosting sea bueno para WordPress?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Un buen hosting para WordPress debe ofrecer servidores optimizados para PHP (LiteSpeed o Nginx), caché a nivel de servidor (no solo plugins), instalación en un clic, entorno de staging para pruebas, SSL gratuito, backups automáticos y soporte técnico que entienda WordPress.",
                },
              },
              {
                "@type": "Question",
                name: "¿Es necesario pagar un hosting especializado para WordPress?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No es estrictamente necesario, ya que WordPress funciona en cualquier hosting con PHP y MySQL. Sin embargo, un hosting optimizado para WordPress puede ser hasta 10x más rápido gracias a caché especializado (LiteSpeed Cache), incluye herramientas específicas como staging y actualizaciones automáticas, y el soporte técnico conoce los problemas comunes de WordPress.",
                },
              },
            ],
          }),
        }}
      />

      <header className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-6 w-6 text-violet-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            WP<span className="text-violet-600 font-medium">Hosting</span>
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
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(109,40,217,0.05)_0%,transparent_100%)]" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/50">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Guía WordPress Hosting 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                El Mejor Hosting <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  para WordPress
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos los hostings optimizados para WordPress más populares del mercado. Analizamos velocidad LiteSpeed, facilidad de instalación, herramientas WP, precio y soporte especializado.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#tabla-comparativa"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                  id="hero-cta-compare"
                >
                  Ver Tabla Comparativa
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://www.hostg.xyz/SHJlD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Ir a Hostinger WordPress
                </a>
              </div>
            </div>

            {/* Hero Dashboard Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px]">
                <div className="absolute inset-0 bg-linear-to-tr from-violet-200/30 to-indigo-100/20 blur-3xl rounded-full transform -translate-y-4 -z-10" />

                <div className="relative p-2.5 bg-white rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.06)] border border-slate-100">
                  <div className="rounded-xl border border-slate-100 bg-slate-950 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">hPanel — WordPress</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Globe className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Sitios WP</p>
                        <p className="text-lg font-bold text-white">5</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Gauge className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">PageSpeed</p>
                        <p className="text-lg font-bold text-emerald-400">98/100</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Zap className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Servidor</p>
                        <p className="text-lg font-bold text-white">LiteSpeed</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Shield className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-400">SSL</p>
                        <p className="text-lg font-bold text-cyan-400">Activo</p>
                      </div>
                    </div>

                    <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">AI Website Builder</p>
                        <p className="text-[10px] text-violet-300">WordPress + IA en minutos</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-50">
                    <Star className="h-5 w-5 text-violet-600 fill-violet-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-violet-800 tracking-wider uppercase">Recomendado</p>
                    <p className="text-sm font-extrabold text-slate-900">Hostinger WP desde $2.99/mes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="tabla-comparativa" className="py-20 bg-white border-y border-slate-200/60 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Comparativa de los Mejores Hostings WordPress
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes para elegir un hosting optimizado para WordPress: velocidad, herramientas WP, precio y soporte especializado.
              </p>
            </div>

            <WpComparisonTable />
          </div>
        </section>

        {/* Detailed Reviews */}
        <section id="analisis-detalle" className="py-20 px-6 bg-[#F5F7FB] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Análisis Detallado de Cada Hosting WordPress
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Descubre los puntos fuertes y débiles de cada proveedor para tu sitio WordPress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hostinger */}
              <div className="bg-white p-8 rounded-2xl border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.03)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-violet-200/20 to-transparent rounded-bl-full" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Ganador WordPress 2026
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Hostinger</h3>
                      <p className="text-violet-600 text-sm font-semibold">WordPress Hosting</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                      <Star className="h-6 w-6 fill-violet-500" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Hostinger ofrece la combinación más equilibrada del mercado para WordPress: servidores LiteSpeed con el plugin LiteSpeed Cache (LSCache) preinstalado que trabaja a nivel de servidor (no como un plugin PHP convencional), panel hPanel que permite instalar WordPress en un clic, AI Website Builder para crear páginas con inteligencia artificial, entornos de staging integrados y hasta 100 sitios web por solo $2.99/mes. Incluye dominio gratis, SSL de por vida y CDN global.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué destaca para WordPress?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>LiteSpeed + LSCache:</strong> Caché a nivel de servidor, hasta 10x más rápido que plugins como W3 Total Cache o WP Super Cache.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>AI Website Builder:</strong> Crea un sitio WordPress completo con IA en minutos, ideal para principiantes.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>100 sitios por $2.99/mes:</strong> El mejor precio por sitio del mercado, con dominio gratis incluido.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: WordPress rápido y asequible</span>
                  <a
                    href="https://www.hostg.xyz/SHJlD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Probar Hostinger WP
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Bluehost */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Oficial WordPress.org
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Bluehost</h3>
                      <p className="text-slate-400 text-sm">Recomendado por WordPress.org desde 2005</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Globe className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Bluehost es uno de los tres hostings oficialmente recomendados por WordPress.org, una distinción que mantiene desde 2005. Ofrece WordPress preinstalado y un proceso de onboarding amigable para principiantes. Sin embargo, sus servidores usan Apache (no LiteSpeed), lo que resulta en velocidades inferiores. El plan Basic solo incluye 1 sitio y 10 GB SSD, y el precio de renovación sube de $2.95 a $11.99/mes, casi 4 veces más.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Recomendación oficial:</strong> Avalado por WordPress.org con integración nativa WP.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Renovaciones x4:</strong> De $2.95 a $11.99/mes al renovar. Servidores Apache lentos.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: WordPress para principiantes</span>
                </div>
              </div>

              {/* SiteGround */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Rendimiento Premium
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">SiteGround</h3>
                      <p className="text-slate-400 text-sm">WordPress en Google Cloud Platform</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Gauge className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    SiteGround ofrece hosting WordPress de alta calidad sobre infraestructura Google Cloud. Su sistema de caché SuperCacher, entorno de staging con un clic y soporte técnico especializado en WordPress son de los mejores del mercado. Sin embargo, el plan StartUp solo permite 1 sitio con ~10,000 visitas/mes, y la renovación sube de $3.99 a $17.99/mes — la más cara entre los compartidos. Ideal si priorizas rendimiento sobre presupuesto.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Google Cloud + staging:</strong> Rendimiento excelente con herramientas WP avanzadas.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Renovación x4.5:</strong> De $3.99 a $17.99/mes. Solo 1 sitio y límites estrictos de visitas.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: WordPress premium</span>
                </div>
              </div>

              {/* WP Engine */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Enterprise Managed
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">WP Engine</h3>
                      <p className="text-slate-400 text-sm">WordPress 100% gestionado para empresas</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Cloud className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    WP Engine es el líder en hosting WordPress gestionado para empresas. Incluye sistema de caché EverCache propietario, staging con blueprints, temas StudioPress/Genesis Pro, detección automática de amenazas y actualizaciones gestionadas. Sin embargo, su precio mínimo es $20/mes (1 sitio, 25K visitas, 10 GB), no incluye email ni dominio, y no permite ciertos plugins que consideran conflictivos. Es la mejor opción si el presupuesto no es un problema.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>WordPress al 100%:</strong> Todo gestionado: actualizaciones, caché, seguridad y staging.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>$20/mes mínimo:</strong> 7x más caro que Hostinger. Sin email, sin dominio, plugins restringidos.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: WordPress empresarial</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Qué debe tener un buen hosting para WordPress?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Servidores LiteSpeed (no Apache)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    WordPress está construido con PHP, y LiteSpeed procesa PHP de forma radicalmente más eficiente que Apache. Además, LiteSpeed incluye el plugin LSCache que almacena las páginas a nivel de servidor, eliminando el cuello de botella de los plugins de caché convencionales. La diferencia puede ser de 3 a 10 veces más rápido en tiempos de carga.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">2. Entorno de staging para pruebas</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Un staging environment te permite crear una copia exacta de tu sitio para probar actualizaciones de plugins, cambios de tema o nuevas funcionalidades sin riesgo. Si algo sale mal, tu sitio en producción no se ve afectado. Hostinger, SiteGround y WP Engine lo incluyen; Bluehost lo ofrece solo en planes superiores.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Seguridad WordPress específica</h3>
                  <p className="text-slate-600 leading-relaxed">
                    WordPress es el CMS más atacado del mundo (43% de la web lo usa). Tu hosting debe incluir SSL gratuito, backups automáticos, protección contra malware y firewall a nivel de servidor. Algunos hostings como Hostinger incluyen además protección contra ataques DDoS y escaneo automático de vulnerabilidades en plugins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Soporte que entienda WordPress</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Cuando tu sitio muestra la &quot;pantalla blanca de la muerte&quot; o un plugin rompe todo después de actualizar, necesitas soporte que sepa diagnosticar problemas de WordPress específicamente, no solo reiniciar el servidor. Prioriza hostings con chat 24/7 donde los agentes conozcan WP a fondo y puedan ayudarte en español.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Common WordPress Mistakes */}
        <section className="py-20 bg-slate-900 text-white px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 flex justify-center">
              <TriangleAlert className="w-48 h-48 text-violet-400 opacity-20" />
            </div>
            <div className="md:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-violet-900 text-violet-300 text-[11px] font-bold tracking-wider uppercase border border-violet-700">
                Errores Frecuentes
              </span>
              <h2 className="text-3xl font-display font-extrabold tracking-tight">
                5 errores que destrozan el rendimiento de WordPress
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Tu WordPress puede ser lento no solo por el hosting, sino por errores de configuración muy comunes que la mayoría de usuarios comete sin saberlo:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Exceso de plugins:</strong> Cada plugin añade código PHP que se ejecuta en cada carga de página. Con 30+ plugins activos (muchos innecesarios), tu sitio puede tardar 5+ segundos en cargar. Mantén solo los esenciales y elimina los inactivos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Imágenes sin optimizar:</strong> Subir fotos de 5 MB directamente desde el celular es el error #1 de velocidad. Usa WebP y un plugin como ShortPixel o Imagify para comprimir automáticamente. Una imagen de 5 MB puede reducirse a 200 KB sin pérdida visible de calidad.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>No usar caché:</strong> Sin caché, WordPress genera cada página dinámicamente consultando la base de datos en cada visita. Con LiteSpeed Cache (incluido en Hostinger), las páginas se sirven desde memoria en milisegundos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Versión de PHP obsoleta:</strong> WordPress en PHP 7.4 es hasta un 50% más lento que en PHP 8.2+. Muchos hostings mantienen versiones antiguas por defecto. Verifica que puedas seleccionar PHP 8.2 o superior desde tu panel.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Temas pesados con page builders:</strong> Temas como Divi o Avada generan código HTML/CSS muy pesado. Considera temas ligeros como Astra, GeneratePress o Kadence que cargan en milisegundos y son compatibles con el editor de bloques nativo de WordPress.
                  </span>
                </li>
              </ul>
              <div className="p-4 bg-violet-800/50 rounded-xl border border-violet-700/50 mt-4">
                <p className="text-sm text-violet-200">
                  <strong className="text-white">Conclusión:</strong> El hosting es la base, pero la optimización de WordPress importa igual. Hostinger ($2.99/mes) incluye LiteSpeed Cache, PHP 8.2+ seleccionable y herramientas de optimización integradas que resuelven la mayoría de estos problemas automáticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: LiteSpeed Cache vs Plugin Cache */}
        <section className="py-20 bg-[#F5F7FB] border-y border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              LiteSpeed Cache vs. Plugins de Caché: ¿Cuál es la diferencia?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-12">
              <p>
                La mayoría de los sitios WordPress instalan plugins como <strong>W3 Total Cache</strong>, <strong>WP Super Cache</strong> o <strong>WP Rocket</strong> para mejorar la velocidad. Estos plugins funcionan, pero tienen una limitación fundamental: procesan el caché <em>dentro de PHP</em>, lo que añade overhead. <strong>LiteSpeed Cache (LSCache)</strong> es radicalmente diferente porque trabaja a nivel de servidor, antes de que PHP siquiera se ejecute.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <Zap className="w-8 h-8 text-violet-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">LSCache: Caché a nivel de servidor</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Cuando un visitante llega a tu sitio, LiteSpeed intercepta la petición <em>antes</em> de que llegue a PHP/WordPress. Si la página está en caché, la sirve directamente desde memoria en 20-50ms. No hay ejecución de PHP, no hay consultas a la base de datos. Es como tener la página ya lista esperando al visitante. Solo funciona en servidores LiteSpeed (como los de Hostinger).
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <Cloud className="w-8 h-8 text-violet-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Plugins tradicionales: Caché dentro de PHP</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Los plugins como WP Rocket o W3 Total Cache generan archivos HTML estáticos, pero aún necesitan que PHP se cargue para determinar cuál servir. Esto añade 100-300ms extra en cada petición. Además, muchos de estos plugins (como WP Rocket) son de pago ($49-$249/año), mientras que LSCache es completamente gratuito y ya viene preinstalado en Hostinger.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: WordPress Types */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Qué tipo de sitio WordPress vas a crear?
            </h2>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Paintbrush className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Blog o sitio personal</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Para un blog personal, portafolio o CV online, un plan compartido de WordPress es más que suficiente. No necesitas más de 10 GB de almacenamiento ni recursos especiales. Lo más importante es que cargue rápido (menos de 2 segundos) para que Google lo posicione bien en búsquedas.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Hostinger Business: $2.99/mes con 100 sitios, perfecto para empezar.</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <HardDrive className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Tienda WooCommerce</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    WooCommerce añade una carga significativa sobre WordPress: cada producto genera consultas a la base de datos, el carrito necesita sesiones PHP activas y el checkout debe ser rápido para no perder ventas. Necesitas un hosting con buena RAM, PHP 8.2+, caché inteligente que excluya páginas dinámicas (carrito, checkout) y SSL activo para pagos seguros.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Ideal para: Tiendas con hasta 10,000 productos y tráfico moderado.</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Search className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Sitio corporativo o de servicios</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Un sitio empresarial necesita ante todo velocidad de carga impecable (afecta la percepción de profesionalismo), uptime del 99.9%, SSL activo, emails corporativos con tu dominio y la posibilidad de escalar si creces. Formularios de contacto, landing pages y secciones de blog son los componentes típicos.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Ideal para: Empresas, consultoras, agencias y freelancers.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: FAQs */}
        <section className="py-20 bg-[#F5F7FB] border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-violet-500" />
              Preguntas Frecuentes sobre WordPress Hosting
            </h2>

            <div className="space-y-6">
              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Cuál es la diferencia entre &quot;Hosting WordPress&quot; y un hosting normal?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Técnicamente, WordPress puede funcionar en cualquier hosting que tenga PHP y MySQL. Un &quot;hosting WordPress&quot; es un servidor <strong>optimizado específicamente</strong> para WordPress: incluye LiteSpeed o Nginx configurado para WP, el plugin de caché preinstalado, instalador en un clic, actualizaciones automáticas del core, entorno de staging y soporte técnico que conoce los problemas comunes de WordPress. En resumen, es el mismo servidor pero con la configuración ideal ya lista.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿WordPress.com o WordPress.org? ¿Cuál necesito?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Son cosas completamente diferentes. <strong>WordPress.org</strong> es el software gratuito y de código abierto que instalas en tu propio hosting (como Hostinger). Tienes control total: plugins, temas, código, monetización, todo. <strong>WordPress.com</strong> es un servicio de hosting cerrado de Automattic donde alojas tu sitio en sus servidores con restricciones: los planes gratuitos/baratos no permiten plugins personalizados ni monetización. <strong>Recomendación:</strong> siempre WordPress.org con tu propio hosting, que te da libertad total por el mismo precio (o menos).
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Puedo migrar mi WordPress existente a Hostinger?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Sí, Hostinger ofrece <strong>migración gratuita de WordPress</strong>. Puedes usar su plugin de migración automática que copia todo tu sitio (archivos, base de datos, configuración) al nuevo servidor con unos pocos clics, sin pérdida de datos. También puedes solicitar al soporte técnico que realice la migración por ti de forma manual. El proceso suele completarse en menos de 24 horas sin tiempo de inactividad para tus visitantes.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Qué versión de PHP debo usar para WordPress?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  En 2026, la versión recomendada es <strong>PHP 8.2 o superior</strong>. WordPress oficialmente soporta PHP 7.4+, pero las versiones más recientes son significativamente más rápidas y seguras. PHP 8.2 puede ser hasta un 50% más rápido que PHP 7.4 en operaciones típicas de WordPress. Hostinger permite seleccionar la versión de PHP desde el panel hPanel con un clic, y por defecto ya configura la versión más reciente compatible.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-linear-to-b from-[#F5F7FB] to-violet-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(109,40,217,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              ¿Listo para lanzar tu WordPress?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos empezar hoy con <strong className="font-bold text-slate-900">Hostinger WordPress</strong>. Obtén hosting LiteSpeed con LSCache, AI Website Builder, dominio gratis y hasta 100 sitios web desde solo $2.99/mes.
            </p>
            <div className="pt-4">
              <a
                href="https://www.hostg.xyz/SHJlD"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-hostinger"
              >
                Visitar Hostinger WordPress
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Garantía de reembolso 30 días • LiteSpeed Cache incluido • Soporte 24/7 en español
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-violet-600" />
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                WP<span className="text-violet-600 font-medium">Hosting</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs text-center md:text-left">
              © {new Date().getFullYear()} WP Hosting Comparado. Todos los derechos reservados.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-[11px] leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-slate-500">Aviso:</strong> Este sitio contiene enlaces de afiliado, lo que significa que podemos recibir una comisión si realizas una compra a través de ellos, sin costo adicional para ti. Nuestro análisis es completamente honesto, objetivo y basado en nuestra experiencia real con cada proveedor. Las comisiones de afiliado nos ayudan a mantener este sitio y seguir creando contenido de calidad.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
