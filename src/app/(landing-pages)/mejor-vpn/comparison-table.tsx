"use client";

import React, { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";

type CompetitorKey = "expressvpn" | "surfshark" | "cyberghost";

interface CompetitorData {
  name: string;
  focus: string;
  price: string;
  servers: string;
  speed: React.ReactNode;
  devices: string;
  noLogs: React.ReactNode;
  streaming: React.ReactNode;
  support: string;
  url: string;
}

export function VpnComparisonTable() {
  const [compareWith, setCompareWith] = useState<CompetitorKey>("expressvpn");

  const competitors: Record<CompetitorKey, CompetitorData> = {
    expressvpn: {
      name: "ExpressVPN",
      focus: "VPN premium con enfoque en facilidad de uso.",
      price: "Desde ~$6.67/mes (plan 1 año)",
      servers: "3,000+ en 105 países",
      speed: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Rápida (protocolo Lightway)</span>
        </div>
      ),
      devices: "8 conexiones simultáneas",
      noLogs: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Auditada por KPMG (Islas Vírgenes Británicas)</span>
        </div>
      ),
      streaming: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Excelente (Netflix, Disney+, HBO)</span>
        </div>
      ),
      support: "Chat 24/7 en inglés, muy rápido.",
      url: "https://www.expressvpn.com",
    },
    surfshark: {
      name: "Surfshark",
      focus: "VPN económica con dispositivos ilimitados.",
      price: "Desde ~$2.19/mes (plan 2 años)",
      servers: "3,200+ en 100 países",
      speed: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Buena (WireGuard)</span>
        </div>
      ),
      devices: "Ilimitados",
      noLogs: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Auditada por Deloitte (Países Bajos)</span>
        </div>
      ),
      streaming: (
        <div className="flex items-center gap-1.5 text-amber-700">
          <span>Buena (algunos bloqueos ocasionales)</span>
        </div>
      ),
      support: "Chat 24/7, soporte parcial en español.",
      url: "https://www.surfshark.com",
    },
    cyberghost: {
      name: "CyberGhost",
      focus: "Servidores optimizados para streaming y torrents.",
      price: "Desde ~$2.19/mes (plan 2 años)",
      servers: "11,000+ en 100 países",
      speed: (
        <div className="flex items-center gap-1.5 text-amber-700">
          <span>Buena (variable según servidor)</span>
        </div>
      ),
      devices: "7 conexiones simultáneas",
      noLogs: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Auditada por Deloitte (Rumania)</span>
        </div>
      ),
      streaming: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Buena (servidores dedicados por plataforma)</span>
        </div>
      ),
      support: "Chat 24/7 en inglés, 45 días de garantía.",
      url: "https://www.cyberghostvpn.com",
    },
  };

  const selectedCompetitor = competitors[compareWith];

  return (
    <div className="w-full">
      {/* Mobile-Only Pill Selector */}
      <div className="md:hidden flex flex-col gap-2.5 mb-6 bg-[#F5F7FB] p-3.5 rounded-2xl border border-slate-200/50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Comparar NordVPN con:
        </span>
        <div className="flex gap-1.5 justify-center">
          <button
            onClick={() => setCompareWith("expressvpn")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "expressvpn"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-expressvpn"
          >
            ExpressVPN
          </button>
          <button
            onClick={() => setCompareWith("surfshark")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "surfshark"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-surfshark"
          >
            Surfshark
          </button>
          <button
            onClick={() => setCompareWith("cyberghost")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "cyberghost"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-cyberghost"
          >
            CyberGhost
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
                <span className="font-extrabold text-slate-950 block">NordVPN</span>
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
                VPN completa: velocidad, seguridad y streaming.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.focus}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Precio</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Desde $3.39/mes (plan 2 años)
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.price}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Servidores</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>6,400+ en 111 países</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.servers}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Velocidad</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>NordLynx (WireGuard)</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.speed}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Dispositivos</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                10 conexiones simultáneas
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.devices}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">No-Logs</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Auditada (Panamá)</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.noLogs}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Soporte</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Chat 24/7, soporte en español.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.support}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Visitar</td>
              <td className="py-4 px-3 bg-violet-50/10 border-x border-violet-100/20">
                <a
                  href="https://nordvpn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Visitar NordVPN
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
                  <span className="font-extrabold text-slate-950 text-base">NordVPN</span>
                  <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                    Recomendado
                  </span>
                </div>
                <span className="block text-slate-400 text-[11px] font-normal mt-0.5">nordvpn.com</span>
              </th>

              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">ExpressVPN</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">Surfshark</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">CyberGhost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Enfoque Principal</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                VPN completa: velocidad, privacidad, streaming y seguridad avanzada.
              </td>
              <td className="py-5 px-6 text-slate-600">VPN premium con enfoque en facilidad de uso.</td>
              <td className="py-5 px-6 text-slate-600">VPN económica con dispositivos ilimitados.</td>
              <td className="py-5 px-6 text-slate-600">Servidores optimizados para streaming y torrents.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Precio</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  Desde $3.39/mes (plan 2 años)
                </div>
                Incluye Threat Protection básico
              </td>
              <td className="py-5 px-6 text-slate-600">Desde ~$6.67/mes (plan 1 año, el más caro)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$2.19/mes (plan 2 años)</td>
              <td className="py-5 px-6 text-slate-600">Desde ~$2.19/mes (plan 2 años)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Servidores</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  6,400+ servidores en 111 países
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">3,000+ servidores en 105 países</td>
              <td className="py-5 px-6 text-slate-600">3,200+ servidores en 100 países</td>
              <td className="py-5 px-6 text-slate-600">11,000+ servidores en 100 países</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Velocidad</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  NordLynx (basado en WireGuard), la más rápida
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Rápida (protocolo Lightway propio)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Buena (WireGuard estándar)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">Buena (variable según distancia del servidor)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Dispositivos</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                10 conexiones simultáneas
              </td>
              <td className="py-5 px-6 text-slate-600">8 conexiones simultáneas</td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Ilimitados
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">7 conexiones simultáneas</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Política No-Logs</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Auditada por PwC y Deloitte (Panamá)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Auditada por KPMG (Islas Vírgenes Británicas)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Auditada por Deloitte (Países Bajos)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Auditada por Deloitte (Rumania)
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Soporte Técnico</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Chat en vivo 24/7 con soporte en español.
              </td>
              <td className="py-5 px-6 text-slate-600">Chat 24/7 en inglés, muy rápido.</td>
              <td className="py-5 px-6 text-slate-600">Chat 24/7, soporte parcial en español.</td>
              <td className="py-5 px-6 text-slate-600">Chat 24/7 en inglés, 45 días de garantía.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Visitar Web</td>
              <td className="py-5 px-6 bg-violet-50/20 border-x border-violet-100/30">
                <a
                  href="https://nordvpn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Visitar NordVPN
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.expressvpn.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar ExpressVPN <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.surfshark.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar Surfshark <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.cyberghostvpn.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar CyberGhost <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
