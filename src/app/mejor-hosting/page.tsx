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
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import { ComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Mejor Hosting en 2026",
  description:
    "Descubre cuál es el mejor hosting web en 2026. Análisis completo de Hostinger, Bluehost, SiteGround y GoDaddy. Comparativa de precio, velocidad y soporte.",
  openGraph: {
    title: "El Mejor Hosting en 2026 - Comparativa Completa",
    description:
      "Comparamos los mejores proveedores de hosting web: Hostinger, Bluehost, SiteGround y GoDaddy. Encuentra el plan ideal para tu sitio web.",
    type: "website",
    url: "/mejor-hosting",
  },
};

export default function HostingLandingPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "El Mejor Hosting en 2026",
            image: "https://esdocu.com/images/hosting-comparison.png",
            description:
              "Análisis comparativo de los mejores proveedores de hosting web. Comparamos Hostinger, Bluehost, SiteGround y GoDaddy.",
            brand: {
              "@type": "Brand",
              name: "Hosting Comparado",
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
                name: "¿Cuál es el mejor hosting web en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hostinger es el proveedor recomendado en 2026 gracias a su excelente relación calidad-precio, servidores LiteSpeed con CDN global, panel hPanel intuitivo, SSL gratuito de por vida y soporte en español 24/7.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué hosting es mejor para WordPress?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hostinger ofrece instalación de WordPress en un clic, optimización LiteSpeed y planes desde $2.99/mes con dominio gratis. Es la opción más equilibrada para principiantes y profesionales en 2026.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué características debe tener un buen hosting?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Un buen hosting debe ofrecer alta velocidad de carga (servidores SSD/LiteSpeed), SSL gratuito, backups automáticos, panel de control intuitivo, soporte técnico 24/7 en tu idioma y un precio transparente sin costes ocultos.",
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
            Hosting<span className="text-violet-600 font-medium">Comparado</span>
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
                Guía de Compra Web Hosting 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                El Mejor Hosting <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  en 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos los proveedores de hosting más populares del mercado. Analizamos precio, velocidad, panel de control, seguridad y soporte para ayudarte a lanzar tu sitio web con la mejor base posible.
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
                  href="https://www.hostinger.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Ir a Hostinger.com
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
                      <span className="text-[10px] text-slate-400 font-mono">hPanel — Hostinger</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Globe className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Sitios activos</p>
                        <p className="text-lg font-bold text-white">3</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Gauge className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Uptime</p>
                        <p className="text-lg font-bold text-emerald-400">99.9%</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Zap className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Velocidad</p>
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
                        <Server className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Servidor optimizado</p>
                        <p className="text-[10px] text-violet-300">CDN global activo</p>
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
                    <p className="text-sm font-extrabold text-slate-900">Hostinger desde $2.99/mes</p>
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
                Comparativa de los Mejores Hostings
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes que definen la calidad de un proveedor de hosting web.
              </p>
            </div>

            <ComparisonTable />
          </div>
        </section>

        {/* Detailed Reviews */}
        <section id="analisis-detalle" className="py-20 px-6 bg-[#F5F7FB] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Análisis Detallado de Cada Proveedor
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Descubre los puntos fuertes y débiles de las opciones más populares para tomar una decisión informada.
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
                        Ganador Recomendado 2026
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Hostinger</h3>
                      <p className="text-violet-600 text-sm font-semibold">hostinger.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                      <Star className="h-6 w-6 fill-violet-500" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Hostinger se ha consolidado como el proveedor de hosting más equilibrado del mercado. Combina precios imbatibles con tecnología de punta: servidores LiteSpeed, CDN global gratuito y un panel hPanel que cualquier principiante puede dominar en minutos. Su apuesta por herramientas de IA para crear sitios web lo posiciona como la opción más moderna de 2026.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué destaca?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Precio imbatible:</strong> Planes desde $2.99/mes con dominio gratis el primer año.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Velocidad LiteSpeed:</strong> Tiempos de carga ultrarrápidos con caché optimizado.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>hPanel intuitivo:</strong> Gestiona dominios, emails y WordPress sin complicaciones.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: Hosting rápido y asequible</span>
                  <a
                    href="https://www.hostinger.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Probar Hostinger
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
                        Segunda Opción
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Bluehost</h3>
                      <p className="text-slate-400 text-sm">Hosting oficial de WordPress</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Globe className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Bluehost es uno de los nombres más reconocidos en hosting, especialmente recomendado por WordPress.org. Ofrece una integración sólida con el CMS más popular del mundo, pero sus servidores compartidos pueden volverse lentos con el tráfico creciente. Los precios de renovación son significativamente más altos que la oferta inicial.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>WordPress oficial:</strong> Instalación y soporte optimizados para WP.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Renovaciones caras:</strong> El precio puede triplicarse al renovar el plan.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Blogs y WordPress</span>
                </div>
              </div>

              {/* SiteGround */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Alto Rendimiento
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">SiteGround</h3>
                      <p className="text-slate-400 text-sm">Hosting premium en Google Cloud</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Gauge className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    SiteGround es sinónimo de rendimiento y soporte técnico de primera clase. Su infraestructura en Google Cloud garantiza velocidades excelentes, pero los planes tienen límites estrictos de visitas mensuales y el precio de renovación es uno de los más altos del mercado. Ideal para proyectos que priorizan velocidad sobre presupuesto.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Rendimiento top:</strong> Infraestructura Google Cloud con excelente uptime.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Precio elevado:</strong> Renovaciones costosas y límites de tráfico estrictos.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Rendimiento premium</span>
                </div>
              </div>

              {/* GoDaddy */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Todo en Uno
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">GoDaddy</h3>
                      <p className="text-slate-400 text-sm">Dominios y hosting combinados</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <HardDrive className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    GoDaddy es el gigante del registro de dominios que también ofrece hosting. Su principal ventaja es la conveniencia de gestionar todo en un solo lugar, pero la experiencia de hosting deja mucho que desear: planes básicos lentos, SSL de pago y una interfaz saturada de ofertas y upsells que dificultan la navegación.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Marca reconocida:</strong> Fácil registrar dominio y hosting juntos.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Hosting mediocre:</strong> Velocidad lenta y muchos costes adicionales ocultos.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Dominios + hosting básico</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Cómo elegir el hosting perfecto para tu sitio web?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Velocidad y rendimiento</h3>
                  <p className="text-slate-600 leading-relaxed">
                    La velocidad de carga afecta directamente al SEO y a la experiencia del usuario. Busca proveedores con servidores SSD o LiteSpeed, CDN incluido y tiempos de respuesta inferiores a 200ms. Un sitio lento pierde visitantes y posiciones en Google.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">2. Seguridad y SSL gratuito</h3>
                  <p className="text-slate-600 leading-relaxed">
                    El certificado SSL (candado HTTPS) es obligatorio en 2026. Asegúrate de que tu hosting lo incluya gratis de por vida, junto con backups automáticos y protección contra malware. No pagues extra por algo que debería venir incluido.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Soporte técnico en tu idioma</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Cuando tu sitio cae a las 3 de la madrugada, necesitas ayuda real y rápida. Prioriza proveedores con chat en vivo 24/7 en español y tiempos de respuesta medidos en minutos, no en horas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Precio transparente y escalabilidad</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Desconfía de precios demasiado bajos que se disparan al renovar. Compara el coste real a 3 años y verifica que puedas escalar tu plan fácilmente cuando tu tráfico crezca, sin migraciones dolorosas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-linear-to-b from-[#F5F7FB] to-violet-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(109,40,217,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              ¿Listo para lanzar tu sitio web?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos empezar hoy con <strong className="font-bold text-slate-900">Hostinger</strong>. Obtén hosting rápido con LiteSpeed, dominio gratis y un panel intuitivo desde solo $2.99/mes.
            </p>
            <div className="pt-4">
              <a
                href="https://www.hostinger.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-hostinger"
              >
                Visitar Hostinger.com
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Garantía de reembolso 30 días • SSL gratuito • Soporte 24/7 en español
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-violet-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              Hosting<span className="text-violet-600 font-medium">Comparado</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left">
            © {new Date().getFullYear()} Hosting Comparado. Todos los derechos reservados. Análisis independiente no afiliado.
          </p>
        </div>
      </footer>
    </div>
  );
}
