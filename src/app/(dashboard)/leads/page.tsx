import { getLeads } from "@/app/actions";
import { LeadListClient } from "@/components/leads/LeadListClient";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Lista de Prospectos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {leads.length} prospectos en total
          </p>
        </div>
      </div>

      <LeadListClient initialLeads={leads} />
    </div>
  );
}
