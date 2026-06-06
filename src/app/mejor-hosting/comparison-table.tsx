"use client";

import React, { useState } from "react";
import { Check, X, Star } from "lucide-react";

type CompetitorKey = "bluehost" | "siteground" | "godaddy";

interface CompetitorData {
  name: string;
  focus: string;
  price: string;
  speed: React.ReactNode;
  panel: string;
  ssl: React.ReactNode;
  support: string;
  easeOfUse: string;
  score: React.ReactNode;
}

export function ComparisonTable() {
  const [compareWith, setCompareWith] = useState<CompetitorKey>("bluehost");

  const competitors: Record<CompetitorKey, CompetitorData> = {
    bluehost: {
      name: "Bluehost",
      focus: "WordPress oficial recomendado, orientado a blogs.",
      price: "Desde ~$2.95/mes (renovación más cara)",
      speed: (
        <div className="flex items-center gap-1.5 text-amber-700">
          <span>Regular (servidores compartidos saturados)</span>
        </div>
      ),
      panel: "cPanel clásico, funcional pero anticuado.",
      ssl: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>SSL gratuito incluido</span>
        </div>
      ),
      support: "Chat 24/7, tiempos de espera variables.",
      easeOfUse: "Buena para WordPress (upsells frecuentes)",
      score: (
        <div className="flex items-center gap-0.5 text-violet-600">
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 text-slate-200" />
          <span className="ml-1 text-slate-700 font-extrabold text-[10px]">(7.5)</span>
        </div>
      ),
    },
    siteground: {
      name: "SiteGround",
      focus: "Rendimiento premium y soporte técnico avanzado.",
      price: "Desde ~$3.99/mes (límites estrictos de tráfico)",
      speed: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Excelente (Google Cloud)</span>
        </div>
      ),
      panel: "Site Tools propio, moderno pero con curva de aprendizaje.",
      ssl: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>SSL gratuito incluido</span>
        </div>
      ),
      support: "Excelente, respuesta rápida y técnica.",
      easeOfUse: "Buena (Precio sube mucho al renovar)",
      score: (
        <div className="flex items-center gap-0.5 text-violet-600">
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 text-slate-200" />
          <span className="ml-1 text-slate-700 font-extrabold text-[10px]">(8.2)</span>
        </div>
      ),
    },
    godaddy: {
      name: "GoDaddy",
      focus: "Dominios y hosting todo-en-uno para principiantes.",
      price: "Desde ~$5.99/mes (muchas funciones de pago extra)",
      speed: (
        <div className="flex items-center gap-1.5 text-red-700 font-medium">
          <X className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>Lenta en planes básicos</span>
        </div>
      ),
      panel: "Panel propietario confuso, muchos upsells.",
      ssl: (
        <div className="flex items-center gap-1.5 text-red-700 font-medium">
          <X className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>SSL de pago en planes básicos</span>
        </div>
      ),
      support: "Disponible 24/7, calidad inconsistente.",
      easeOfUse: "Regular (Interfaz saturada de ventas)",
      score: (
        <div className="flex items-center gap-0.5 text-violet-600">
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 fill-violet-500" />
          <Star className="h-3.5 w-3.5 text-slate-200" />
          <Star className="h-3.5 w-3.5 text-slate-200" />
          <span className="ml-1 text-slate-700 font-extrabold text-[10px]">(6.0)</span>
        </div>
      ),
    },
  };

  const selectedCompetitor = competitors[compareWith];

  return (
    <div className="w-full">
      {/* Mobile-Only Pill Selector */}
      <div className="md:hidden flex flex-col gap-2.5 mb-6 bg-[#F5F7FB] p-3.5 rounded-2xl border border-slate-200/50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Comparar Hostinger con:
        </span>
        <div className="flex gap-1.5 justify-center">
          <button
            onClick={() => setCompareWith("bluehost")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "bluehost"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-bluehost"
          >
            Bluehost
          </button>
          <button
            onClick={() => setCompareWith("siteground")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "siteground"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-siteground"
          >
            SiteGround
          </button>
          <button
            onClick={() => setCompareWith("godaddy")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "godaddy"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-godaddy"
          >
            GoDaddy
          </button>
        </div>
      </div>

      {/* Mobile-Only 3-Column Table */}
      <div className="md:hidden rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] bg-white overflow-hidden">
        <table className="w-full table-fixed border-collapse text-left bg-white">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-4 px-3.5 font-semibold text-slate-600 text-xs w-[30%]">Característica</th>
              <th className="py-4 px-3 text-xs relative w-[35%] bg-violet-50/40 border-x border-violet-100/50">
                <div className="absolute top-0 inset-x-0 h-1 bg-violet-600" />
                <span className="font-extrabold text-slate-950 block">Hostinger</span>
                <span className="inline-block rounded bg-violet-100 px-1 py-0.5 text-[8px] font-bold text-violet-800 mt-0.5">
                  Recomendado
                </span>
              </th>
              <th className="py-4 px-3 font-bold text-slate-800 text-xs w-[35%]">
                {selectedCompetitor.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] leading-relaxed">
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Enfoque</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Hosting rápido, asequible y fácil de usar.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.focus}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Precio</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Desde $2.99/mes con dominio gratis
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.price}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Velocidad</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>LiteSpeed + CDN global</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.speed}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Panel</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                hPanel moderno e intuitivo.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.panel}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">SSL</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>SSL gratis de por vida</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.ssl}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Soporte</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Chat 24/7 en español, respuesta rápida.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.support}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Facilidad</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Excelente (Instalador 1-clic)
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.easeOfUse}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Nota</td>
              <td className="py-4 px-3 font-semibold text-violet-700 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-0.5 text-violet-600">
                  <Star className="h-3.5 w-3.5 fill-violet-500" />
                  <Star className="h-3.5 w-3.5 fill-violet-500" />
                  <Star className="h-3.5 w-3.5 fill-violet-500" />
                  <Star className="h-3.5 w-3.5 fill-violet-500" />
                  <Star className="h-3.5 w-3.5 fill-violet-500" />
                  <span className="ml-1 text-slate-900 font-extrabold text-[10px]">(9.6)</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.score}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Desktop-Only 5-Column Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] custom-scrollbar">
        <table className="w-full min-w-[800px] border-collapse text-left bg-white">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-5 px-6 font-semibold text-slate-600 text-sm w-1/5">Característica</th>

              <th className="py-5 px-6 text-sm relative w-1/5 bg-violet-50/50 border-x border-violet-100/60">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-violet-600" />
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-950 text-base">Hostinger</span>
                  <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                    Recomendado
                  </span>
                </div>
                <span className="block text-slate-400 text-[11px] font-normal mt-0.5">hostinger.com</span>
              </th>

              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">Bluehost</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">SiteGround</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">GoDaddy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Enfoque Principal</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Hosting web rápido, asequible y con herramientas IA integradas.
              </td>
              <td className="py-5 px-6 text-slate-600">WordPress oficial, blogs y sitios pequeños.</td>
              <td className="py-5 px-6 text-slate-600">Rendimiento premium y soporte técnico avanzado.</td>
              <td className="py-5 px-6 text-slate-600">Dominios y hosting todo-en-uno para principiantes.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Precio Inicial</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  Desde $2.99/mes
                </div>
                Dominio gratis el primer año
              </td>
              <td className="py-5 px-6 text-slate-600">Desde ~$2.95/mes (renovación más cara)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$3.99/mes (límites de tráfico)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$5.99/mes (extras de pago)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Velocidad</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  LiteSpeed + CDN global incluido
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">Regular (servidores compartidos saturados)</td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Excelente (infraestructura Google Cloud)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-red-700 font-medium">
                  <X className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  Lenta en planes básicos
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Panel de Control</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                hPanel moderno, limpio y fácil de navegar.
              </td>
              <td className="py-5 px-6 text-slate-600">cPanel clásico, funcional pero anticuado.</td>
              <td className="py-5 px-6 text-slate-600">Site Tools propio, moderno con curva de aprendizaje.</td>
              <td className="py-5 px-6 text-slate-600">Panel propietario confuso, muchos upsells.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">SSL / Seguridad</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  SSL gratuito de por vida + backups semanales
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  SSL gratuito incluido
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  SSL gratuito incluido
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-red-700 font-medium">
                  <X className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  SSL de pago en planes básicos
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Soporte Técnico</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Chat en vivo 24/7 en español, respuesta en minutos.
              </td>
              <td className="py-5 px-6 text-slate-600">Chat 24/7, tiempos de espera variables.</td>
              <td className="py-5 px-6 text-slate-600">Excelente soporte técnico, muy especializado.</td>
              <td className="py-5 px-6 text-slate-600">Disponible 24/7, calidad inconsistente.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Facilidad de Uso</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Excelente (Instalador 1-clic WordPress + IA)
              </td>
              <td className="py-5 px-6 text-slate-600">Buena para WordPress (upsells frecuentes)</td>
              <td className="py-5 px-6 text-slate-600">Buena (Precio sube mucho al renovar)</td>
              <td className="py-5 px-6 text-slate-600">Regular (Interfaz saturada de ventas)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Valoración General</td>
              <td className="py-5 px-6 font-semibold text-violet-700 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1 text-violet-600">
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <span className="ml-1 text-slate-900 font-extrabold">(9.6 / 10)</span>
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1 text-violet-600">
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 text-slate-300" />
                  <span className="ml-1 text-slate-700 font-bold">(7.5 / 10)</span>
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1 text-violet-600">
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 text-slate-300" />
                  <span className="ml-1 text-slate-700 font-bold">(8.2 / 10)</span>
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1 text-violet-600">
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 fill-violet-500" />
                  <Star className="h-4.5 w-4.5 text-slate-300" />
                  <Star className="h-4.5 w-4.5 text-slate-300" />
                  <span className="ml-1 text-slate-700 font-bold">(6.0 / 10)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
