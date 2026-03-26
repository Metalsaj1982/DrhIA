"use client";

import { useState } from "react";
import { updateTenantSettings } from "@/app/actions";
import { useRouter } from "next/navigation";
import type { TenantSettings } from "@/types";

interface SettingsClientProps {
  settings: TenantSettings;
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(settings.name);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [stages, setStages] = useState(settings.pipelineStages.join("\n"));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: "🏢" },
    { id: "branding", label: "Marca", icon: "🎨" },
    { id: "pipeline", label: "Pipeline", icon: "⇄" },
    { id: "whatsapp", label: "WhatsApp", icon: "📱" },
    { id: "integrations", label: "Integraciones", icon: "🔌" },
    { id: "widget", label: "Chat Widget", icon: "💬" },
    { id: "team", label: "Equipo", icon: "👥" },
  ];

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateTenantSettings({
        name,
        primaryColor,
        secondaryColor,
        pipelineStages: stages.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3"
            style={{
              background: activeTab === tab.id ? 'var(--color-accent-50)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent-600)' : 'var(--color-text-secondary)',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {activeTab === "general" && (
          <>
            {/* Institution Name */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
                Información de la Institución
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Nombre de la Institución
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Slug (URL)
                  </label>
                  <input value={settings.slug} disabled className="input text-sm opacity-60" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "branding" && (
          <>
            {/* Brand Colors */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
                Marca y Colores
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Color Primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" style={{ borderColor: 'var(--color-border-light)' }} />
                    <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="input text-sm flex-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Color Secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" style={{ borderColor: 'var(--color-border-light)' }} />
                    <input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="input text-sm flex-1" />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: primaryColor }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: secondaryColor }}>
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                    <path d="M6 8C6 6.89 6.89 6 8 6H24C25.1 6 26 6.89 26 8V22C26 23.1 25.1 24 24 24H18L13 28V24H8C6.89 24 6 23.1 6 22V8Z" fill="white" fillOpacity="0.9"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {name}
                </span>
              </div>
            </div>
          </>
        )}

        {activeTab === "pipeline" && (
          <>
            {/* Pipeline Stages */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-600)' }}>
                Etapas del Pipeline
              </h3>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                Una etapa por línea. El orden define el flujo del pipeline.
              </p>
              <textarea
                value={stages}
                onChange={(e) => setStages(e.target.value)}
                className="input text-sm font-mono"
                rows={8}
              />
            </div>
          </>
        )}

        {Object.keys(settings).length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,.3)' }} /> : null}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            {saved && (
              <span className="text-sm font-medium animate-fade-in" style={{ color: 'var(--color-success)' }}>
                ✓ Guardado exitosamente
              </span>
            )}
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="space-y-5">
            {/* Status card */}
            <div className="p-4 rounded-xl border-2 flex items-start gap-3" style={{ borderColor: '#25D366', background: '#F0FDF4' }}>
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#15803D' }}>WhatsApp Business API</p>
                <p className="text-xs mt-0.5" style={{ color: '#166534' }}>Meta Cloud API — Gratis hasta 1,000 conversaciones/mes</p>
              </div>
            </div>

            {/* Step 1: Webhook */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent-600)' }}>URL del Webhook (copia esto en Meta)</h3>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                En <strong>developers.facebook.com</strong> → Tu App → WhatsApp → Configuración → Webhook
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-tertiary)' }}>URL del Webhook</label>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] break-all p-2 rounded-lg border flex-1 font-mono" style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border-light)' }}>
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : 'https://tu-dominio.com/api/webhooks/whatsapp'}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`)}
                      className="btn btn-secondary px-2 py-1 text-[10px] shrink-0"
                    >Copiar</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Token de Verificación</label>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] p-2 rounded-lg border flex-1 font-mono" style={{ background: 'var(--color-surface-secondary)', borderColor: 'var(--color-border-light)' }}>
                      educrm-webhook-secret-2025
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText('educrm-webhook-secret-2025')}
                      className="btn btn-secondary px-2 py-1 text-[10px] shrink-0"
                    >Copiar</button>
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Este valor debe coincidir con WHATSAPP_WEBHOOK_VERIFY_TOKEN en .env</p>
                </div>
              </div>
            </div>

            {/* Step 2: Credentials */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent-600)' }}>Credenciales de API (en tu archivo .env)</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl font-mono text-[11px] space-y-2" style={{ background: '#1E1E2E', color: '#CDD6F4' }}>
                  <p><span style={{ color: '#A6E3A1' }}>WHATSAPP_API_TOKEN</span>=<span style={{ color: '#F9E2AF' }}>&quot;tu-token-de-acceso-aquí&quot;</span></p>
                  <p><span style={{ color: '#A6E3A1' }}>WHATSAPP_PHONE_NUMBER_ID</span>=<span style={{ color: '#F9E2AF' }}>&quot;tu-phone-number-id&quot;</span></p>
                  <p><span style={{ color: '#A6E3A1' }}>GEMINI_API_KEY</span>=<span style={{ color: '#F9E2AF' }}>&quot;tu-clave-de-gemini&quot;</span></p>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  Obtén el token en: <strong>Meta for Developers → Tu App → WhatsApp → API Setup</strong><br/>
                  Obtén Gemini Key en: <strong>aistudio.google.com/app/apikey</strong> (gratis)
                </p>
              </div>
            </div>

            {/* Step 3: ngrok for local */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent-600)' }}>Para pruebas locales — Usar ngrok</h3>
              </div>
              <div className="p-3 rounded-xl font-mono text-[11px] space-y-1" style={{ background: '#1E1E2E', color: '#CDD6F4' }}>
                <p><span style={{ color: '#89B4FA' }}># 1. Instalar ngrok</span></p>
                <p style={{ color: '#CDD6F4' }}>brew install ngrok</p>
                <p className="mt-2"><span style={{ color: '#89B4FA' }}># 2. Exponer tu servidor local</span></p>
                <p style={{ color: '#CDD6F4' }}>ngrok http 3000</p>
                <p className="mt-2"><span style={{ color: '#89B4FA' }}># 3. Copiar la URL que ngrok genera</span></p>
                <p style={{ color: '#F9E2AF' }}>https://xxxx.ngrok.io/api/webhooks/whatsapp</p>
              </div>
              <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Pega esa URL como Webhook en Meta. Recuerda actualizar la URL cada vez que reinicias ngrok.</p>
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-2">Google Business Profile</h3>
              <p className="text-xs text-gray-500 mb-4">Conecta tu perfil de Google para recibir mensajes y reseñas.</p>
              <button className="btn btn-secondary text-xs">CONECTAR GOOGLE</button>
            </div>
            
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-2">Meta (Facebook & Instagram)</h3>
              <p className="text-xs text-gray-500 mb-4">Configura tus webhooks para Lead Ads.</p>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface-secondary)' }}>
                <label className="block text-xs font-semibold mb-2">URL del Webhook</label>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] break-all p-2 bg-white rounded border flex-1">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/meta?tenantId=${settings.id}` : ''}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "widget" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4">Widget de Captación (Público)</h3>
            <p className="text-xs text-gray-500 mb-6">Usa este enlace para tu botón de WhatsApp o Bio de Instagram.</p>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <code className="text-xs font-semibold text-indigo-700">
                {typeof window !== 'undefined' ? `${window.location.origin}/apply/${settings.slug}` : ''}
              </code>
              <button 
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/apply/${settings.slug}`)}
                className="btn btn-primary px-3 py-2 text-xs"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4">Gestión de Equipo</h3>
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium">Admin Principal</p>
                <p className="text-xs text-gray-400">admin@colegio.com</p>
              </div>
              <span className="badge badge-blue text-xs uppercase">Admin</span>
            </div>
            <button className="btn btn-secondary w-full mt-6 text-xs">+ Agregar Miembro</button>
          </div>
        )}
      </div>
    </div>
  );
}
