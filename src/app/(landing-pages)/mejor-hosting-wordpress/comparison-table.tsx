"use client";

import React, { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";

type CompetitorKey = "bluehost" | "siteground" | "wpengine";

interface CompetitorData {
  name: string;
  focus: string;
  price: string;
  speed: React.ReactNode;
  wpInstall: React.ReactNode;
  panel: string;
  ssl: React.ReactNode;
  support: string;
  sites: string;
  url: string;
}

export function WpComparisonTable() {
  const [compareWith, setCompareWith] = useState<CompetitorKey>("bluehost");

  const competitors: Record<CompetitorKey, CompetitorData> = {
    bluehost: {
      name: "Bluehost",
      focus: "Hosting WordPress oficial recomendado por WordPress.org.",
      price: "Desde ~$2.95/mes (renovación ~$11.99/mes)",
      speed: (
        <div className="flex items-center gap-1.5 text-amber-700">
          <span>Regular (servidores Apache compartidos)</span>
        </div>
      ),
      wpInstall: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>WordPress preinstalado</span>
        </div>
      ),
      panel: "cPanel clásico, funcional pero anticuado.",
      ssl: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>SSL gratuito incluido</span>
        </div>
      ),
      support: "Chat 24/7 en inglés, tiempos variables.",
      sites: "1 sitio (plan Basic)",
      url: "https://www.bluehost.com",
    },
    siteground: {
      name: "SiteGround",
      focus: "WordPress premium con soporte técnico avanzado.",
      price: "Desde ~$3.99/mes (renovación ~$17.99/mes)",
      speed: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Excelente (Google Cloud + Nginx)</span>
        </div>
      ),
      wpInstall: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Instalador + staging</span>
        </div>
      ),
      panel: "Site Tools propio, moderno con curva de aprendizaje.",
      ssl: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>SSL gratuito incluido</span>
        </div>
      ),
      support: "Excelente, técnico y especializado en WP.",
      sites: "1 sitio (plan StartUp)",
      url: "https://www.siteground.com",
    },
    wpengine: {
      name: "WP Engine",
      focus: "Hosting WordPress gestionado premium para empresas.",
      price: "Desde ~$20/mes (sin plan barato)",
      speed: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Excelente (CDN + caché avanzado)</span>
        </div>
      ),
      wpInstall: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>WordPress gestionado al 100%</span>
        </div>
      ),
      panel: "Panel propio especializado, solo para WordPress.",
      ssl: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>SSL gratuito incluido</span>
        </div>
      ),
      support: "Soporte premium 24/7, especialistas WP.",
      sites: "1 sitio (plan Startup, 25K visitas/mes)",
      url: "https://wpengine.com",
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
            onClick={() => setCompareWith("wpengine")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "wpengine"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-wpengine"
          >
            WP Engine
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
                WordPress rápido con LiteSpeed + IA.
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
                  <span>LiteSpeed + LSCache</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.speed}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">WordPress</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>1-clic + IA + staging</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.wpInstall}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Sitios</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                100 sitios web (plan Business)
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.sites}</td>
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
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Visitar</td>
              <td className="py-4 px-3 bg-violet-50/10 border-x border-violet-100/20">
                <a
                  href="https://www.hostg.xyz/SHJlD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Visitar Hostinger
                  <ArrowRight className="h-3 w-3" />
                </a>
              </td>
              <td className="py-4 px-3 text-slate-600">
                <a
                  href={selectedCompetitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Visitar {selectedCompetitor.name}
                  <ArrowRight className="h-3 w-3" />
                </a>
              </td>
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
                <span className="block text-slate-400 text-[11px] font-normal mt-0.5">WordPress Hosting</span>
              </th>

              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">Bluehost</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">SiteGround</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">WP Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Enfoque Principal</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                WordPress rápido con LiteSpeed, herramientas IA y panel hPanel intuitivo.
              </td>
              <td className="py-5 px-6 text-slate-600">Hosting WordPress oficial, orientado a principiantes.</td>
              <td className="py-5 px-6 text-slate-600">WordPress premium con soporte técnico avanzado.</td>
              <td className="py-5 px-6 text-slate-600">WordPress gestionado premium para empresas y agencias.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Precio Inicial</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  Desde $2.99/mes (plan Business)
                </div>
                Dominio gratis el primer año
              </td>
              <td className="py-5 px-6 text-slate-600">Desde ~$2.95/mes (renovación ~$11.99/mes)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$3.99/mes (renovación ~$17.99/mes)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$20/mes (sin plan económico)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Velocidad WordPress</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  LiteSpeed + LiteSpeed Cache (nivel servidor)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">Regular (Apache en servidores compartidos saturados)</td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Excelente (Google Cloud + SuperCacher)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Excelente (CDN + EverCache propio)
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Instalación WP</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  1-clic + AI Website Builder + staging
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  WordPress preinstalado
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Instalador + staging
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  100% gestionado + staging + blueprints
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Sitios Incluidos</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  100 sitios web (plan Business)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">1 sitio (plan Basic)</td>
              <td className="py-5 px-6 text-slate-600">1 sitio (plan StartUp)</td>
              <td className="py-5 px-6 text-slate-600">1 sitio (plan Startup, límite 25K visitas/mes)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">SSL / Seguridad</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  SSL gratis + backups + protección malware
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
                  SSL + backups diarios + WAF
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  SSL + backups + WAF + detección amenazas
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Soporte Técnico</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Chat en vivo 24/7 en español, respuesta en minutos.
              </td>
              <td className="py-5 px-6 text-slate-600">Chat 24/7 en inglés, tiempos de espera variables.</td>
              <td className="py-5 px-6 text-slate-600">Excelente soporte técnico, especialistas en WP.</td>
              <td className="py-5 px-6 text-slate-600">Soporte premium 24/7, expertos certificados en WP.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Visitar Web</td>
              <td className="py-5 px-6 bg-violet-50/20 border-x border-violet-100/30">
                <a
                  href="https://www.hostg.xyz/SHJlD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Visitar Hostinger
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.bluehost.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar Bluehost <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.siteground.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar SiteGround <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://wpengine.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar WP Engine <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
