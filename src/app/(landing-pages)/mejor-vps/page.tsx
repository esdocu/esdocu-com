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
  Terminal,
  Network,
  MemoryStick,
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import { VpsComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "El Mejor VPS en 2026",
  description:
    "Descubre cuál es el mejor servidor VPS en 2026. Análisis completo de Hostinger, DigitalOcean, Linode y Vultr. Comparativa de precio, rendimiento, RAM, CPU y soporte.",
  openGraph: {
    title: "El Mejor VPS en 2026 - Comparativa Completa",
    description:
      "Comparamos los mejores proveedores de VPS: Hostinger, DigitalOcean, Linode y Vultr. Encuentra el servidor virtual ideal para tu proyecto.",
    type: "website",
    url: "/mejor-vps",
  },
};

export default function VpsLandingPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      {/* Hostinger VPS affiliate impression pixel */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.hostg.xyz/aff_i?offer_id=6&aff_id=17787&url_id=5038"
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
            headline: "El Mejor VPS en 2026",
            image: "https://esdocu.com/images/vps-comparison.png",
            description:
              "Análisis comparativo de los mejores proveedores de servidores VPS. Comparamos Hostinger, DigitalOcean, Linode y Vultr.",
            author: {
              "@type": "Person",
              name: "VPS Comparado",
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
                name: "¿Cuál es el mejor VPS en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hostinger VPS es la opción recomendada en 2026 gracias a su excelente relación calidad-precio: ofrece 4 GB de RAM y 2 vCPU dedicados desde $4.99/mes con virtualización KVM, panel de gestión integrado, backups automáticos y soporte en español 24/7.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué diferencia hay entre un VPS y un hosting compartido?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "En un hosting compartido, varios sitios web comparten los mismos recursos (RAM, CPU) de un servidor. En un VPS, tus recursos están completamente aislados y garantizados mediante virtualización. Esto te da mayor rendimiento, seguridad, acceso root y control total sobre la configuración del servidor.",
                },
              },
              {
                "@type": "Question",
                name: "¿Necesito conocimientos técnicos para usar un VPS?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Tradicionalmente sí, pero proveedores como Hostinger ofrecen VPS gestionados con plantillas preconfiguradas (Ubuntu, CentOS, AlmaLinux) y paneles de control como CyberPanel o Webmin preinstalados. Esto reduce la curva de aprendizaje considerablemente.",
                },
              },
            ],
          }),
        }}
      />

      <header className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-violet-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            VPS<span className="text-violet-600 font-medium">Comparado</span>
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
                Guía de Compra VPS 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                El Mejor VPS <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  en 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos los servidores VPS más populares del mercado. Analizamos precio, RAM, CPU, almacenamiento NVMe, panel de control y soporte para ayudarte a elegir el servidor virtual perfecto para tu proyecto.
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
                  href="https://www.hostg.xyz/SHJlB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Ir a Hostinger VPS
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
                      <span className="text-[10px] text-slate-400 font-mono">VPS Panel — Hostinger</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <MemoryStick className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">RAM</p>
                        <p className="text-lg font-bold text-white">4 GB</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Cpu className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">vCPU</p>
                        <p className="text-lg font-bold text-emerald-400">2 Cores</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <HardDrive className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">NVMe SSD</p>
                        <p className="text-lg font-bold text-white">50 GB</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Gauge className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Uptime</p>
                        <p className="text-lg font-bold text-cyan-400">99.9%</p>
                      </div>
                    </div>

                    <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <Terminal className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Root access completo</p>
                        <p className="text-[10px] text-violet-300">Virtualización KVM dedicada</p>
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
                    <p className="text-sm font-extrabold text-slate-900">Hostinger VPS desde $4.99/mes</p>
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
                Comparativa de los Mejores VPS
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes que definen la calidad de un servidor VPS: recursos, precio, panel de control y soporte.
              </p>
            </div>

            <VpsComparisonTable />
          </div>
        </section>

        {/* Detailed Reviews */}
        <section id="analisis-detalle" className="py-20 px-6 bg-[#F5F7FB] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Análisis Detallado de Cada Proveedor VPS
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Descubre los puntos fuertes y débiles de cada proveedor de servidores virtuales para tomar una decisión informada.
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
                      <h3 className="text-2xl font-bold text-slate-950">Hostinger VPS</h3>
                      <p className="text-violet-600 text-sm font-semibold">hostinger.com/vps-hosting</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                      <Star className="h-6 w-6 fill-violet-500" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Hostinger ofrece VPS con virtualización KVM que garantiza recursos 100% dedicados. Su plan de entrada (KVM 1) incluye 4 GB de RAM, 2 vCPU y 50 GB NVMe SSD por solo $4.99/mes — muy por encima de lo que ofrecen DigitalOcean o Vultr en la misma franja de precio. Incluye plantillas preconfiguradas con Ubuntu, AlmaLinux, CyberPanel y más, además de un panel de gestión VPS propio que facilita la administración sin conocimientos avanzados de Linux.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué destaca?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Mejor relación calidad-precio:</strong> 4 GB RAM + 2 vCPU desde $4.99/mes, imbatible en el mercado.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Virtualización KVM:</strong> Recursos 100% aislados y dedicados, sin &quot;vecinos ruidosos&quot;.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Panel + plantillas:</strong> Instala CyberPanel, Webmin, cPanel o un SO limpio en minutos.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: VPS gestionado y asequible</span>
                  <a
                    href="https://www.hostg.xyz/SHJlB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Probar Hostinger VPS
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* DigitalOcean */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Popular entre Devs
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">DigitalOcean</h3>
                      <p className="text-slate-400 text-sm">Cloud para desarrolladores y startups</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Cloud className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    DigitalOcean es una plataforma cloud muy popular entre desarrolladores por su simplicidad y su excelente documentación. Sus &quot;Droplets&quot; (servidores virtuales) son confiables y fáciles de desplegar. Sin embargo, su plan básico ($6/mes) solo ofrece 512 MB de RAM y 10 GB de almacenamiento, muy limitado. El soporte básico se limita a tickets y foros comunitarios; el soporte premium requiere un plan de pago adicional.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Ecosistema developer-first:</strong> Excelente API, CLI y documentación técnica.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Recursos limitados en plan base:</strong> Solo 512 MB RAM por $6/mes, insuficiente para la mayoría de apps.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Cloud para desarrolladores</span>
                </div>
              </div>

              {/* Linode (Akamai) */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Respaldo Akamai
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Linode (Akamai)</h3>
                      <p className="text-slate-400 text-sm">Cloud computing con red CDN global</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Network className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Linode (ahora parte de Akamai) ofrece servidores cloud sólidos con una red global respaldada por uno de los mayores CDN del mundo. Su plan Nanode ($5/mes) incluye 1 GB de RAM y 25 GB SSD, un punto medio razonable. Sin embargo, no tiene panel de hosting integrado (necesitas instalar todo manualmente), no ofrece soporte en español y su interfaz Cloud Manager, aunque funcional, carece de las facilidades de un VPS gestionado.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Red Akamai global:</strong> Excelente conectividad y baja latencia en múltiples regiones.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Sin panel gestionado:</strong> Requiere conocimientos de administración Linux para todo.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Cloud computing avanzado</span>
                </div>
              </div>

              {/* Vultr */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Pago por Hora
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Vultr</h3>
                      <p className="text-slate-400 text-sm">Cloud servers con 32 data centers</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Globe className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Vultr destaca por su amplia red de 32 data centers alrededor del mundo y su modelo de facturación por hora. Tiene un plan desde $2.50/mes, pero este solo incluye IPv6 (sin IPv4) y 512 MB de RAM, lo que lo hace prácticamente inutilizable para producción. El plan con IPv4 comienza en $5/mes con 1 GB RAM. No ofrece panel de hosting, soporte en español ni backups incluidos.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>32 ubicaciones globales:</strong> Mayor cobertura geográfica que la competencia.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Plan barato engañoso:</strong> El plan de $2.50 no incluye IPv4, es solo marketing.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Cloud servers por hora</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Cómo elegir el VPS perfecto para tu proyecto?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Recursos garantizados (RAM y CPU)</h3>
                  <p className="text-slate-600 leading-relaxed">
                    La diferencia fundamental entre un VPS y un hosting compartido es que los recursos deben estar 100% garantizados. Busca proveedores con virtualización KVM (no OpenVZ) que aíslen completamente tu RAM y CPU. Un VPS con 4 GB de RAM y 2 vCPU dedicados es el mínimo recomendable para apps web en producción.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">2. Almacenamiento NVMe SSD</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Los discos NVMe son hasta 6 veces más rápidos que los SSD SATA tradicionales. Para bases de datos, WordPress o cualquier aplicación con lecturas/escrituras intensivas, la diferencia es abismal. Verifica que tu VPS use NVMe y no simplemente &quot;SSD&quot; genérico.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Terminal className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Panel de gestión y facilidad de uso</h3>
                  <p className="text-slate-600 leading-relaxed">
                    No todos los VPS son iguales en accesibilidad. Algunos proveedores (como Hostinger) incluyen un panel de gestión VPS con plantillas preconfiguradas, firewall visual y consola de recuperación. Otros te dan solo acceso SSH y te dejan administrar todo por tu cuenta. Si no eres un sysadmin experimentado, prioriza un VPS gestionado.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Soporte técnico y backups</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Con un VPS asumes más responsabilidad que con hosting compartido. Si algo sale mal a las 3 de la mañana, necesitas soporte que responda en minutos, no en días. Verifica también que el proveedor incluya backups automáticos; en muchos casos (como DigitalOcean o Vultr) los backups son un extra de pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Shared vs VPS warning */}
        <section className="py-20 bg-slate-900 text-white px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 flex justify-center">
              <TriangleAlert className="w-48 h-48 text-violet-400 opacity-20" />
            </div>
            <div className="md:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-violet-900 text-violet-300 text-[11px] font-bold tracking-wider uppercase border border-violet-700">
                ¿Cuándo Migrar?
              </span>
              <h2 className="text-3xl font-display font-extrabold tracking-tight">
                5 señales de que tu hosting compartido se quedó pequeño
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Muchos proyectos comienzan con hosting compartido, pero llega un momento en que necesitas los recursos aislados y el control de un VPS. Estas son las señales claras:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Tu sitio se cae en picos de tráfico:</strong> Si un post viral o una campaña de ads tira tu web, los recursos compartidos ya no alcanzan. Un VPS escala contigo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Necesitas instalar software personalizado:</strong> Node.js, Python, Redis, Docker... En hosting compartido no puedes instalar nada fuera de lo estándar. Con un VPS tienes root y libertad total.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Tu base de datos es lenta:</strong> Las consultas MySQL/PostgreSQL pesadas compiten por CPU con los demás usuarios en hosting compartido. Un VPS te da CPU garantizada.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Manejas datos sensibles:</strong> E-commerce, salud o finanzas requieren aislamiento de seguridad real, no compartir IP con miles de sitios desconocidos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Quieres múltiples sitios/apps independientes:</strong> Con un VPS puedes alojar decenas de dominios, cada uno con su configuración, sin las limitaciones artificiales del hosting compartido.
                  </span>
                </li>
              </ul>
              <div className="p-4 bg-violet-800/50 rounded-xl border border-violet-700/50 mt-4">
                <p className="text-sm text-violet-200">
                  <strong className="text-white">Conclusión:</strong> Un VPS como el de Hostinger ($4.99/mes con 4 GB RAM) cuesta solo unos dólares más que un hosting compartido premium, pero la diferencia en rendimiento, seguridad y flexibilidad es abismal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: KVM vs OpenVZ */}
        <section className="py-20 bg-[#F5F7FB] border-y border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              KVM vs OpenVZ: ¿Por qué importa la virtualización?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-12">
              <p>
                No todos los VPS son iguales por dentro. La tecnología de virtualización determina si tus recursos son realmente dedicados o si podrían ser &quot;robados&quot; por otros usuarios del mismo servidor físico. Las dos opciones principales son <strong>KVM</strong> (Kernel-based Virtual Machine) y <strong>OpenVZ</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <Shield className="w-8 h-8 text-violet-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">KVM: Aislamiento real (recomendado)</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    KVM crea máquinas virtuales completas con su propio kernel. Cada VPS está completamente aislado: la RAM y el CPU que contratas son 100% tuyas. Puedes instalar cualquier sistema operativo (Linux, Windows) y ejecutar Docker sin problemas. Es la tecnología que usa <strong>Hostinger</strong> en todos sus planes VPS.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <TriangleAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">OpenVZ: Recursos compartidos (cuidado)</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    OpenVZ utiliza contenedores que comparten el kernel del host. Esto significa que el proveedor puede sobredimensionar el servidor (vender más RAM de la que existe físicamente). No puedes ejecutar Docker ni cambiar el kernel. Aunque es más barato, la experiencia es inconsistente y menos fiable que KVM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Use Cases */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Para qué puedes usar un VPS?
            </h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Globe className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Hosting web de alto rendimiento</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Aloja múltiples sitios WordPress, WooCommerce o cualquier CMS con recursos 100% dedicados. Instala LiteSpeed, Nginx o Apache con la configuración exacta que necesitas. Ideal para agencias que gestionan decenas de sitios web para clientes.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">VPS KVM 1 de Hostinger: 4 GB RAM, perfecto para empezar.</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Terminal className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Aplicaciones web y APIs</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Despliega aplicaciones Node.js, Python (Django/Flask), Ruby on Rails, Go o cualquier stack personalizado. Ejecuta bases de datos PostgreSQL, MongoDB o Redis con rendimiento predecible. Perfecto para SaaS, dashboards y backends de apps móviles.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Ideal para: Startups, SaaS, APIs REST y backends.</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Server className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Servidores de juegos y Discord bots</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Monta tu propio servidor de Minecraft, Valheim, Terraria, CS2 o cualquier juego multiplayer. También puedes ejecutar bots de Discord, Telegram o scrapers 24/7 sin interrupciones. Un VPS con 4+ GB de RAM y buena CPU es suficiente para servidores de tamaño mediano.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Ideal para: Gamers, comunidades y automatizaciones.</span>
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
              Preguntas Frecuentes sobre VPS
            </h2>

            <div className="space-y-6">
              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Qué diferencia hay entre un VPS y un hosting compartido?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  En un <strong>hosting compartido</strong>, tu sitio web comparte los recursos (RAM, CPU, disco) de un servidor con cientos o miles de otros sitios. Si un vecino consume mucha memoria, el tuyo se ralentiza. En un <strong>VPS</strong>, tus recursos están aislados y garantizados mediante virtualización. Tienes acceso root completo, puedes instalar cualquier software y configurar el servidor exactamente como necesitas. Es el paso lógico cuando tu hosting compartido se queda corto.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Necesito ser programador para usar un VPS?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  No necesariamente. Proveedores como <strong>Hostinger</strong> ofrecen VPS gestionados con plantillas preconfiguradas que instalan automáticamente el sistema operativo y panel de control (como CyberPanel o Webmin) con un solo clic. Si necesitas algo básico como alojar sitios WordPress, puedes hacerlo sin tocar la terminal. Sin embargo, para usos avanzados (Docker, configuraciones de red, scripts personalizados), conocimientos básicos de Linux son muy útiles.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Cuánta RAM necesito en un VPS?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Depende del uso: <strong>1-2 GB</strong> es suficiente para un blog WordPress con poco tráfico o un bot de Discord. <strong>4 GB</strong> (como el plan KVM 1 de Hostinger) es ideal para aplicaciones web en producción, tiendas WooCommerce con tráfico moderado o servidores de Minecraft. <strong>8-16 GB</strong> son necesarios para bases de datos grandes, múltiples aplicaciones simultáneas o servidores de juegos pesados. La ventaja de un VPS es que puedes escalar la RAM cuando lo necesites sin migrar.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Qué significa virtualización KVM?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  KVM (Kernel-based Virtual Machine) es una tecnología de virtualización integrada en el kernel de Linux que crea máquinas virtuales completamente aisladas. Cada VPS KVM tiene su propio kernel, su propia RAM dedicada y acceso completo al hardware virtualizado. A diferencia de OpenVZ (que usa contenedores y permite sobredimensionar recursos), <strong>KVM garantiza que la RAM y CPU que contratas son realmente tuyas</strong>. Además, con KVM puedes ejecutar Docker, instalar kernels personalizados y correr cualquier sistema operativo.
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
              ¿Listo para tu propio servidor VPS?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos empezar hoy con <strong className="font-bold text-slate-900">Hostinger VPS</strong>. Obtén 4 GB de RAM, 2 vCPU dedicados, 50 GB NVMe SSD y soporte 24/7 en español desde solo $4.99/mes.
            </p>
            <div className="pt-4">
              <a
                href="https://www.hostg.xyz/SHJlB"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-hostinger"
              >
                Visitar Hostinger VPS
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Garantía de reembolso 30 días • Virtualización KVM • Soporte 24/7 en español
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-violet-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              VPS<span className="text-violet-600 font-medium">Comparado</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left">
            © {new Date().getFullYear()} VPS Comparado. Todos los derechos reservados. Análisis independiente no afiliado.
          </p>
        </div>
      </footer>
    </div>
  );
}
