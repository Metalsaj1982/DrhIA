"use client";

import { useState } from "react";
import { moveLeadStage } from "@/app/actions";
import { STAGE_COLORS, getUrgencyLevel, timeAgo, SOURCE_LABELS } from "@/lib/utils";
import type { PipelineColumn, LeadWithRelations } from "@/types";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LeadFormModal } from "../leads/LeadFormModal";

interface PipelineBoardProps {
  initialColumns: PipelineColumn[];
}

export function PipelineBoard({ initialColumns }: PipelineBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedLead, setDraggedLead] = useState<LeadWithRelations | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showNewLead = searchParams.get("new") === "true";

  function closeNewLeadModal() {
    router.replace(pathname);
  }

  function handleDragStart(lead: LeadWithRelations) {
    setDraggedLead(lead);
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  async function handleDrop(targetStage: string) {
    if (!draggedLead || draggedLead.status === targetStage) {
      setDraggedLead(null);
      setDragOverStage(null);
      return;
    }

    // Optimistic update
    setColumns((prev) =>
      prev.map((col) => {
        if (col.stage === draggedLead.status) {
          return {
            ...col,
            leads: col.leads.filter((l) => l.id !== draggedLead.id),
            count: col.count - 1,
          };
        }
        if (col.stage === targetStage) {
          return {
            ...col,
            leads: [...col.leads, { ...draggedLead, status: targetStage }],
            count: col.count + 1,
          };
        }
        return col;
      })
    );

    setDraggedLead(null);
    setDragOverStage(null);

    // Persist to server
    await moveLeadStage(draggedLead.id, targetStage);
  }

  const totalLeads = columns.reduce((sum, col) => sum + col.count, 0);
  
  const pipelineValue = columns.reduce((sum, col) => {
    return sum + col.leads.reduce((stageSum, lead) => {
      // Usamos el precio del producto si está asignado
      return stageSum + (lead.product?.price || 0);
    }, 0);
  }, 0);

  return (
    <div className="flex gap-4 h-full min-w-max">
      {columns.map((column) => (
        <div
          key={column.stage}
          className="kanban-column flex flex-col min-w-[320px] max-w-[320px]"
          onDragOver={(e) => handleDragOver(e, column.stage)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(column.stage)}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div
              className="stage-dot"
              style={{ backgroundColor: STAGE_COLORS[column.stage] || "#94A3B8" }}
            />
            <span className="text-sm font-semibold uppercase tracking-wide" style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-secondary)',
              fontSize: '12px',
            }}>
              {column.stage}
            </span>
            <span className="badge badge-gray text-xs ml-auto">
              {column.count}
            </span>
          </div>

          {/* Column body */}
          <div
            className="flex-1 space-y-2.5 overflow-y-auto rounded-xl p-2 transition-colors"
            style={{
              background: dragOverStage === column.stage
                ? 'var(--color-accent-50)'
                : 'var(--color-surface-secondary)',
              border: dragOverStage === column.stage
                ? '2px dashed var(--color-accent-400)'
                : '2px dashed transparent',
              minHeight: '200px',
            }}
          >
            {column.leads.map((lead, idx) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onDragStart={() => handleDragStart(lead)}
                delay={idx * 50}
              />
            ))}

            {column.leads.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Sin prospectos
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary footer — absolute positioned at bottom */}
      <div className="fixed bottom-20 md:bottom-4 left-56 md:left-60 right-4 flex items-center gap-6 px-4 py-2 rounded-xl" style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div>
          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
            Valor Pipeline
          </span>
          <p className="text-lg font-bold" style={{ color: 'var(--color-accent-600)', fontFamily: 'var(--font-display)' }}>
            <span className="text-sm font-normal text-gray-400 mr-1">$</span>
            {pipelineValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-display)' }}>
            Tasa de Conversión
          </span>
          <p className="text-lg font-bold" style={{ color: 'var(--color-accent-500)', fontFamily: 'var(--font-display)' }}>
            {totalLeads > 0
              ? `${((columns.find(c => c.stage === "Inscrito")?.count || 0) / totalLeads * 100).toFixed(1)}%`
              : "0%"
            }
          </p>
        </div>
      </div>
      
      {showNewLead && <LeadFormModal onClose={closeNewLeadModal} />}
    </div>
  );
}

