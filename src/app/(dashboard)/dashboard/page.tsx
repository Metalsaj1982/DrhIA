import { getDashboardStats } from "@/app/actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="px-4 md:px-6 py-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          Resumen de oportunidades y rendimiento comercial
        </p>
      </div>
      <DashboardClient stats={stats} />
    </div>
  );
}
