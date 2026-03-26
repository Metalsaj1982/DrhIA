"use client";

import { formatDate, isOverdue } from "@/lib/utils";
import type { AppointmentData } from "@/types";

interface AppointmentsClientProps {
  appointments: AppointmentData[];
}

const TYPE_LABELS: Record<string, string> = {
  visit: "Visita",
  interview: "Entrevista",
  tour: "Recorrido",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  visit: { bg: "#DBEAFE", text: "#1E40AF" },
  interview: { bg: "#EDE9FE", text: "#5B21B6" },
  tour: { bg: "#D1FAE5", text: "#065F46" },
};

export function AppointmentsClient({ appointments }: AppointmentsClientProps) {
  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.scheduledAt) >= now);
  const past = appointments.filter((a) => new Date(a.scheduledAt) < now);

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-tertiary)' }}>
          Próximas ({upcoming.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
          {upcoming.length === 0 && (
            <div className="card p-8 text-center text-sm col-span-full" style={{ color: 'var(--color-text-tertiary)' }}>
              Sin citas próximas
            </div>
          )}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-tertiary)' }}>
            Pasadas ({past.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {past.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment: apt, isPast }: { appointment: AppointmentData; isPast?: boolean }) {
  const colors = TYPE_COLORS[apt.type] || TYPE_COLORS.visit;
  const overdue = !isPast && isOverdue(apt.scheduledAt);

  return (
    <div className={`card p-4 ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="badge text-xs" style={{ background: colors.bg, color: colors.text }}>
          {TYPE_LABELS[apt.type] || apt.type}
        </span>
        {overdue && <span className="badge badge-red text-xs">Vencida</span>}
      </div>
      <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
        {apt.lead?.guardianName || "—"}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        {apt.lead?.studentName} · {apt.lead?.gradeInterest || "—"}
      </p>
      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="var(--color-text-tertiary)" strokeWidth="1"/>
          <path d="M2 6H12" stroke="var(--color-text-tertiary)" strokeWidth="1"/>
        </svg>
        <span className="text-xs font-medium" style={{ color: overdue ? 'var(--color-urgent)' : 'var(--color-text-secondary)' }}>
          {formatDate(apt.scheduledAt)}
        </span>
      </div>
      {apt.notes && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          {apt.notes}
        </p>
      )}
    </div>
  );
}
