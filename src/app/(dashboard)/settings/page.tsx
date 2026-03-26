import { getTenantSettings } from "@/app/actions";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const settings = await getTenantSettings();
  if (!settings) return <div>Error cargando configuración</div>;

  return (
    <div className="px-4 md:px-6 py-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          Configuración
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          Personaliza tu institución
        </p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
