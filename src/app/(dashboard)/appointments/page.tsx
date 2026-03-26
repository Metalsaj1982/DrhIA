import { getAppointments } from "@/app/actions";
import { AppointmentsClient } from "@/components/appointments/AppointmentsClient";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Citas Programadas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {appointments.length} citas en total
          </p>
        </div>
      </div>
      <AppointmentsClient appointments={appointments} />
    </div>
  );
}