// Lead Scoring: calcula un puntaje de 0-100 basado en actividad del lead
function getLeadScore(lead: LeadWithRelations): { score: number; label: string; color: string; bg: string } {
  let score = 0;
  // Tiene producto asignado (+20)
  if (lead.product) score += 20;
  // Tiene WhatsApp (+10)
  if (lead.whatsapp) score += 10;
  // Fuente de alta intención (+15)
  if (["facebook_ads", "instagram_ads", "google_ads"].includes(lead.source)) score += 15;
  // Tiene acción programada (+10)
  if (lead.nextAction) score += 10;
  // Avance en el pipeline (+puntos por etapa)
  const stagePoints: Record<string, number> = { Nuevo: 5, Contactado: 15, Interesado: 25, "Visita Programada": 35, Entrevista: 45, "Pre-inscripción": 55, Inscrito: 70 };
  score += stagePoints[lead.status] || 0;
  // Campus asignado (+5)
  if (lead.campus) score += 5;

  score = Math.min(score, 100);

  if (score >= 60) return { score, label: "Hot", color: "#EF4444", bg: "#FEE2E2" };
  if (score >= 30) return { score, label: "Warm", color: "#F59E0B", bg: "#FEF3C7" };
  return { score, label: "Cold", color: "#6B7280", bg: "#F3F4F6" };
}

// Individual lead card in pipeline
function LeadCard({
  lead,
  onDragStart,
  delay,
}: {
  lead: LeadWithRelations;
  onDragStart: () => void;
  delay: number;
}) {
  const urgency = getUrgencyLevel(lead.nextActionAt);
  const scoring = getLeadScore(lead);
  const initials = lead.guardianName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const urgencyClass =
    urgency === "critical"
      ? "urgency-critical"
      : urgency === "warning"
      ? "urgency-warning"
      : urgency === "normal"
      ? "urgency-normal"
      : "";

  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        className={`card p-0 cursor-grab active:cursor-grabbing animate-fade-in transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${urgencyClass}`}
        style={{
          animationDelay: `${delay}ms`,
          borderLeft: `3px solid ${scoring.color}`,
          overflow: 'hidden',
        }}
      >
        <div className="p-4">
          {/* Top row: Avatar + Name + Score */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{
                background: `linear-gradient(135deg, ${scoring.color} 0%, ${scoring.color}CC 100%)`,
              }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  {lead.guardianName}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {lead.studentName}{lead.gradeInterest && ` · ${lead.gradeInterest}`}
                </p>
              </div>
            </div>
            {/* Lead Score Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0" style={{ background: scoring.bg, color: scoring.color }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: scoring.color }} />
              {scoring.label} {scoring.score}
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {urgency === "critical" && (
              <span className="badge badge-red text-[9px]">! URGENTE</span>
            )}
            {lead.source && (
              <span className="badge badge-blue text-[9px]">
                {SOURCE_LABELS[lead.source] || lead.source}
              </span>
            )}
            {lead.campus && (
              <span className="badge badge-gray text-[9px]">📍 {lead.campus}</span>
            )}
          </div>

          {/* Value + Time row */}
          <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            {lead.product ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-accent-600)' }}>
                  ${lead.product.price.toFixed(0)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>/mes</span>
              </div>
            ) : (
              <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>Sin producto</span>
            )}
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {timeAgo(lead.createdAt)}
            </span>
          </div>

          {/* Next action */}
          {lead.nextAction && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center" style={{
                background: urgency === 'critical' ? '#FEE2E2' : urgency === 'warning' ? '#FEF3C7' : '#D1FAE5',
              }}>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke={urgency === 'critical' ? '#EF4444' : urgency === 'warning' ? '#F59E0B' : '#10B981'} strokeWidth="1"/>
                  <path d="M5 3V5.5L6.5 6.5" stroke={urgency === 'critical' ? '#EF4444' : urgency === 'warning' ? '#F59E0B' : '#10B981'} strokeWidth="0.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[10px] font-medium truncate" style={{
                color: urgency === 'critical' ? 'var(--color-urgent)' : 'var(--color-text-secondary)',
              }}>
                {lead.nextAction}
              </span>
            </div>
          )}

          {/* WhatsApp Action for Urgent Follow-ups */}
          {(urgency === 'critical' || urgency === 'warning') && lead.whatsapp && (
             <div className="mt-2.5">
               <button onClick={(e) => { e.preventDefault(); window.location.href = `/leads/${lead.id}`; }} className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md text-white text-[10px] font-semibold transition-colors" style={{ background: '#25D366' }}>
                 💬 Seguimiento Inmediato
               </button>
             </div>
          )}
        </div>
      </div>
    </Link>
  );
}
