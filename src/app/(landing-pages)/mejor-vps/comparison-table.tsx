"use client";

import React, { useState } from "react";
import { Check, X, Star, ArrowRight } from "lucide-react";

type CompetitorKey = "digitalocean" | "linode" | "vultr";

interface CompetitorData {
  name: string;
  focus: string;
  price: string;
  ram: string;
  cpu: string;
  storage: string;
  bandwidth: string;
  rootAccess: React.ReactNode;
  support: string;
  panel: string;
  url: string;
}

export function VpsComparisonTable() {
  const [compareWith, setCompareWith] = useState<CompetitorKey>("digitalocean");

  const competitors: Record<CompetitorKey, CompetitorData> = {
    digitalocean: {
      name: "DigitalOcean",
      focus: "Desarrolladores y startups con infraestructura cloud.",
      price: "Desde $6/mes (Droplet básico)",
      ram: "512 MB (plan mínimo)",
      cpu: "1 vCPU Regular",
      storage: "10 GB SSD",
      bandwidth: "500 GB/mes",
      rootAccess: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Acceso root completo</span>
        </div>
      ),
      support: "Tickets y comunidad, plan premium de pago.",
      panel: "Panel propio limpio, sin cPanel/WHM incluido.",
      url: "https://www.digitalocean.com",
    },
    linode: {
      name: "Linode (Akamai)",
      focus: "Cloud computing flexible con data centers globales.",
      price: "Desde $5/mes (Nanode 1 GB)",
      ram: "1 GB (plan mínimo)",
      cpu: "1 vCPU Compartido",
      storage: "25 GB SSD",
      bandwidth: "1 TB/mes",
      rootAccess: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Acceso root completo</span>
        </div>
      ),
      support: "Tickets 24/7, sin chat en español.",
      panel: "Cloud Manager propio, sin panel de hosting.",
      url: "https://www.linode.com",
    },
    vultr: {
      name: "Vultr",
      focus: "Cloud servers por hora con 32 ubicaciones globales.",
      price: "Desde $2.50/mes (solo IPv6)",
      ram: "512 MB (plan mínimo usable)",
      cpu: "1 vCPU",
      storage: "10 GB SSD",
      bandwidth: "500 GB/mes (desde $2.50), 1 TB (desde $5)",
      rootAccess: (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Acceso root completo</span>
        </div>
      ),
      support: "Tickets 24/7, sin soporte en español.",
      panel: "Panel propio básico, sin cPanel incluido.",
      url: "https://www.vultr.com",
    },
  };

  const selectedCompetitor = competitors[compareWith];

  return (
    <div className="w-full">
      {/* Mobile-Only Pill Selector */}
      <div className="md:hidden flex flex-col gap-2.5 mb-6 bg-[#F5F7FB] p-3.5 rounded-2xl border border-slate-200/50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
          Comparar Hostinger VPS con:
        </span>
        <div className="flex gap-1.5 justify-center">
          <button
            onClick={() => setCompareWith("digitalocean")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "digitalocean"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-digitalocean"
          >
            DigitalOcean
          </button>
          <button
            onClick={() => setCompareWith("linode")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "linode"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-linode"
          >
            Linode
          </button>
          <button
            onClick={() => setCompareWith("vultr")}
            className={`grow py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${compareWith === "vultr"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            id="mobile-btn-vultr"
          >
            Vultr
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
                VPS KVM con panel integrado y soporte 24/7.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.focus}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Precio</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Desde $4.99/mes (KVM 1)
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.price}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">RAM</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>4 GB garantizados</span>
                </div>
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.ram}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">CPU</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                2 vCPU dedicados
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.cpu}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Almacenamiento</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                50 GB NVMe SSD
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.storage}</td>
            </tr>
            <tr>
              <td className="py-4 px-3.5 font-bold text-slate-900 bg-slate-50/10">Panel</td>
              <td className="py-4 px-3 font-medium text-slate-900 bg-violet-50/10 border-x border-violet-100/20">
                Panel VPS propio + plantillas con cPanel/CyberPanel.
              </td>
              <td className="py-4 px-3 text-slate-600">{selectedCompetitor.panel}</td>
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
                  href="https://www.hostg.xyz/SHJlB"
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
                <span className="block text-slate-400 text-[11px] font-normal mt-0.5">hostinger.com/vps</span>
              </th>

              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">DigitalOcean</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">Linode (Akamai)</th>
              <th className="py-5 px-6 font-semibold text-slate-800 text-sm w-1/5">Vultr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Enfoque Principal</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                VPS KVM gestionado con panel integrado y soporte en español.
              </td>
              <td className="py-5 px-6 text-slate-600">Cloud servers para desarrolladores y startups.</td>
              <td className="py-5 px-6 text-slate-600">Cloud computing flexible con red Akamai global.</td>
              <td className="py-5 px-6 text-slate-600">Cloud servers por hora con 32 ubicaciones globales.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Precio Inicial</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  Desde $4.99/mes (KVM 1)
                </div>
                4 GB RAM + 2 vCPU incluidos
              </td>
              <td className="py-5 px-6 text-slate-600">Desde $6/mes (512 MB RAM, 1 vCPU)</td>
              <td className="py-5 px-6 text-slate-600">Desde $5/mes (1 GB RAM, 1 vCPU compartido)</td>
              <td className="py-5 px-6 text-slate-600">Desde $2.50/mes (solo IPv6, 512 MB RAM)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">RAM / CPU</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  4 GB RAM + 2 vCPU dedicados (KVM 1)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">512 MB RAM, 1 vCPU (plan base $6/mes)</td>
              <td className="py-5 px-6 text-slate-600">1 GB RAM, 1 vCPU compartido (plan base)</td>
              <td className="py-5 px-6 text-slate-600">512 MB RAM, 1 vCPU (plan $2.50 solo IPv6)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Almacenamiento</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  50 GB NVMe SSD
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">10 GB SSD (plan base)</td>
              <td className="py-5 px-6 text-slate-600">25 GB SSD (plan base)</td>
              <td className="py-5 px-6 text-slate-600">10 GB SSD (plan base)</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Panel de Control</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Panel VPS propio + plantillas con cPanel, CyberPanel, Webmin.
              </td>
              <td className="py-5 px-6 text-slate-600">Panel cloud propio, sin cPanel incluido.</td>
              <td className="py-5 px-6 text-slate-600">Cloud Manager, sin panel de hosting incluido.</td>
              <td className="py-5 px-6 text-slate-600">Panel propio básico, sin cPanel incluido.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Soporte Técnico</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                Chat en vivo 24/7 en español, respuesta en minutos.
              </td>
              <td className="py-5 px-6 text-slate-600">Tickets y comunidad; soporte premium de pago.</td>
              <td className="py-5 px-6 text-slate-600">Tickets 24/7, sin chat en español.</td>
              <td className="py-5 px-6 text-slate-600">Tickets 24/7, sin soporte en español.</td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Backups</td>
              <td className="py-5 px-6 font-medium text-slate-900 bg-violet-50/20 border-x border-violet-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Backups semanales automáticos incluidos
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700">
                  Backups opcionales (+20% del plan)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700">
                  Backups opcionales ($2/mes)
                </div>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700">
                  Backups opcionales (+20% del plan)
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-5 px-6 font-bold text-slate-900 bg-slate-50/20">Visitar Web</td>
              <td className="py-5 px-6 bg-violet-50/20 border-x border-violet-100/30">
                <a
                  href="https://www.hostg.xyz/SHJlB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Visitar Hostinger
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.digitalocean.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar DigitalOcean <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.linode.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar Linode <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
              <td className="py-5 px-6 text-slate-600">
                <a href="https://www.vultr.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                  Visitar Vultr <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
