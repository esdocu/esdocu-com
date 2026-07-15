import {
  Code,
  Globe,
  ArrowRight,
  Sparkles,
  Palette,
  Server,
  Shield,
  Wrench,
  DollarSign,
  Clock,
  Check,
  FileText,
  Layers,
  HelpCircle,
  Zap,
  Users,
  Smartphone,
  Search,
  RefreshCw,
  Award,
  ExternalLink,
} from "lucide-react";
import { ForceLightTheme } from "./force-light-theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Cuánto Cuesta Hacer una Página Web en 2026?",
  description:
    "Descubre cuánto cuesta crear una página web en 2026. Guía completa de precios de diseño, desarrollo, dominio, hosting y mantenimiento. Presupuestos desde $150 USD.",
  openGraph: {
    title: "¿Cuánto Cuesta Hacer una Página Web en 2026? — Guía de Precios",
    description:
      "Todo lo que necesitas saber sobre los costos de desarrollo web: diseño, programación, dominio, hosting y mantenimiento. Desde $150 USD.",
    type: "website",
    url: "/cuanto-cuesta-pagina-web",
  },
};

export default function CuantoCuestaPaginaWebPage() {
  return (
    <div className="grow bg-[#F5F7FB] text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      <ForceLightTheme />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "¿Cuánto Cuesta Hacer una Página Web en 2026?",
            description:
              "Guía completa sobre los costos reales del desarrollo web en 2026. Incluye precios de diseño, desarrollo, dominio, hosting y mantenimiento.",
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
                name: "¿Cuánto cuesta hacer una página web en 2026?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El costo de una página web en 2026 varía según su complejidad. Una landing page profesional puede costar desde $150 USD (≈$225.000 ARS), mientras que un sitio corporativo completo puede ir de $500 a $3.000 USD. Los costos recurrentes incluyen dominio ($10-15 USD/año) y hosting ($3-10 USD/mes).",
                },
              },
              {
                "@type": "Question",
                name: "¿Qué incluye el precio de una página web?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El precio de una página web incluye el diseño visual (UI/UX), el desarrollo/programación, la configuración del dominio, el hosting o alojamiento web, la integración de contenidos, la optimización SEO básica y, opcionalmente, el mantenimiento mensual posterior al lanzamiento.",
                },
              },
              {
                "@type": "Question",
                name: "¿Puedo crear una página web gratis?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Existen plataformas gratuitas como WordPress.com o Wix con planes free, pero tienen limitaciones importantes: tu dominio incluirá la marca de la plataforma, no podrás personalizar completamente el diseño, tendrás publicidad forzada y tu SEO será limitado. Para un resultado profesional, se recomienda invertir al menos en un dominio propio y un hosting de calidad.",
                },
              },
              {
                "@type": "Question",
                name: "¿Cuánto cuesta el mantenimiento de una página web?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "El mantenimiento básico de una página web (actualizaciones de seguridad, backups, monitoreo) puede costar entre $20 y $100 USD/mes. Si necesitas actualizaciones de contenido, nuevas funcionalidades o soporte técnico continuo, el costo puede ser mayor dependiendo del alcance del trabajo.",
                },
              },
            ],
          }),
        }}
      />

      <header className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-violet-600" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Costo<span className="text-violet-600 font-medium">Web</span>
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
                  una Página Web?
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Te explicamos de forma simple y clara qué necesitas, cuánto cuesta cada parte y cuál es el presupuesto mínimo para tener un sitio web profesional en 2026. Sin tecnicismos.
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
                  href="https://fabiankaraben.github.io/es"
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
                      <span className="text-[10px] text-slate-400 font-mono">Presupuesto Web 2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Palette className="h-4 w-4 text-violet-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Diseño</p>
                        <p className="text-lg font-bold text-white">UI/UX</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Code className="h-4 w-4 text-emerald-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Desarrollo</p>
                        <p className="text-lg font-bold text-emerald-400">Full Stack</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Globe className="h-4 w-4 text-amber-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Dominio</p>
                        <p className="text-lg font-bold text-white">tuempresa.com</p>
                      </div>
                      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                        <Server className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-400">Hosting</p>
                        <p className="text-lg font-bold text-cyan-400">Cloud</p>
                      </div>
                    </div>

                    <div className="bg-violet-600/20 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Landing page desde $150 USD</p>
                        <p className="text-[10px] text-violet-300">≈ $225.000 ARS</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white py-3.5 px-4.5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-50">
                    <Award className="h-5 w-5 text-violet-600 fill-violet-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-violet-800 tracking-wider uppercase">Desarrollador Full Stack</p>
                    <p className="text-sm font-extrabold text-slate-900">+20 años de experiencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is a website? Explained simply */}
        <section className="py-20 bg-white border-y border-slate-200/60 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Qué es una Página Web y Qué Necesitas?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Antes de hablar de precios, es importante entender qué partes componen una página web. Cada una tiene un costo asociado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-violet-50 w-fit mb-4">
                  <Palette className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Diseño (UI/UX)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es el aspecto visual de tu sitio: los colores, tipografías, disposición de elementos e imágenes. Un buen diseño hace que tu negocio luzca profesional y que los visitantes confíen en ti. El diseño se adapta a celulares, tablets y computadoras (diseño responsivo).
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-emerald-50 w-fit mb-4">
                  <Code className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Desarrollo (Programación)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es la construcción técnica del sitio. El desarrollador escribe el código que convierte el diseño en una página funcional: botones que funcionan, formularios que envían emails, animaciones, integración con redes sociales y cualquier funcionalidad que necesites.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-amber-50 w-fit mb-4">
                  <Globe className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Dominio</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es la dirección de tu sitio web, por ejemplo <strong>tuempresa.com</strong>. Se compra anualmente y cuesta entre $10 y $15 USD/año dependiendo de la extensión (.com, .net, .ar). Es como el nombre de tu local en internet.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-cyan-50 w-fit mb-4">
                  <Server className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Hosting (Alojamiento)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es el servicio que mantiene tu sitio web visible las 24 horas del día. Es como alquilar un espacio en internet donde viven los archivos de tu página. Los planes van desde $3 hasta $10 USD/mes en buenos proveedores.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-rose-50 w-fit mb-4">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Certificado SSL</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Es lo que hace que tu sitio muestre el candado 🔒 en el navegador y use <strong>https://</strong>. Protege los datos de tus visitantes. La mayoría de los hostings lo incluyen gratis, y Google lo considera obligatorio para el posicionamiento.
                </p>
              </div>

              <div className="bg-[#F5F7FB] p-7 rounded-2xl border border-slate-200/50">
                <div className="p-3 rounded-xl bg-indigo-50 w-fit mb-4">
                  <Wrench className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">Mantenimiento</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tu sitio necesita actualizaciones de seguridad, backups y correcciones periódicas. Es como el mantenimiento de un auto: si no lo haces, eventualmente deja de funcionar bien. Puede ser mensual o bajo demanda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Breakdown Table */}
        <section id="desglose-costos" className="py-20 px-6 bg-[#F5F7FB] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Desglose de Costos Reales en 2026
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Estos son los rangos de precios reales que puedes esperar en el mercado hispano. Los precios de desarrollo varían según la complejidad del proyecto.
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
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-amber-500 shrink-0" />
                        Dominio (.com)
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$10 – $15 USD/año</td>
                    <td className="py-5 px-6 text-slate-600">Anual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Algunos hostings lo incluyen gratis el primer año</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-cyan-500 shrink-0" />
                        Hosting
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$3 – $10 USD/mes</td>
                    <td className="py-5 px-6 text-slate-600">Mensual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Hosting compartido es suficiente para la mayoría</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                        Certificado SSL
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-emerald-700 font-semibold">Gratis</span>
                    </td>
                    <td className="py-5 px-6 text-slate-600">—</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Incluido en la mayoría de los hostings</td>
                  </tr>
                  <tr className="bg-violet-50/30">
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-violet-500 shrink-0" />
                        Landing Page
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-violet-700 font-semibold">Desde $150 USD</div>
                      <div className="text-xs text-slate-500">≈ $225.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Página de una sola sección (1–3 pantallas)</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                        Sitio Corporativo (3–7 páginas)
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-700">$500 – $1.500 USD</div>
                      <div className="text-xs text-slate-500">≈ $750.000 – $2.250.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Inicio, Servicios, Nosotros, Contacto, Blog</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                        Tienda Online (E-commerce)
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-700">$1.000 – $5.000 USD</div>
                      <div className="text-xs text-slate-500">≈ $1.500.000 – $7.500.000 ARS</div>
                    </td>
                    <td className="py-5 px-6 text-slate-600">Único</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Catálogo, carrito, pagos y gestión de pedidos</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-rose-500 shrink-0" />
                        Mantenimiento
                      </div>
                    </td>
                    <td className="py-5 px-6 text-slate-700">$20 – $100 USD/mes</td>
                    <td className="py-5 px-6 text-slate-600">Mensual</td>
                    <td className="py-5 px-6 text-slate-500 hidden md:table-cell">Actualizaciones, backups, soporte técnico</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl border border-violet-100/60 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-violet-50 shrink-0">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Presupuesto mínimo para empezar</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Con <strong className="text-slate-900">$150 USD (≈ $225.000 ARS)</strong> puedes obtener una landing page profesional y funcional. Sumando un dominio ($12 USD/año) y hosting ($3 USD/mes), tu inversión total del primer año sería de aproximadamente <strong className="text-slate-900">$200 USD (≈ $300.000 ARS)</strong>. Es una inversión accesible que puede transformar la presencia digital de tu negocio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Highlight */}
        <section className="py-20 bg-white border-y border-slate-200/60 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Desarrollador Full Stack Recomendado
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Contratar a un desarrollador experimentado es la diferencia entre un sitio web que funciona y uno que genera resultados. Te presentamos un profesional de confianza.
              </p>
            </div>

            <div className="bg-[#F5F7FB] p-8 md:p-10 rounded-2xl border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-violet-200/20 to-transparent rounded-bl-full" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-start gap-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold tracking-wider uppercase mb-2">
                        Profesional Recomendado
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950">Fabián Karaben</h3>
                      <p className="text-violet-600 text-sm font-semibold">Desarrollador Full Stack — +20 años de experiencia</p>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Desarrollador full-stack con sólida experiencia en arquitecturas backend (Java, Spring Boot, Go, Node.js) combinada con frontend moderno (React, Next.js, TypeScript). Certificado por AWS. Especializado en entregar sitios web de alto rendimiento, rápidos, seguros y optimizados para buscadores.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">¿Por qué elegirlo?</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Precios accesibles:</strong> Landing pages desde $150 USD (≈ $225.000 ARS). Ideal para emprendedores y PyMEs hispanas.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>+20 años de experiencia:</strong> Desde sitios simples hasta aplicaciones web complejas. Más de dos décadas resolviendo problemas reales.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Tecnología moderna:</strong> Usa Next.js, TypeScript y Tailwind CSS. Tu sitio será rápido, responsivo y optimizado para Google.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Certificación AWS:</strong> Infraestructura cloud profesional. Tu sitio estará alojado en la mejor tecnología disponible.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Comunicación directa:</strong> Trato directo con el desarrollador, sin intermediarios. Español nativo y atención personalizada.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <a
                      href="https://fabiankaraben.github.io/es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      Ver Portfolio Completo
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-600" />
                      Precios de Referencia
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Landing Page</span>
                        <span className="text-sm font-bold text-slate-900">Desde $150 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Sitio Corporativo</span>
                        <span className="text-sm font-bold text-slate-900">Desde $500 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Aplicación Web</span>
                        <span className="text-sm font-bold text-slate-900">Desde $1.000 USD</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-slate-600">Mantenimiento</span>
                        <span className="text-sm font-bold text-slate-900">Desde $20 USD/mes</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Precios orientativos. El costo final depende de las funcionalidades y complejidad del proyecto.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-violet-600" />
                      Tecnologías
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Go", "Java", "Spring Boot", "AWS", "PostgreSQL"].map(
                        (tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200/50"
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

        {/* Buyer's Guide - What to look for */}
        <section className="py-20 px-6 bg-[#F5F7FB]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Qué Debe Incluir tu Página Web?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Antes de contratar, asegúrate de que tu sitio web incluya estos elementos esenciales. Un sitio sin estas características no cumplirá su objetivo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-violet-50 h-fit shrink-0">
                  <Smartphone className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Diseño Responsivo</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tu sitio debe verse perfecto en celulares, tablets y computadoras. Más del 60% de las visitas web en Latinoamérica vienen de dispositivos móviles. Si tu web no se adapta, estás perdiendo clientes.
                  </p>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 h-fit shrink-0">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Velocidad de Carga</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Una página que tarda más de 3 segundos en cargar pierde el 53% de sus visitantes. Exige código optimizado, imágenes comprimidas y un hosting de calidad. Google premia los sitios rápidos en los resultados de búsqueda.
                  </p>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-amber-50 h-fit shrink-0">
                  <Search className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">SEO Básico</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tu sitio debe estar optimizado para aparecer en Google: títulos descriptivos, meta descripciones, encabezados jerárquicos, URLs amigables y textos alternativos en imágenes. Sin SEO, nadie te encontrará.
                  </p>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-cyan-50 h-fit shrink-0">
                  <Shield className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Seguridad (HTTPS)</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Certificado SSL activo para que tu sitio use https:// y muestre el candado de seguridad. Sin esto, los navegadores marcarán tu sitio como &quot;no seguro&quot; y Google lo penalizará en el ranking.
                  </p>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-rose-50 h-fit shrink-0">
                  <Users className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Formulario de Contacto</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Un formulario funcional que envíe los mensajes directamente a tu email. Opcionalmente, integración con WhatsApp Business. Tus potenciales clientes deben poder contactarte fácilmente.
                  </p>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm flex gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 h-fit shrink-0">
                  <RefreshCw className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Mantenimiento y Soporte</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Después del lanzamiento, tu sitio necesita actualizaciones de seguridad, backups periódicos y correcciones. Pregunta por planes de mantenimiento para mantener tu inversión protegida a largo plazo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="py-20 px-6 bg-white border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                5 Errores que Encarecen tu Página Web
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Evita estos errores comunes que terminan costándote más dinero del necesario.
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {[
                {
                  title: "Usar plataformas \"gratis\" sin entender las limitaciones",
                  description:
                    "WordPress.com, Wix o Squarespace en planes gratuitos parecen atractivos, pero te obligan a usar subdominios (tunegocio.wordpress.com), muestran publicidad de la plataforma y limitan drásticamente la personalización. Migrar después a algo profesional puede costar más que haber empezado bien desde el inicio.",
                },
                {
                  title: "No definir los requisitos antes de empezar",
                  description:
                    "Si no tienes claro qué páginas necesitas, qué información va en cada una y cuál es el objetivo de tu sitio, el proyecto tendrá retrasos y cambios que encarecen el presupuesto. Dedica tiempo a planificar antes de contratar.",
                },
                {
                  title: "Elegir al desarrollador solo por precio",
                  description:
                    "Un precio demasiado bajo suele esconder calidad pobre: código mal optimizado, sin SEO, diseño genérico y cero soporte post-lanzamiento. Un buen desarrollador es una inversión, no un gasto. Busca portfolio y referencias.",
                },
                {
                  title: "Ignorar el hosting y el dominio",
                  description:
                    "Algunos clientes se sorprenden con los costos recurrentes. El dominio y el hosting son gastos anuales/mensuales inevitables. No son caros ($50–$150 USD/año), pero debes incluirlos en tu presupuesto desde el principio.",
                },
                {
                  title: "No planificar el mantenimiento",
                  description:
                    "Lanzar un sitio y olvidarse de él es la receta para problemas de seguridad, caídas y pérdida de datos. Incluye un plan de mantenimiento básico desde el día uno. Es mucho más barato mantener que reconstruir.",
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
        <section className="py-20 px-6 bg-[#F5F7FB]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                ¿Cómo es el Proceso de Crear una Página Web?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Así funciona el proceso paso a paso, desde la primera conversación hasta tener tu sitio publicado en internet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Conversación Inicial",
                  description:
                    "Nos cuentas qué necesitas: tu negocio, tu público, tus objetivos. Con esta información preparamos una propuesta con alcance, precio y tiempos concretos. Sin compromiso.",
                  icon: Users,
                  color: "violet",
                },
                {
                  step: "02",
                  title: "Diseño y Maqueta",
                  description:
                    "Creamos el diseño visual de tu sitio. Te mostramos cómo se verá en celular y computadora antes de programar una sola línea de código. Tú apruebas o pedimos cambios.",
                  icon: Palette,
                  color: "emerald",
                },
                {
                  step: "03",
                  title: "Desarrollo",
                  description:
                    "Programamos tu sitio con código de calidad, optimizado para velocidad y SEO. Integramos formularios, redes sociales, Google Analytics y todo lo que necesites.",
                  icon: Code,
                  color: "amber",
                },
                {
                  step: "04",
                  title: "Lanzamiento",
                  description:
                    "Configuramos tu dominio y hosting, publicamos el sitio y verificamos que todo funcione correctamente. Tu página está lista para recibir visitantes.",
                  icon: Zap,
                  color: "cyan",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white p-7 rounded-2xl border border-slate-200/50 shadow-sm relative"
                >
                  <span className="text-5xl font-extrabold text-slate-100 absolute top-4 right-5 select-none">
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
                            : "bg-cyan-50"
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 ${
                        item.color === "violet"
                          ? "text-violet-600"
                          : item.color === "emerald"
                            ? "text-emerald-600"
                            : item.color === "amber"
                              ? "text-amber-600"
                              : "text-cyan-600"
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-white border-y border-slate-200/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight">
                Preguntas Frecuentes
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Las dudas más comunes sobre los costos de desarrollo web, respondidas de forma clara.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-[#F5F7FB] rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Cuánto cuesta hacer una página web en 2026?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Depende del tipo de sitio. Una <strong>landing page</strong> profesional puede costar desde <strong>$150 USD (≈ $225.000 ARS)</strong>, un sitio corporativo entre $500 y $1.500 USD, y una tienda online entre $1.000 y $5.000 USD. A esto se le suma el dominio ($10-15 USD/año) y el hosting ($3-10 USD/mes).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7FB] rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Qué incluye el precio de una página web?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      El precio incluye el <strong>diseño visual</strong> (cómo se ve tu sitio), el <strong>desarrollo</strong> (la programación), la <strong>optimización SEO básica</strong> (para que Google te encuentre), la <strong>configuración del dominio y hosting</strong>, y la <strong>integración de contenidos</strong> (textos, imágenes, formularios). Algunos desarrolladores incluyen un período de soporte post-lanzamiento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7FB] rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Puedo crear una página web gratis?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Existen opciones gratuitas (WordPress.com, Wix, Google Sites), pero tienen <strong>limitaciones importantes</strong>: subdominios poco profesionales, publicidad de la plataforma, diseño limitado y pobre rendimiento SEO. Para un negocio real, se recomienda invertir al menos en un dominio propio y un desarrollador profesional. La diferencia en resultados es enorme.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F7FB] rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      ¿Cuánto tarda en crearse una página web?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Una landing page puede estar lista en <strong>3 a 7 días hábiles</strong>. Un sitio corporativo completo tarda entre <strong>2 y 4 semanas</strong>. Una tienda online puede llevar de <strong>4 a 8 semanas</strong>. Los tiempos varían según la complejidad del proyecto y la velocidad con la que el cliente proporciona los contenidos (textos e imágenes).
                    </p>
                  </div>
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
              ¿Listo para crear tu página web?
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Contacta a <strong className="font-bold text-slate-900">Fabián Karaben</strong>, desarrollador Full Stack con más de 20 años de experiencia. Landing pages desde $150 USD. Comunicación directa, sin intermediarios.
            </p>
            <div className="pt-4">
              <a
                href="https://fabiankaraben.github.io/es"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-base font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/10 transition-all duration-300 inline-flex items-center gap-2 group"
                id="footer-cta-developer"
              >
                Ver Portfolio del Desarrollador
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              +20 años de experiencia • Certificación AWS • Español nativo
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-violet-600" />
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                Costo<span className="text-violet-600 font-medium">Web</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs text-center md:text-left">
              © {new Date().getFullYear()} CostoWeb. Todos los derechos reservados.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-[11px] leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-slate-500">Aviso:</strong> Los precios mencionados en esta página son orientativos y pueden variar según la complejidad del proyecto, los requisitos específicos y las condiciones del mercado. Esta página contiene enlaces al portfolio de un desarrollador recomendado. Nuestro análisis es completamente honesto, objetivo y basado en nuestra experiencia real en el sector del desarrollo web.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
