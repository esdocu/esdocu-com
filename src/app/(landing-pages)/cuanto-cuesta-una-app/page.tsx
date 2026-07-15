import {
  Smartphone,
  Code,
  ArrowRight,
  Sparkles,
  Palette,
  Server,
  Shield,
  Wrench,
  DollarSign,
  Check,
  Layers,
  HelpCircle,
  Zap,
  Users,
  Search,
  RefreshCw,
  Award,
  ExternalLink,
  Globe,
  Bell,
  Database,
  ShoppingBag,
  Upload,
  TestTube,
  MessageSquare,
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Cuánto Cuesta Hacer una App en 2026?",
  description:
    "Descubre cuánto cuesta crear una app móvil para Android e iOS en 2026. Guía completa de precios de diseño, desarrollo, backend, publicación en tiendas y mantenimiento. Desde $150 USD.",
  openGraph: {
    title: "¿Cuánto Cuesta Hacer una App en 2026? — Guía de Precios",
    description:
      "Todo lo que necesitas saber sobre los costos de desarrollo de apps móviles: diseño, programación, backend, publicación y mantenimiento. Desde $150 USD.",
    type: "website",
    url: "/cuanto-cuesta-una-app",
  },
};

export default function CuantoCuestaUnaAppPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "¿Cuánto Cuesta Hacer una App en 2026?",
            description:
              "Guía completa sobre los costos reales del desarrollo de apps móviles en 2026. Incluye precios de diseño, desarrollo, backend, publicación y mantenimiento.",
            author: {
              "@type": "Person",
              name: "Fabián Karaben",
            },
            publisher: {
              "@type": "Organization",
              name: "Esdocu",
            },
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
                name: "¿Cuánto cuesta hacer una app en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El costo de una app móvil en 2026 varía según su complejidad. Una app sencilla puede costar desde $150 USD (≈$225.000 ARS) usando Flutter para Android e iOS simultáneamente. Una app con backend, login y base de datos puede ir de $500 a $3.000 USD. Apps empresariales complejas superan los $5.000 USD.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué es Flutter y por qué es más económico?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Flutter es un framework de Google que permite crear apps para Android e iOS con un solo código. Esto reduce significativamente los costos de desarrollo porque no necesitas contratar dos equipos separados. El resultado es una app nativa de alto rendimiento para ambas plataformas.",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué incluye el precio de una app móvil?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El precio de una app incluye el diseño de la interfaz (UI/UX), el desarrollo/programación, el backend si necesita conexión a internet, la publicación en Google Play Store y/o Apple App Store, las pruebas en múltiples dispositivos, y opcionalmente el mantenimiento posterior al lanzamiento.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cuánto tarda en crearse una app móvil?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Una app sencilla puede estar lista en 2 a 4 semanas. Una app con backend, autenticación y funcionalidades medianas tarda entre 1 y 3 meses. Apps complejas con múltiples integraciones pueden llevar de 3 a 6 meses o más.",
                },
              },
            ],
          }),
        }}
      />

      <header className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-violet-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Costo<span className="text-violet-600 font-medium">App</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Guía de Precios 2026
          </span>
          <a
            href="#desglose-costos"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            id="nav-costs-btn"
          >
            Ver Costos
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
                Guía Completa de Precios 2026
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                ¿Cuánto Cuesta Hacer <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  una App Móvil?
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Te explicamos de forma simple cuánto cuesta crear una aplicación para Android e iOS en 2026, qué incluye cada parte del presupuesto y cómo ahorrar dinero con tecnología multiplataforma como Flutter.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#desglose-costos"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                  id="hero-cta-costs"
                >
                  Ver Desglose de Costos
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://fabiankaraben.github.io/es/flutter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-semibold rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm inline-flex items-center gap-2"
                  id="hero-cta-developer"
                >
                  Conocer al Desarrollador
                  <ExternalLink className="h-4 w-4" />
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
                      <span className="text-[10px] text-slate-400 font-mono">Presupuesto App 2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Palette className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Diseño UI/UX</p>
                        <p className="text-lg font-bold text-white">Mobile</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Code className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Desarrollo</p>
                        <p className="text-lg font-bold text-emerald-400">Flutter</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Smartphone className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Plataformas</p>
                        <p className="text-lg font-bold text-white">Android + iOS</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Upload className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Publicación</p>
                        <p className="text-lg font-bold text-cyan-400">Stores</p>
                      </div>
                    </div>

                    <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">App sencilla desde $150 USD</p>
                        <p className="text-[10px] text-violet-300">≈ $225.000 ARS • Android + iOS</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-50">
                    <Award className="h-5 w-5 text-violet-600 fill-violet-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-violet-800 tracking-wider uppercase">Desarrollador Flutter</p>
                    <p className="text-sm font-extrabold text-slate-900">+20 años de experiencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is an app? Explained simply */}
        <section className="py-20 bg-white border-y border-slate-200/60 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Qué es una App y Qué Necesitas para Crearla?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Una app móvil tiene varias partes que trabajan juntas. Entender cada una te ayudará a comprender el presupuesto y tomar mejores decisiones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-violet-50 w-fit mb-4">
                  <Palette className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Diseño UI/UX</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es cómo se ve y cómo se usa tu app: los colores, los botones, la navegación entre pantallas. Un buen diseño hace que tu app sea intuitiva y agradable. Incluye pantallas para celulares y tablets, adaptadas a las guías de diseño de Android (Material Design) e iOS (Human Interface).
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-emerald-50 w-fit mb-4">
                  <Code className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Desarrollo Frontend</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es la construcción de lo que el usuario ve y toca. Con <strong>Flutter</strong> (tecnología de Google), se escribe un solo código que funciona en Android e iOS simultáneamente. Esto reduce costos a casi la mitad comparado con desarrollar dos apps nativas por separado.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-amber-50 w-fit mb-4">
                  <Server className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Backend (Servidor)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Si tu app necesita login de usuarios, guardar datos o conectarse a internet, necesita un backend: un servidor que procesa la información. No todas las apps lo necesitan; una calculadora o una app de notas puede funcionar sin conexión a internet.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-cyan-50 w-fit mb-4">
                  <Database className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Base de Datos</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es donde se almacena la información de tu app: usuarios, productos, pedidos, mensajes. Puede estar en la nube (Firebase, Supabase, AWS) o en el propio teléfono. El tipo de base de datos depende de las necesidades de tu proyecto.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-rose-50 w-fit mb-4">
                  <Upload className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Publicación en Tiendas</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para que la gente pueda descargar tu app, necesitas publicarla en Google Play Store (Android) y/o Apple App Store (iOS). Google cobra una tarifa única de $25 USD, mientras que Apple cobra $99 USD/año. El proceso incluye capturas de pantalla, descripción y revisión por parte de la tienda.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-indigo-50 w-fit mb-4">
                  <Wrench className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Mantenimiento</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Android e iOS lanzan actualizaciones constantes. Tu app necesita mantenimiento para seguir funcionando: corrección de errores, adaptación a nuevas versiones del sistema operativo, actualizaciones de seguridad y mejoras de rendimiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Flutter Advantage */}
        <section className="py-20 px-6 bg-[#F5F7FB]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Por Qué Flutter Reduce los Costos?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Tradicionalmente, crear una app para Android y otra para iOS requería dos equipos y dos presupuestos. Flutter cambia las reglas del juego.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-red-100/60 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-red-50">
                    <Layers className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">Desarrollo Nativo Tradicional</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Necesitas un desarrollador (o equipo) para Android con Kotlin/Java</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Necesitas otro desarrollador (o equipo) para iOS con Swift</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>El presupuesto se duplica: dos codebases, doble testeo, doble mantenimiento</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Una app nativa sencilla para ambas plataformas: $1.000–$5.000+ USD</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.03)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-violet-50">
                    <Zap className="h-5 w-5 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">Con Flutter (Google)</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Un solo código</strong> que compila para Android e iOS simultáneamente</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Un solo desarrollador</strong> puede crear ambas versiones</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Rendimiento nativo</strong>: se compila a código máquina, no es una web disfrazada</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Desde $150 USD</strong> para una app sencilla en ambas plataformas</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed text-center max-w-3xl mx-auto">
                <strong className="text-slate-900">Flutter es usado por Google, BMW, Toyota, Alibaba, eBay y miles de empresas más.</strong> Es un framework maduro, respaldado por Google, con una comunidad enorme y miles de paquetes disponibles. Elegir Flutter es elegir la tecnología multiplataforma más popular del mundo.
              </p>
            </div>
          </div>
        </section>

        {/* Cost Breakdown Table */}
        <section id="desglose-costos" className="py-20 px-6 bg-white border-y border-slate-200/60 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Desglose de Costos Reales en 2026
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Estos son los rangos de precios reales para crear una app móvil con Flutter. Los precios de desarrollo varían según la complejidad del proyecto.
              </p>
            </div>

            {/* Cost Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <table className="w-full border-collapse text-left bg-white">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Concepto</th>
                    <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Rango de Precio</th>
                    <th className="py-5 px-6 font-semibold text-slate-600 text-sm">Frecuencia</th>
                    <th className="py-5 px-6 font-semibold text-slate-600 text-sm hidden md:table-cell">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr className="bg-violet-50/30">
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-violet-500 shrink-0" />
                        App Sencilla (Flutter)
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-violet-700 font-semibold">Desde $150 USD</div>
                      <div className="text-xs text-slate-500">≈ $225.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">3–5 pantallas, sin backend, Android + iOS</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                        App con Backend
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-700">$500 – $3.000 USD</div>
                      <div className="text-xs text-slate-500">≈ $750.000 – $4.500.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Login, base de datos, API, notificaciones</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-indigo-500 shrink-0" />
                        App E-commerce / Marketplace
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-700">$2.000 – $10.000 USD</div>
                      <div className="text-xs text-slate-500">≈ $3.000.000 – $15.000.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Catálogo, carrito, pagos, panel de admin</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-amber-500 shrink-0" />
                        Publicación Google Play
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$25 USD</td>
                    <td className="py-5 px-6 text-slate-600">Único (de por vida)</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Cuenta de desarrollador Google</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-amber-500 shrink-0" />
                        Publicación Apple App Store
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$99 USD/año</td>
                    <td className="py-5 px-6 text-slate-600">Anual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Apple Developer Program</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-cyan-500 shrink-0" />
                        Backend / Servidor
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$0 – $50 USD/mes</td>
                    <td className="py-5 px-6 text-slate-600">Mensual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Firebase/Supabase gratis hasta cierto uso</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-rose-500 shrink-0" />
                        Mantenimiento
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$30 – $150 USD/mes</td>
                    <td className="py-5 px-6 text-slate-600">Mensual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Actualizaciones, corrección de bugs, soporte</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-[#F5F7FB] p-6 rounded-2xl border border-violet-100/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-violet-50 shrink-0">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Presupuesto mínimo para empezar</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Con <strong className="text-slate-900">$150 USD (≈ $225.000 ARS)</strong> puedes obtener una app sencilla con Flutter que funcione en Android e iOS. Sumando la cuenta de Google Play ($25 USD), tu inversión mínima sería de <strong className="text-slate-900">$175 USD (≈ $260.000 ARS)</strong>. Si también quieres publicar en Apple App Store, agrega $99 USD/año por la cuenta de desarrollador de Apple.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Highlight */}
        <section className="py-20 bg-[#F5F7FB] px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Desarrollador Flutter Recomendado
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Contratar a un desarrollador experimentado en Flutter es la forma más eficiente de obtener una app de calidad para Android e iOS sin duplicar costos.
              </p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-2xl border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-violet-200/20 to-transparent rounded-bl-full" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold tracking-wider uppercase mb-2">
                      Profesional Recomendado
                    </span>
                    <h3 className="text-2xl font-bold text-slate-950">Fabián Karaben</h3>
                    <p className="text-violet-600 text-sm font-semibold">Desarrollador Flutter & Full Stack — +20 años de experiencia</p>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Desarrollador especializado en Flutter con experiencia en apps fintech, e-commerce y herramientas de productividad. Ha trabajado como Sr. Flutter Developer en OpenPass (billetera virtual fintech) y como freelance para clientes en plataformas como Freelancer.com y Workana. Certificado por AWS, combina desarrollo móvil con experiencia sólida en backend (Go, Node.js, Java/Spring Boot).
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué elegirlo?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Precios accesibles:</strong> Apps sencillas desde $150 USD (≈ $225.000 ARS). Ideal para emprendedores y startups hispanas.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Experiencia en Flutter profesional:</strong> Desarrolló apps fintech en producción para OpenPass, usadas por múltiples empresas.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Android + iOS con un solo código:</strong> Flutter le permite entregar ambas plataformas sin duplicar costos ni tiempos.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Backend incluido si lo necesitas:</strong> Puede desarrollar el servidor y la base de datos de tu app, no solo el frontend.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Comunicación directa:</strong> Trato directo con el desarrollador, sin intermediarios. Español nativo y atención personalizada.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <a
                      href="https://fabiankaraben.github.io/es/flutter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      Ver Portfolio Flutter
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#F5F7FB] p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-600" />
                      Precios de Referencia
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">App Sencilla (Flutter)</span>
                        <span className="text-sm font-bold text-slate-900">Desde $150 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">App con Backend</span>
                        <span className="text-sm font-bold text-slate-900">Desde $500 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">App E-commerce</span>
                        <span className="text-sm font-bold text-slate-900">Desde $2.000 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-slate-600">Mantenimiento</span>
                        <span className="text-sm font-bold text-slate-900">Desde $30 USD/mes</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Precios orientativos. El costo final depende de las funcionalidades y complejidad del proyecto.
                    </p>
                  </div>

                  <div className="bg-[#F5F7FB] p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-violet-600" />
                      Tecnologías
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Flutter", "Dart", "Firebase", "Supabase", "Go", "Node.js", "TypeScript", "AWS", "PostgreSQL", "REST API"].map(
                        (tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg bg-white text-[11px] font-semibold text-slate-700 border border-slate-200/50"
                          >
                            {tech}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What your app should include */}
        <section className="py-20 px-6 bg-white border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Qué Debe Incluir tu App?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Antes de contratar, asegúrate de que tu app incluya estos elementos esenciales para ofrecer una experiencia profesional a tus usuarios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-violet-50 h-fit shrink-0">
                  <Smartphone className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Diseño Adaptativo</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tu app debe verse bien en cualquier tamaño de pantalla: desde un celular pequeño hasta una tablet grande. Flutter facilita esto con widgets que se adaptan automáticamente al dispositivo.
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 h-fit shrink-0">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Rendimiento Nativo</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tu app debe abrir rápido, las animaciones deben ser fluidas y la navegación instantánea. Flutter compila a código nativo, por lo que el rendimiento es comparable a apps escritas específicamente para cada plataforma.
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-amber-50 h-fit shrink-0">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Notificaciones Push</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Si tu app necesita comunicarse con los usuarios (recordatorios, ofertas, actualizaciones), las notificaciones push son fundamentales. Se integran fácilmente con Firebase Cloud Messaging (FCM).
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-cyan-50 h-fit shrink-0">
                  <Shield className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Seguridad</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Si tu app maneja datos de usuarios, necesita autenticación segura (login con email, Google, Apple), almacenamiento encriptado y comunicación HTTPS con el servidor. La seguridad no es opcional.
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-rose-50 h-fit shrink-0">
                  <TestTube className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Pruebas en Dispositivos Reales</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tu app debe probarse en múltiples dispositivos antes de publicarse: celulares Android de distintas marcas y tamaños, iPhones de diferentes generaciones. Un buen desarrollador testea en dispositivos reales, no solo emuladores.
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50 flex gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 h-fit shrink-0">
                  <Search className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">ASO (App Store Optimization)</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Así como los sitios web necesitan SEO, las apps necesitan ASO: títulos optimizados, descripción clara, capturas de pantalla atractivas y palabras clave relevantes para aparecer en las búsquedas de las tiendas de apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="py-20 px-6 bg-[#F5F7FB]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                5 Errores que Encarecen tu App
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evita estos errores comunes que terminan costándote más dinero y tiempo del necesario.
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {[
                {
                  title: "Querer desarrollar nativo para Android e iOS por separado",
                  description:
                    "Desarrollar dos apps nativas duplica el costo de desarrollo, testeo y mantenimiento. Con Flutter obtienes ambas plataformas con un solo código y un solo desarrollador, ahorrando entre un 30% y un 50% del presupuesto total.",
                },
                {
                  title: "No definir un MVP (Producto Mínimo Viable)",
                  description:
                    "Intentar lanzar una app con todas las funcionalidades posibles desde el día uno es la forma más rápida de agotar tu presupuesto. Empieza con las funcionalidades esenciales, lanza, obtén feedback de usuarios reales y luego itera.",
                },
                {
                  title: "Usar plataformas no-code para apps complejas",
                  description:
                    "Herramientas como Adalo, FlutterFlow o Glide sirven para prototipos simples, pero tienen limitaciones serias en personalización, rendimiento y escalabilidad. Si tu app necesita crecer, eventualmente necesitarás reescribirla desde cero.",
                },
                {
                  title: "No presupuestar la cuenta de desarrollador de Apple",
                  description:
                    "Google Play cobra $25 USD (una sola vez), pero Apple cobra $99 USD cada año para mantener tus apps publicadas. Si no renuevas, tu app desaparece de la App Store. Incluye este costo recurrente en tu presupuesto desde el inicio.",
                },
                {
                  title: "Lanzar sin plan de mantenimiento",
                  description:
                    "Android e iOS se actualizan varias veces al año. Si tu app no se adapta, puede dejar de funcionar o ser removida de las tiendas. Planifica un presupuesto de mantenimiento mensual para correcciones, actualizaciones y mejoras.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6 flex gap-4"
                >
                  <span className="text-lg font-extrabold text-amber-600/70 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process: How it works */}
        <section className="py-20 px-6 bg-white border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Cómo es el Proceso de Crear una App?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Así funciona el proceso paso a paso, desde la idea hasta tener tu app disponible en las tiendas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  step: "01",
                  title: "Definición",
                  description:
                    "Nos cuentas tu idea, definimos las pantallas, funcionalidades y el alcance del MVP. Preparamos una propuesta con precio y tiempos.",
                  icon: MessageSquare,
                  color: "violet",
                },
                {
                  step: "02",
                  title: "Diseño UI",
                  description:
                    "Creamos las maquetas visuales de cada pantalla. Ves cómo se verá tu app antes de programarla. Tú apruebas el diseño.",
                  icon: Palette,
                  color: "emerald",
                },
                {
                  step: "03",
                  title: "Desarrollo",
                  description:
                    "Programamos la app con Flutter. Un solo código para Android e iOS. Entregas parciales para que veas el progreso real.",
                  icon: Code,
                  color: "amber",
                },
                {
                  step: "04",
                  title: "Testing",
                  description:
                    "Probamos en dispositivos reales. Corregimos bugs, optimizamos rendimiento y verificamos la experiencia completa.",
                  icon: TestTube,
                  color: "cyan",
                },
                {
                  step: "05",
                  title: "Publicación",
                  description:
                    "Subimos tu app a Google Play y/o App Store. Configuramos capturas, descripción y todo lo necesario para la revisión.",
                  icon: Upload,
                  color: "rose",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#F5F7FB] p-6 rounded-2xl border border-slate-200/50 relative"
                >
                  <span className="text-4xl font-extrabold text-slate-100 absolute top-3 right-4 select-none">
                    {item.step}
                  </span>
                  <div
                    className={`p-3 rounded-xl w-fit mb-4 ${
                      item.color === "violet"
                        ? "bg-violet-50"
                        : item.color === "emerald"
                          ? "bg-emerald-50"
                          : item.color === "amber"
                            ? "bg-amber-50"
                            : item.color === "cyan"
                              ? "bg-cyan-50"
                              : "bg-rose-50"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        item.color === "violet"
                          ? "text-violet-600"
                          : item.color === "emerald"
                            ? "text-emerald-600"
                            : item.color === "amber"
                              ? "text-amber-600"
                              : item.color === "cyan"
                                ? "text-cyan-600"
                                : "text-rose-600"
                      }`}
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-950 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-[#F5F7FB]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Preguntas Frecuentes
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Las dudas más comunes sobre los costos de desarrollo de apps móviles, respondidas de forma clara.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Cuánto cuesta hacer una app en 2026?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Depende de la complejidad. Una <strong>app sencilla con Flutter</strong> (3–5 pantallas, sin backend) puede costar desde <strong>$150 USD (≈ $225.000 ARS)</strong> y funcionar en Android e iOS. Una app con login, base de datos y notificaciones va de $500 a $3.000 USD. Apps tipo marketplace o e-commerce pueden superar los $5.000 USD.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Qué es Flutter y por qué reduce costos?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>Flutter</strong> es un framework de código abierto creado por Google que permite crear apps para Android e iOS con <strong>un solo código fuente</strong>. En vez de contratar dos equipos (uno para Android y otro para iOS), un solo desarrollador Flutter puede entregar ambas versiones. Esto reduce el presupuesto entre un 30% y un 50%. Además, Flutter compila a código nativo, por lo que el rendimiento es excelente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Necesito un backend para mi app?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <strong>No siempre.</strong> Si tu app funciona de forma independiente (calculadora, lista de tareas, juego offline), no necesita backend. Pero si tu app requiere <strong>registro de usuarios, almacenar datos en la nube, enviar notificaciones o procesar pagos</strong>, sí necesitarás un servidor. Servicios como Firebase o Supabase ofrecen planes gratuitos que cubren apps pequeñas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Cuánto tarda en crearse una app?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Una app sencilla puede estar lista en <strong>2 a 4 semanas</strong>. Una app mediana con backend tarda entre <strong>1 y 3 meses</strong>. Apps complejas con múltiples integraciones pueden llevar <strong>3 a 6 meses o más</strong>. A esto hay que sumar el tiempo de revisión de Google (horas/días) y Apple (1–3 días) para aprobar la publicación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-linear-to-b from-white to-violet-50/20 text-center relative overflow-hidden border-t border-slate-200/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_100%,rgba(109,40,217,0.05)_0%,transparent_100%)]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              ¿Listo para crear tu app?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Contacta a <strong className="font-bold text-slate-900">Fabián Karaben</strong>, desarrollador Flutter con experiencia en apps fintech y +20 años de trayectoria. Apps para Android e iOS desde $150 USD. Comunicación directa, sin intermediarios.
            </p>
            <div className="pt-4">
              <a
                href="https://fabiankaraben.github.io/es/flutter"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-developer"
              >
                Ver Portfolio Flutter
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              +20 años de experiencia • Flutter & Dart • Android + iOS • Español nativo
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-violet-600" />
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                Costo<span className="text-violet-600 font-medium">App</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs text-center md:text-left">
              © {new Date().getFullYear()} CostoApp. Todos los derechos reservados.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-[11px] leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-slate-500">Aviso:</strong> Los precios mencionados en esta página son orientativos y pueden variar según la complejidad del proyecto, los requisitos específicos y las condiciones del mercado. Esta página contiene enlaces al portfolio de un desarrollador recomendado. Nuestro análisis es completamente honesto, objetivo y basado en nuestra experiencia real en el sector del desarrollo de apps móviles.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
