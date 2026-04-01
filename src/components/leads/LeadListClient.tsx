"use client";

import { useState } from "react";
import Link from "next/link";
import { SOURCE_LABELS, getUrgencyLevel, timeAgo, STAGE_COLORS } from "@/lib/utils";
import type { LeadWithRelations } from "@/types";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadImportModal } from "@/components/leads/LeadImportModal";

interface LeadListClientProps {
  initialLeads: LeadWithRelations[];
}

export function LeadListClient({ initialLeads }: LeadListClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNewLead, setShowNewLead] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = leads.filter((lead) => {
    const matchesSearch = !search ||
      lead.guardianName.toLowerCase().includes(search.toLowerCase()) ||
      lead.studentName.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search) ||
      lead.whatsapp?.includes(search) ||
      lead.email?.toLowerCase().includes(search.toLowerCase());
    const matchesSource = !filterSource || lead.source === filterSource;
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const downloadCSV = () => {
    // ... no changes here
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="input select text-sm w-auto min-w-[150px]"
        >
          <option value="">Todas las fuentes</option>
          <option value="facebook_ads">Facebook Ads</option>
          <option value="instagram_ads">Instagram Ads</option>
          <option value="tiktok">TikTok Ads</option>
          <option value="website">Formulario Web</option>
          <option value="whatsapp">WhatsApp Web</option>
          <option value="referral">Referido</option>
          <option value="manual">Manual</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input select text-sm w-auto min-w-[150px]"
        >
          <option value="">Todos los estados</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Contactado">Contactado</option>
          <option value="Interesado">Interesado</option>
          <option value="Visita Programada">Visita Programada</option>
          <option value="Entrevista">Entrevista</option>
          <option value="Pre-inscripción">Pre-inscripción</option>
          <option value="Inscrito">Inscrito</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-secondary btn-sm"
            title="Importar desde CSV / Bases de datos"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importar
          </button>
          <button
            onClick={downloadCSV}
            className="btn btn-secondary btn-sm"
            title="Exportar a CSV para Remarketing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>
          <button
            onClick={() => setShowNewLead(true)}
            className="btn btn-primary btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface-tertiary)' }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
                  Prospecto
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
                  Grado
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
                  Fuente
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
                  Próxima Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const urgency = getUrgencyLevel(lead.nextActionAt);
                return (
                  <tr
                    key={lead.id}
                    className="border-t hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--color-border-light)' }}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="block">
                        <p className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                          {lead.guardianName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Alumno: {lead.studentName}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--color-text-secondary)' }}>
                      {lead.gradeInterest || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge badge-blue text-xs">
                        {SOURCE_LABELS[lead.source] || lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="stage-dot" style={{ backgroundColor: STAGE_COLORS[lead.status] || '#94A3B8' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          {lead.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.nextAction ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{
                            color: urgency === 'critical' ? 'var(--color-urgent)' : 'var(--color-text-secondary)',
                            fontWeight: urgency === 'critical' ? 600 : 400,
                          }}>
                            {lead.nextAction}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                            {timeAgo(lead.nextActionAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                    No se encontraron prospectos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewLead && <LeadFormModal onClose={() => setShowNewLead(false)} />}
      {showImport && (
        <LeadImportModal 
          onClose={() => setShowImport(false)} 
          onSuccess={() => {
            // Recargar la página es lo más simple para ver los nuevos leads
            window.location.reload();
          }} 
        />
      )}
    </>
  );
}
