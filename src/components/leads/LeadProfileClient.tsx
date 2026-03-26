"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLead, sendMessage } from "@/app/actions";
import { SOURCE_LABELS, STAGE_COLORS, DEFAULT_STAGES, formatDate, timeAgo } from "@/lib/utils";
import type { LeadWithRelations } from "@/types";

interface LeadProfileClientProps {
  lead: LeadWithRelations;
}

export function LeadProfileClient({ lead }: LeadProfileClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [nextAction, setNextAction] = useState(lead.nextAction || "");
  const [nextActionAt, setNextActionAt] = useState(
    lead.nextActionAt ? new Date(lead.nextActionAt).toISOString().slice(0, 16) : ""
  );
  const [notes, setNotes] = useState(lead.notes || "");
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const stageIndex = DEFAULT_STAGES.indexOf(status);

  async function handleSave() {
    setSaving(true);
    try {
      await updateLead(lead.id, {
        status,
        nextAction: nextAction || null,
        nextActionAt: nextActionAt || null,
        notes,
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    await sendMessage(lead.id, newMessage);
    setNewMessage("");
    router.refresh();
  }

  return (
    <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto">
      {/* Breadcrumb + header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            {lead.guardianName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Alumno: {lead.studentName} · ID: {lead.id.slice(0, 8)}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,.3)' }} /> : null}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Contact info + Source */}
        <div className="space-y-4">
          {/* Contact card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
              Información de Contacto
            </h3>
            <div className="space-y-3">
              <InfoRow label="NOMBRE COMPLETO" value={lead.guardianName} />
              <InfoRow label="CORREO ELECTRÓNICO" value={lead.email || "—"} isLink={!!lead.email} />
              <InfoRow label="TELÉFONO" value={lead.phone || "—"} />
              <InfoRow label="WHATSAPP" value={lead.whatsapp || "—"} />
            </div>
          </div>

          {/* Source card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
              {(lead.source === 'facebook_ads' || lead.source === 'instagram_ads') && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" color="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Detalles del Prospecto
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailBox label="ORIGEN" value={SOURCE_LABELS[lead.source] || lead.source} />
              <DetailBox label="GRADO" value={lead.product?.name || lead.gradeInterest || "—"} />
              <DetailBox label="CAMPUS" value={lead.campus || "—"} />
              <DetailBox label="EDAD" value={lead.studentAge ? `${lead.studentAge} años` : "—"} />
            </div>
            {lead.interestReason && (
              <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold block mb-1" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>RAZÓN DE INTERÉS</span>
                {lead.interestReason}
              </div>
            )}
            {/* Meta Webhook raw context if present */}
            {lead.notes?.includes('Leadgen ID') && (
              <div className="mt-3 p-2 rounded-lg text-[10px] bg-blue-50 text-blue-800 border-l-2 border-blue-500 overflow-hidden text-ellipsis whitespace-nowrap">
                <strong>Meta Ads Data:</strong> {lead.notes}
              </div>
            )}
          </div>
        </div>

        {/* Center column — Status + Pipeline + Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status + Next action */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
                Estado del Prospecto
              </h3>
              <span className="badge badge-green">{status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Estado del Embudol</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input select text-sm font-semibold text-[var(--color-navy-700)]">
                  {DEFAULT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Pipeline progress */}
            <div className="mb-2">
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Progresión del Pipeline</span>
            </div>
            <div className="pipeline-progress mb-1">
              {DEFAULT_STAGES.map((s, i) => (
                <div
                  key={s}
                  className={`pipeline-progress-segment ${i < stageIndex ? 'completed' : i === stageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="text-right text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Etapa {stageIndex + 1} de {DEFAULT_STAGES.length}
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
              Notas del Consejero
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input text-sm"
              rows={4}
              placeholder="Agregar notas sobre este prospecto..."
            />
          </div>

          {/* Message history */}
          <div className="card p-0 overflow-hidden flex flex-col border-[var(--color-accent-500)] shadow-md">
            <div className="p-4 bg-[var(--color-accent-50)] border-b border-[var(--color-border-light)] flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-700)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="currentColor"/>
                </svg>
                WhatsApp - Seguimiento
              </h3>
            </div>

            <div className="p-5">
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4 px-2">
                {lead.messages && lead.messages.length > 0 ? (
                  lead.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                      <div className={msg.direction === 'outbound' ? 'chat-bubble-out text-sm' : 'chat-bubble-in text-sm'}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] mt-1 opacity-60 px-1">{timeAgo(msg.sentAt)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>Sin mensajes de WhatsApp.</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => setNewMessage("Hola " + lead.guardianName + ", ")}>
                      Iniciar conversación
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Scheduler */}
              <div className="bg-[var(--color-surface-secondary)] p-3 rounded-lg mb-4 flex grid grid-cols-2 gap-3">
                 <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Siguiente Contacto</label>
                  <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="input text-xs" placeholder="Motivo del mensaje" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Cuándo recordar</label>
                   <input type="datetime-local" value={nextActionAt} onChange={(e) => setNextActionAt(e.target.value)} className="input text-xs" />
                </div>
              </div>

              {/* Quick message input */}
              <div className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="input text-sm flex-1"
                  placeholder="Mensaje de WhatsApp..."
                />
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="btn btn-primary px-4 bg-[#25D366] hover:bg-[#1DA851] border-none shadow-md disabled:opacity-50 text-white">
                  Enviar
                </button>
              </div>
            </div>
          </div>

          {/* Appointments */}
          {lead.appointments && lead.appointments.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
                Citas Programadas
              </h3>
              <div className="space-y-2">
                {lead.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface-secondary)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-100)' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="var(--color-accent-600)" strokeWidth="1.2"/>
                        <path d="M2 6H12" stroke="var(--color-accent-600)" strokeWidth="1.2"/>
                        <path d="M5 1.5V3.5" stroke="var(--color-accent-600)" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M9 1.5V3.5" stroke="var(--color-accent-600)" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {apt.type === 'visit' ? 'Visita' : apt.type === 'interview' ? 'Entrevista' : 'Recorrido'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatDate(apt.scheduledAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer stats */}
          <div className="card p-4 flex items-center gap-6" style={{ background: 'var(--color-navy-700)' }}>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 14L7 10L10 13L17 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Creado: {formatDate(lead.createdAt)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Última interacción: {lead.lastInteractionAt ? timeAgo(lead.lastInteractionAt) : "Sin interacción"}
                </p>
              </div>
            </div>
            <div className="text-center px-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-lg font-bold text-white">{lead.messages?.length || 0}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Mensajes</p>
            </div>
            <div className="text-center px-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-lg font-bold text-white">{lead.appointments?.length || 0}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Citas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-secondary)' }}>
      <span className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </span>
      {isLink ? (
        <span className="text-sm" style={{ color: 'var(--color-accent-500)' }}>{value}</span>
      ) : (
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
      )}
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-secondary)' }}>
      <span className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}
