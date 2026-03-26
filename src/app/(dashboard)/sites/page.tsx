"use client";

import { useState } from "react";

interface FormItem {
  id: string;
  name: string;
  type: "form" | "landing" | "funnel";
  status: "active" | "draft";
  submissions: number;
  conversionRate: number;
  createdAt: string;
  url: string;
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required: boolean;
  placeholder: string;
  options?: string[];
}

const DEFAULT_ITEMS: FormItem[] = [
  {
    id: "f1",
    name: "Formulario de Admisión Principal",
    type: "form",
    status: "active",
    submissions: 47,
    conversionRate: 32,
    createdAt: "2025-03-10",
    url: "/apply",
  },
  {
    id: "f2",
    name: "Landing Page — Período Escolar 2025",
    type: "landing",
    status: "active",
    submissions: 128,
    conversionRate: 18,
    createdAt: "2025-03-05",
    url: "/landing/2025",
  },
  {
    id: "f3",
    name: "Funnel — Open House Virtual",
    type: "funnel",
    status: "draft",
    submissions: 0,
    conversionRate: 0,
    createdAt: "2025-03-22",
    url: "/funnel/open-house",
  },
  {
    id: "f4",
    name: "Formulario Becas Académicas",
    type: "form",
    status: "active",
    submissions: 23,
    conversionRate: 45,
    createdAt: "2025-03-15",
    url: "/apply/becas",
  },
];

const DEFAULT_FIELDS: FormField[] = [
  { id: "ff1", label: "Nombre del Representante", type: "text", required: true, placeholder: "Ej: Juan Pérez" },
  { id: "ff2", label: "Correo Electrónico", type: "email", required: true, placeholder: "correo@ejemplo.com" },
  { id: "ff3", label: "Teléfono / WhatsApp", type: "tel", required: true, placeholder: "+593 999 999 999" },
  { id: "ff4", label: "Nombre del Estudiante", type: "text", required: true, placeholder: "Ej: María Pérez" },
  { id: "ff5", label: "Grado de Interés", type: "select", required: true, placeholder: "Seleccionar grado", options: ["Inicial 1", "Inicial 2", "EGB 1", "EGB 2", "EGB 3", "EGB 4", "EGB 5", "EGB 6", "EGB 7", "EGB 8", "EGB 9", "EGB 10", "BGU 1", "BGU 2", "BGU 3"] },
  { id: "ff6", label: "Mensaje Adicional", type: "textarea", required: false, placeholder: "¿Alguna pregunta o comentario?" },
];

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  form: { icon: "📝", color: "#4F46E5", bg: "#EEF2FF" },
  landing: { icon: "🌐", color: "#059669", bg: "#ECFDF5" },
  funnel: { icon: "🔄", color: "#D97706", bg: "#FFFBEB" },
};

const TYPE_LABELS: Record<string, string> = {
  form: "Formulario",
  landing: "Landing Page",
  funnel: "Funnel",
};

type TabType = "all" | "form" | "landing" | "funnel";

