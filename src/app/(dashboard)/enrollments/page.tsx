import { getEnrollments } from "@/app/actions";
import { formatDate, SOURCE_LABELS } from "@/lib/utils";

export default async function EnrollmentsPage() {
  const enrollments = await getEnrollments();

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Inscripciones
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {enrollments.length} alumnos inscritos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="card p-5 animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <span className="badge badge-green text-xs">Inscrito</span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatDate(enrollment.closedAt)}
              </span>
            </div>
            <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              {enrollment.studentName}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Tutor: {enrollment.guardianName}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2 rounded-lg text-center" style={{ background: 'var(--color-surface-secondary)' }}>
                <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--color-text-tertiary)' }}>Grado</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{enrollment.gradeFinal}</span>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ background: 'var(--color-surface-secondary)' }}>
                <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--color-text-tertiary)' }}>Fuente</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {SOURCE_LABELS[enrollment.lead?.source || ""] || "—"}
                </span>
              </div>
            </div>
            {enrollment.campus && (
              <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1C3.79 1 2 2.79 2 5C2 7.5 6 11 6 11S10 7.5 10 5C10 2.79 8.21 1 6 1Z" stroke="currentColor" strokeWidth="1"/>
                </svg>
                {enrollment.campus}
              </div>
            )}
            {enrollment.notes && (
              <p className="text-xs mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border-light)', color: 'var(--color-text-tertiary)' }}>
                {enrollment.notes}
              </p>
            )}
          </div>
        ))}
        {enrollments.length === 0 && (
          <div className="card p-12 text-center col-span-full" style={{ color: 'var(--color-text-tertiary)' }}>
            <p className="text-sm">Sin inscripciones registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
