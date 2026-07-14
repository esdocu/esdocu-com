import {
  Check,
  X,
  Star,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Headphones,
  Gauge,
  Lock,
  TriangleAlert,
  Eye,
  EyeOff,
  HelpCircle,
  Tv,
  Wifi,
  MonitorSmartphone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import { VpnComparisonTable } from "./comparison-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Mejor VPN en 2026",
  description:
    "Descubre cuál es la mejor VPN en 2026. Análisis completo de NordVPN, ExpressVPN, Surfshark y CyberGhost. Comparativa de velocidad, privacidad, precio y streaming.",
  openGraph: {
    title: "La Mejor VPN en 2026 - Comparativa Completa",
    description:
      "Comparamos las mejores VPN del mercado: NordVPN, ExpressVPN, Surfshark y CyberGhost. Encuentra la VPN ideal para proteger tu privacidad y desbloquear contenido.",
    type: "website",
    url: "/mejor-vpn",
  },
};

export default function VpnLandingPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "La Mejor VPN en 2026",
            image: "https://esdocu.com/images/vpn-comparison.png",
            description:
              "Análisis comparativo de las mejores VPN del mercado. Comparamos NordVPN, ExpressVPN, Surfshark y CyberGhost.",
            author: {
              "@type": "Person",
              name: "VPN Comparado",
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
                name: "¿Cuál es la mejor VPN en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "NordVPN es la VPN recomendada en 2026 gracias a su protocolo NordLynx (basado en WireGuard) que ofrece las mejores velocidades, más de 6,400 servidores en 111 países, política no-logs auditada por PwC y Deloitte, y un precio competitivo desde $3.39/mes.",
                },
              },
              {
                "@type": "Question",
                name: "¿Es legal usar una VPN?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sí, usar una VPN es completamente legal en la mayoría de países del mundo, incluyendo España, México, Argentina, Colombia y toda Latinoamérica. Una VPN es una herramienta de privacidad legítima. Sin embargo, lo que hagas mientras estás conectado a la VPN sigue sujeto a las leyes locales.",
                },
              },
              {
                "@type": "Question",
                name: "¿Una VPN reduce la velocidad de internet?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Toda VPN añade algo de latencia al encriptar y redirigir tu tráfico, pero las mejores VPN modernas (como NordVPN con NordLynx) reducen la velocidad en solo un 5-15%. En muchos casos, si tu ISP limita la velocidad de ciertos servicios (throttling), una VPN puede incluso mejorar tu experiencia.",
                },
              },
            ],
          }),
        }}
      />

      <header className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-violet-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            VPN<span className="text-violet-600 font-medium">Comparado</span>
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
                Guía de Compra VPN 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                La Mejor VPN <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  en 2026
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Comparamos las VPN más populares del mercado. Analizamos velocidad, privacidad, capacidad de desbloquear streaming, precio y soporte para que navegues seguro y sin restricciones.
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
                  href="https://nordvpn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center"
                  id="hero-cta-details"
                >
                  Ir a NordVPN.com
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
                      <span className="text-[10px] text-slate-400 font-mono">NordVPN — Conectado</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Estado</p>
                        <p className="text-lg font-bold text-emerald-400">Protegido</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <MapPin className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Servidor</p>
                        <p className="text-lg font-bold text-white">Madrid</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Zap className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Protocolo</p>
                        <p className="text-lg font-bold text-white">NordLynx</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Gauge className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Velocidad</p>
                        <p className="text-lg font-bold text-cyan-400">850 Mbps</p>
                      </div>
                    </div>

                    <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Encriptación AES-256</p>
                        <p className="text-[10px] text-violet-300">IP oculta • Sin registros</p>
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
                    <p className="text-sm font-extrabold text-slate-900">NordVPN desde $3.39/mes</p>
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
                Comparativa de las Mejores VPN
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evaluamos los aspectos más importantes que definen la calidad de una VPN: velocidad, privacidad, servidores, streaming y precio.
              </p>
            </div>

            <VpnComparisonTable />
          </div>
        </section>

        {/* Detailed Reviews */}
        <section id="analisis-detalle" className="py-20 px-6 bg-[#F5F7FB] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Análisis Detallado de Cada VPN
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Descubre los puntos fuertes y débiles de las VPN más populares para tomar una decisión informada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* NordVPN */}
              <div className="bg-white p-8 rounded-2xl border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.03)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-violet-200/20 to-transparent rounded-bl-full" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Ganador Recomendado 2026
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">NordVPN</h3>
                      <p className="text-violet-600 text-sm font-semibold">nordvpn.com</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                      <Star className="h-6 w-6 fill-violet-500" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    NordVPN se ha consolidado como la VPN más completa del mercado. Su protocolo propietario NordLynx (basado en WireGuard) ofrece las velocidades más altas de la industria con una pérdida mínima de rendimiento. Con más de 6,400 servidores en 111 países, política no-logs auditada por PwC y Deloitte, y sede en Panamá (fuera de la alianza 14 Eyes), es la opción más equilibrada entre velocidad, privacidad y funcionalidades avanzadas como Threat Protection, Double VPN y Meshnet.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué destaca?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>NordLynx ultrarrápido:</strong> Basado en WireGuard con capa de privacidad adicional, la VPN más rápida en pruebas independientes.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Privacidad auditada:</strong> Política no-logs verificada por PwC y Deloitte. Sede en Panamá, sin obligación legal de guardar datos.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Desbloquea todo:</strong> Netflix, Disney+, HBO Max, BBC iPlayer, Amazon Prime y más sin problemas.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ENFOQUE: VPN completa y rápida</span>
                  <a
                    href="https://nordvpn.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Probar NordVPN
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* ExpressVPN */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Premium Costosa
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">ExpressVPN</h3>
                      <p className="text-slate-400 text-sm">La más fácil de usar, pero la más cara</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Globe className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    ExpressVPN es una de las VPN más reconocidas del mercado por su interfaz impecable y su protocolo Lightway propietario. Ofrece servidores TrustedServer que funcionan exclusivamente en RAM (sin discos), lo que elimina cualquier rastro al reiniciar. Sin embargo, es la VPN más cara del mercado ($6.67/mes en su mejor plan) y solo permite 8 conexiones simultáneas. Está basada en las Islas Vírgenes Británicas.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Servidores RAM-only:</strong> Tecnología TrustedServer que no almacena nada en disco.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>La más cara del mercado:</strong> Casi el doble que NordVPN sin ofrecer más funciones.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Facilidad de uso premium</span>
                </div>
              </div>

              {/* Surfshark */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Mejor Precio
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Surfshark</h3>
                      <p className="text-slate-400 text-sm">Dispositivos ilimitados al mejor precio</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <MonitorSmartphone className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Surfshark es la VPN más económica del mercado ($2.19/mes en plan de 2 años) y la única que permite dispositivos ilimitados. Incluye WireGuard, CleanWeb (bloqueador de anuncios), MultiHop (doble VPN) y modo Camouflage para ocultar el uso de VPN. Su principal debilidad es que la velocidad puede ser inconsistente en servidores lejanos y el desbloqueo de streaming no siempre funciona al primer intento. Basada en los Países Bajos.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Dispositivos ilimitados:</strong> Conecta toda tu familia sin límite de conexiones.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Velocidad inconsistente:</strong> Servidores lejanos pueden ser lentos; streaming a veces requiere cambiar de servidor.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Precio bajo + dispositivos ilimitados</span>
                </div>
              </div>

              {/* CyberGhost */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Más Servidores
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">CyberGhost</h3>
                      <p className="text-slate-400 text-sm">11,000+ servidores optimizados</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                      <Wifi className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    CyberGhost presume la red más grande con más de 11,000 servidores en 100 países, incluyendo servidores específicos optimizados para cada plataforma de streaming (Netflix US, BBC iPlayer, etc.) y para descargas P2P. Ofrece 45 días de garantía de reembolso (la más larga del mercado). Sin embargo, sus velocidades son irregulares en servidores distantes, no funciona en China y el protocolo propietario no destaca frente a NordLynx. Basada en Rumania.
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <h4 className="font-bold text-slate-900 text-sm">Pros y Contras</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Red gigante:</strong> 11,000+ servidores con perfiles dedicados por plataforma de streaming.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong>Velocidad variable:</strong> En servidores lejanos el rendimiento cae notablemente; no funciona en China.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">ENFOQUE: Streaming y P2P</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="py-20 bg-white border-t border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Cómo elegir la VPN perfecta?
            </h2>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">1. Velocidad y protocolo</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Una VPN lenta arruina la experiencia. Busca proveedores que ofrezcan protocolos modernos como WireGuard o NordLynx, que minimizan la pérdida de velocidad al encriptar. Evita VPN que solo ofrecen OpenVPN (más lento) o PPTP (inseguro). En pruebas independientes, NordLynx ofrece consistentemente las velocidades más altas del mercado.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <EyeOff className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">2. Política no-logs auditada</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Cualquier VPN puede decir que &quot;no guarda registros&quot;, pero solo unas pocas han sido auditadas por firmas independientes (PwC, Deloitte, KPMG, Cure53). Además, la jurisdicción importa: una VPN con sede en Panamá o las Islas Vírgenes Británicas no tiene obligación legal de entregar datos a gobiernos. Evita VPN con sede en países de la alianza 5/9/14 Eyes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Tv className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">3. Desbloqueo de streaming</h3>
                  <p className="text-slate-600 leading-relaxed">
                    No todas las VPN pueden desbloquear Netflix, Disney+, HBO Max o Amazon Prime de otros países. Las plataformas de streaming luchan activamente contra las VPN bloqueando rangos de IPs. Solo las mejores VPN (como NordVPN y ExpressVPN) mantienen servidores constantemente actualizados para superar estos bloqueos de forma confiable.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 h-12 w-12 shrink-0 flex items-center justify-center">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">4. Cantidad y ubicación de servidores</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Más servidores significan menos congestión y mejor velocidad. Pero la distribución geográfica también importa: si quieres acceder a contenido de un país específico, verifica que la VPN tenga servidores allí. NordVPN lidera con 6,400+ servidores en 111 países, la mayor cobertura por países del mercado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Trap of Free VPNs */}
        <section className="py-20 bg-slate-900 text-white px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 flex justify-center">
              <TriangleAlert className="w-48 h-48 text-violet-400 opacity-20" />
            </div>
            <div className="md:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-violet-900 text-violet-300 text-[11px] font-bold tracking-wider uppercase border border-violet-700">
                Alerta de Privacidad
              </span>
              <h2 className="text-3xl font-display font-extrabold tracking-tight">
                La trampa peligrosa de las &quot;VPN Gratuitas&quot;
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Instalar una VPN gratuita es una de las decisiones más peligrosas que puedes tomar para tu privacidad. La regla es simple: <em>&quot;Si no pagas por el producto, tú eres el producto.&quot;</em>
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Venden tus datos:</strong> Estudios de CSIRO y Top10VPN han demostrado que el 72% de las VPN gratuitas contienen rastreadores de terceros. Tu historial de navegación, ubicación y datos personales se venden a anunciantes y brokers de datos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Inyectan malware:</strong> Investigaciones han encontrado que el 38% de las apps de VPN gratuitas en Google Play contienen algún tipo de malware o adware. Algunas incluso usan tu dispositivo como nodo de salida para el tráfico de otros usuarios.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Encriptación débil o nula:</strong> Muchas VPN gratuitas usan protocolos obsoletos (PPTP) o directamente no encriptan tu tráfico, dándote una falsa sensación de seguridad mientras tu ISP y hackers pueden ver todo lo que haces.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">
                    <strong>Velocidades inutilizables:</strong> Los servidores gratuitos están saturados de usuarios. El streaming en HD es imposible y las descargas pueden tardar horas. Límites de datos de 500 MB-2 GB/mes son la norma.
                  </span>
                </li>
              </ul>
              <div className="p-4 bg-violet-800/50 rounded-xl border border-violet-700/50 mt-4">
                <p className="text-sm text-violet-200">
                  <strong className="text-white">Conclusión:</strong> Una VPN premium como NordVPN ($3.39/mes) cuesta menos que un café al mes, pero protege tu privacidad de verdad con encriptación AES-256, política no-logs auditada y velocidades que permiten streaming en 4K sin interrupciones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: NordLynx vs Other Protocols */}
        <section className="py-20 bg-[#F5F7FB] border-y border-slate-200/60 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight text-center mb-12">
              ¿Por qué NordLynx es el protocolo VPN más rápido de 2026?
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-12">
              <p>
                Durante años, <strong>OpenVPN</strong> fue el estándar de la industria. Aunque es seguro, su código pesado genera latencia significativa. <strong>WireGuard</strong> revolucionó el campo con solo 4,000 líneas de código (vs. 400,000 de OpenVPN), pero tenía un problema de privacidad: requería almacenar IPs estáticas. NordVPN resolvió esto creando <strong>NordLynx</strong>, que agrega una capa de privacidad sobre WireGuard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <Zap className="w-8 h-8 text-violet-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Velocidad hasta 2x vs OpenVPN</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    NordLynx está diseñado para maximizar el throughput manteniendo latencia mínima. En pruebas de AV-TEST (instituto independiente), NordVPN con NordLynx alcanzó velocidades de descarga de más de 850 Mbps, duplicando las velocidades típicas de OpenVPN. Ideal para streaming en 4K, gaming online y descargas pesadas.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <Shield className="w-8 h-8 text-violet-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Privacidad mejorada sobre WireGuard</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    WireGuard puro necesita almacenar tu IP en el servidor para funcionar. NordLynx resuelve esto con un sistema de doble NAT que asigna IPs dinámicas y las descarta al desconectar. Resultado: velocidad de WireGuard + privacidad total. Ningún otro proveedor ha implementado una solución tan elegante.
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
              ¿Para qué necesitas una VPN?
            </h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <EyeOff className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Proteger tu privacidad online</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Tu proveedor de internet (ISP) puede ver y registrar cada página web que visitas. En muchos países, están obligados a almacenar tu historial de navegación durante años. Una VPN encripta todo tu tráfico, haciendo imposible que tu ISP, hackers en redes WiFi públicas o gobiernos espíen tu actividad online.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Esencial para: Todos los usuarios de internet.</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Tv className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Desbloquear streaming de otros países</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Netflix tiene catálogos diferentes en cada país. Con una VPN puedes conectarte a un servidor en EE.UU. y acceder a todo el catálogo americano, o a uno en Japón para ver anime exclusivo. Lo mismo aplica para Disney+, HBO Max, BBC iPlayer, Hulu y muchas más plataformas con restricciones geográficas.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Ideal para: Amantes del cine, series y anime.</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F7FB] p-8 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                  <Wifi className="w-8 h-8 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Seguridad en redes WiFi públicas</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Las redes WiFi de cafeterías, aeropuertos, hoteles y centros comerciales son el paraíso de los hackers. Sin una VPN, cualquier persona en la misma red puede interceptar tus contraseñas, correos y datos bancarios mediante ataques &quot;man-in-the-middle&quot;. Una VPN crea un túnel encriptado que hace tu conexión impenetrable, incluso en la WiFi más insegura.
                  </p>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Esencial para: Viajeros, nómadas digitales y trabajadores remotos.</span>
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
              Preguntas Frecuentes sobre VPN
            </h2>

            <div className="space-y-6">
              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Es legal usar una VPN?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  <strong>Sí, usar una VPN es completamente legal</strong> en la inmensa mayoría de países, incluyendo España, México, Argentina, Colombia, Chile, Perú y toda Latinoamérica, así como en Estados Unidos, Canadá y la Unión Europea. Una VPN es una herramienta de privacidad legítima utilizada por empresas, periodistas, activistas y ciudadanos comunes. Sin embargo, lo que hagas mientras estás conectado sigue sujeto a las leyes locales. Nota: algunos países con censura (China, Rusia, Irán) restringen o prohíben las VPN no aprobadas por el gobierno.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Una VPN reduce la velocidad de internet?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Toda VPN añade algo de latencia porque encripta y redirige tu tráfico a través de un servidor intermedio. Sin embargo, <strong>las mejores VPN modernas reducen la velocidad en solo un 5-15%</strong>. NordVPN con NordLynx es la que menos impacto tiene según pruebas de AV-TEST. Curiosamente, si tu ISP practica &quot;throttling&quot; (limitar la velocidad de ciertos servicios como Netflix o YouTube), una VPN puede incluso <strong>mejorar</strong> tu velocidad porque el ISP no puede detectar qué servicio estás usando.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Qué significa &quot;política no-logs&quot;?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Una política &quot;no-logs&quot; (sin registros) significa que el proveedor de VPN <strong>no almacena ningún dato sobre tu actividad</strong>: ni las páginas que visitas, ni los archivos que descargas, ni tu IP real, ni las horas de conexión. Sin embargo, no basta con que lo digan; debe estar <strong>verificado por auditorías independientes</strong>. NordVPN ha sido auditada dos veces por PwC y una vez por Deloitte, confirmando que efectivamente no guarda registros de actividad de ningún tipo.
                </div>
              </details>

              <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-slate-900 text-lg list-none">
                  ¿Puedo usar una VPN en mi celular y Smart TV?
                  <span className="text-violet-600 font-bold text-2xl group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-200/50 mt-4 pt-4">
                  Sí. Las principales VPN ofrecen apps nativas para <strong>Windows, macOS, Linux, iOS, Android, Fire TV y Android TV</strong>. NordVPN también ofrece extensiones para Chrome y Firefox, y se puede configurar directamente en el router para proteger toda la red doméstica (incluyendo Smart TVs, consolas de videojuegos y dispositivos IoT). Con 10 conexiones simultáneas, puedes proteger todos tus dispositivos con una sola suscripción.
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
              ¿Listo para navegar seguro y sin restricciones?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Te recomendamos empezar hoy con <strong className="font-bold text-slate-900">NordVPN</strong>. Obtén la VPN más rápida del mercado con NordLynx, 6,400+ servidores en 111 países y privacidad auditada desde solo $3.39/mes.
            </p>
            <div className="pt-4">
              <a
                href="https://nordvpn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-nordvpn"
              >
                Visitar NordVPN.com
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Garantía de reembolso 30 días • Encriptación AES-256 • Soporte 24/7 en español
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              VPN<span className="text-violet-600 font-medium">Comparado</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left">
            © {new Date().getFullYear()} VPN Comparado. Todos los derechos reservados. Análisis independiente no afiliado.
          </p>
        </div>
      </footer>
    </div>
  );
}
