"use client";

import { SOURCE_LABELS, STAGE_COLORS } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface DashboardClientProps {
  stats: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const maxSourceCount = Math.max(...stats.leadsBySource.map((s) => s.count), 1);
  const maxStageCount = Math.max(...stats.leadsByStage.map((s) => s.count), 1);
  const maxEnrollmentCount = Math.max(...stats.enrollmentsByMonth.map((e) => e.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Prospectos"
          value={stats.totalLeads.toString()}
          icon="users"
          color="var(--color-accent-500)"
          bgColor="var(--color-accent-50)"
        />
        <KPICard
          label="Valor Pipeline (Pendiente)"
          value={`$${stats.pipelineValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="trending"
          color="var(--color-info)"
          bgColor="#ECFDF5"
        />
        <KPICard
          label="Ingresos Cerrados"
          value={`$${stats.enrolledRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="check"
          color="var(--color-success)"
          bgColor="#D1FAE5"
        />
        <KPICard
          label="Tasa de Conversión"
          value={`${stats.conversionRate}%`}
          icon="chart"
          color="var(--color-navy-700)"
          bgColor="var(--color-navy-50)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Prospectos por Fuente
          </h3>
          <div className="space-y-3">
            {stats.leadsBySource.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {SOURCE_LABELS[item.source] || item.source}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {item.count}
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--color-surface-tertiary)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.count / maxSourceCount) * 100}%`,
                      background: 'var(--color-accent-500)',
                    }}
                  />
                </div>
              </div>
            ))}
            {stats.leadsBySource.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>Sin datos</p>
            )}
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Embudo de Pipeline
          </h3>
          <div className="space-y-2">
            {stats.leadsByStage.map((item) => (
              <div key={item.stage} className="flex items-center gap-3">
                <div className="stage-dot" style={{ backgroundColor: STAGE_COLORS[item.stage] || '#94A3B8' }} />
                <span className="text-xs w-28 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.stage}
                </span>
                <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--color-surface-tertiary)' }}>
                  <div
                    className="h-full rounded-lg flex items-center px-2 transition-all"
                    style={{
                      width: `${Math.max((item.count / maxStageCount) * 100, 8)}%`,
                      background: STAGE_COLORS[item.stage] || '#94A3B8',
                    }}
                  >
                    <span className="text-[10px] font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
            {stats.leadsByStage.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>Sin datos</p>
            )}
          </div>
        </div>

        {/* Enrollments over time */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Inscripciones por Mes
          </h3>
          <div className="flex items-end gap-4 h-40">
            {stats.enrollmentsByMonth.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {item.count}
                </span>
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${Math.max((item.count / maxEnrollmentCount) * 100, 4)}%`,
                  background: 'linear-gradient(180deg, var(--color-accent-500) 0%, var(--color-navy-700) 100%)',
                  minHeight: '4px',
                }} />
                <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color, bgColor }: {
  label: string; value: string; icon: string; color: string; bgColor: string;
}) {
  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bgColor }}>
          {icon === 'users' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" stroke={color} strokeWidth="1.5"/>
              <path d="M3 16C3 13 5.68 11 9 11C12.32 11 15 13 15 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {icon === 'trending' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 13L7 9L10 12L15 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5H15V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {icon === 'check' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 9L8 12L13 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="7" stroke={color} strokeWidth="1.5"/>
            </svg>
          )}
          {icon === 'chart' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="9" width="3" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
              <rect x="7.5" y="5" width="3" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
              <rect x="12" y="3" width="3" height="12" rx="1" stroke={color} strokeWidth="1.5"/>
            </svg>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
        {label}
      </p>
    </div>
  );
}