export default function SitesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [items] = useState<FormItem[]>(DEFAULT_ITEMS);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showEmbed, setShowEmbed] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FormField["type"]>("text");

  const filteredItems = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);
  const totalSubmissions = items.reduce((sum, i) => sum + i.submissions, 0);
  const activeItems = items.filter((i) => i.status === "active").length;

  function addField() {
    if (!newFieldLabel.trim()) return;
    setFields((prev) => [
      ...prev,
      { id: `ff-${Date.now()}`, label: newFieldLabel, type: newFieldType, required: false, placeholder: "" },
    ]);
    setNewFieldLabel("");
    setNewFieldType("text");
    setShowAddField(false);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function moveField(idx: number, direction: "up" | "down") {
    setFields((prev) => {
      const next = [...prev];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }

  const embedCode = `<!-- EduCRM Form Embed -->
<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/apply/${showEmbed || ''}"
  width="100%"
  height="700"
  frameborder="0"
  style="border:none;border-radius:12px;"
></iframe>`;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Sitios & Formularios
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crea formularios de captación, landing pages y embudos de conversión.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBuilder(true)} className="btn btn-primary">
            + NUEVO FORMULARIO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-navy-700)' }}>{items.length}</p>
          <p className="text-xs text-gray-500">Sitios / Formularios</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-green-600">{activeItems}</p>
          <p className="text-xs text-gray-500">Publicados</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent-600)' }}>{totalSubmissions}</p>
          <p className="text-xs text-gray-500">Envíos Totales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface-secondary)' }}>
        {([["all", "Todos"], ["form", "Formularios"], ["landing", "Landing Pages"], ["funnel", "Funnels"]] as [TabType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === key ? 'white' : 'transparent',
              color: activeTab === key ? 'var(--color-accent-600)' : 'var(--color-text-tertiary)',
              boxShadow: activeTab === key ? 'var(--shadow-card)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const typeStyle = TYPE_ICONS[item.type];
          return (
            <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: typeStyle.bg }}>
                    {typeStyle.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                        style={{
                          background: item.status === "active" ? "#DCFCE7" : "#F3F4F6",
                          color: item.status === "active" ? "#16A34A" : "#9CA3AF",
                        }}
                      >
                        {item.status === "active" ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {TYPE_LABELS[item.type]} · Creado {item.createdAt}
                    </p>
                    {/* Metrics */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: 'var(--color-accent-600)' }}>{item.submissions}</span>
                        <span className="text-[10px] text-gray-400">envíos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: item.conversionRate > 25 ? '#16A34A' : '#F59E0B' }}>{item.conversionRate}%</span>
                        <span className="text-[10px] text-gray-400">conversión</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">URL:</span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-accent-500)' }}>{item.url}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowEmbed(item.id)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
                    style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)' }}
                  >
                    {"</>"}  Embed
                  </button>
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white transition-colors"
                    style={{ background: 'var(--color-accent-500)' }}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Builder Modal */}
      {showBuilder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBuilder(false)}>
          <div className="card card-elevated w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 animate-slide-up" style={{ background: 'var(--color-surface-primary)' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-light)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
                  Editor de Formulario
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Arrastra los campos para reordenar · Los cambios se guardan automáticamente</p>
              </div>
              <button onClick={() => setShowBuilder(false)} className="btn-ghost p-1.5 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 5L13 13M13 5L5 13" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Two column: form preview + field list */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Field List */}
                <div>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Campos del Formulario ({fields.length})
                  </p>
                  <div className="space-y-2">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface-secondary)' }}>
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button onClick={() => moveField(idx, "up")} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
                            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                          </button>
                          <button onClick={() => moveField(idx, "down")} disabled={idx === fields.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
                            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{field.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{field.type}</span>
                            {field.required && <span className="text-[10px] text-red-400 font-medium">Obligatorio</span>}
                          </div>
                        </div>
                        <button onClick={() => removeField(field.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add field */}
                  {!showAddField ? (
                    <button
                      onClick={() => setShowAddField(true)}
                      className="w-full mt-3 p-3 rounded-xl border-2 border-dashed text-sm font-medium text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                      style={{ borderColor: 'var(--color-border-light)' }}
                    >
                      + Agregar Campo
                    </button>
                  ) : (
                    <div className="mt-3 p-3 rounded-xl border space-y-2" style={{ borderColor: 'var(--color-border-light)' }}>
                      <input
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="input text-sm"
                        placeholder="Nombre del campo"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as FormField["type"])}
                        className="input text-sm"
                      >
                        <option value="text">Texto</option>
                        <option value="email">Email</option>
                        <option value="tel">Teléfono</option>
                        <option value="select">Selector</option>
                        <option value="textarea">Área de texto</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={addField} className="btn btn-primary text-xs flex-1">Agregar</button>
                        <button onClick={() => setShowAddField(false)} className="btn btn-secondary text-xs">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview */}
                <div>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Vista Previa
                  </p>
                  <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border-light)', background: 'white' }}>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--color-navy-700)' }}>Solicitud de Admisión</h3>
                      <p className="text-xs text-gray-400 mt-1">Complete el formulario para iniciar el proceso</p>
                    </div>
                    {fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.type === "select" ? (
                          <select className="input text-sm" disabled>
                            <option>{field.placeholder}</option>
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea className="input text-sm" rows={2} placeholder={field.placeholder} disabled />
                        ) : (
                          <input className="input text-sm" type={field.type} placeholder={field.placeholder} disabled />
                        )}
                      </div>
                    ))}
                    <button className="btn btn-primary w-full mt-2" disabled>Enviar Solicitud</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--color-border-light)' }}>
              <button onClick={() => setShowBuilder(false)} className="btn btn-secondary">Cerrar</button>
              <button onClick={() => setShowBuilder(false)} className="btn btn-primary">Guardar Formulario</button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbed && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEmbed(null)}>
          <div className="card card-elevated w-full max-w-lg m-4 animate-slide-up" style={{ background: 'var(--color-surface-primary)' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-light)' }}>
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
                Código de Inserción
              </h2>
              <button onClick={() => setShowEmbed(null)} className="btn-ghost p-1.5 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 5L13 13M13 5L5 13" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Copia y pega este código en tu sitio web para mostrar el formulario de captación:</p>
              <div className="rounded-xl p-4 font-mono text-xs overflow-x-auto" style={{ background: '#1E1E2E', color: '#A6E3A1' }}>
                <pre className="whitespace-pre-wrap">{embedCode}</pre>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(embedCode); }}
                className="btn btn-primary w-full"
              >
                📋 Copiar al Portapapeles
              </button>
              <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-secondary)' }}>
                <p className="text-[11px] text-gray-500">
                  💡 <strong>Tip:</strong> También puedes compartir el enlace directo del formulario en tus campañas de WhatsApp y redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
