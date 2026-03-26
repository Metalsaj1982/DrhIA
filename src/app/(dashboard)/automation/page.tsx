"use client";

import { useState } from "react";

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  triggerLabel: string;
  actions: WorkflowAction[];
  active: boolean;
  createdAt: string;
  runsToday: number;
}

interface WorkflowAction {
  id: string;
  type: string;
  label: string;
  config: Record<string, string>;
}

const TRIGGERS = [
  { id: "new_lead", label: "Nuevo Lead desde Formulario", icon: "📝", description: "Se dispara cuando un prospecto llena el formulario público" },
  { id: "lead_stage_change", label: "Lead Cambia de Etapa", icon: "🔄", description: "Se dispara cuando un lead avanza o retrocede en el pipeline" },
  { id: "lead_no_response", label: "Sin Respuesta (48h)", icon: "⏰", description: "Se dispara si un lead no responde en 48 horas" },
  { id: "appointment_scheduled", label: "Cita Agendada", icon: "📅", description: "Se dispara cuando se agenda una visita o entrevista" },
  { id: "lead_from_meta", label: "Lead desde Meta Ads", icon: "📢", description: "Se dispara con cada lead que entra por Facebook/Instagram" },
];

const ACTIONS = [
  { id: "send_whatsapp", label: "Enviar WhatsApp", icon: "💬", description: "Envía un mensaje de WhatsApp automático" },
  { id: "send_email", label: "Enviar Email", icon: "📧", description: "Envía un correo electrónico" },
  { id: "assign_user", label: "Asignar a Vendedor", icon: "👤", description: "Asigna el lead a un miembro del equipo" },
  { id: "move_stage", label: "Mover en Pipeline", icon: "➡️", description: "Mueve el lead a una etapa específica" },
  { id: "add_tag", label: "Agregar Etiqueta", icon: "🏷️", description: "Agrega una etiqueta al lead" },
  { id: "wait", label: "Esperar", icon: "⏳", description: "Espera un tiempo antes de la siguiente acción" },
  { id: "notify_admin", label: "Notificar Admin", icon: "🔔", description: "Envía una notificación al administrador" },
];

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Bienvenida Automática",
    trigger: "new_lead",
    triggerLabel: "Nuevo Lead desde Formulario",
    actions: [
      { id: "a1", type: "send_whatsapp", label: "Enviar WhatsApp", config: { message: "Hola {guardian_name}, gracias por su interés en nuestro colegio..." } },
      { id: "a2", type: "wait", label: "Esperar", config: { duration: "2 horas" } },
      { id: "a3", type: "send_email", label: "Enviar Email", config: { subject: "Bienvenido a nuestro colegio" } },
    ],
    active: true,
    createdAt: "2025-03-20",
    runsToday: 3,
  },
  {
    id: "wf-2",
    name: "Seguimiento Meta Ads",
    trigger: "lead_from_meta",
    triggerLabel: "Lead desde Meta Ads",
    actions: [
      { id: "b1", type: "assign_user", label: "Asignar a Vendedor", config: { user: "Admin Principal" } },
      { id: "b2", type: "send_whatsapp", label: "Enviar WhatsApp", config: { message: "¡Hola! Vimos su interés en nuestra publicación..." } },
      { id: "b3", type: "move_stage", label: "Mover en Pipeline", config: { stage: "Contactado" } },
    ],
    active: true,
    createdAt: "2025-03-22",
    runsToday: 7,
  },
  {
    id: "wf-3",
    name: "Rescate de Leads Fríos",
    trigger: "lead_no_response",
    triggerLabel: "Sin Respuesta (48h)",
    actions: [
      { id: "c1", type: "send_whatsapp", label: "Enviar WhatsApp", config: { message: "Hola, solo quería verificar si recibió nuestra información..." } },
      { id: "c2", type: "wait", label: "Esperar", config: { duration: "24 horas" } },
      { id: "c3", type: "notify_admin", label: "Notificar Admin", config: { message: "Lead sin respuesta requiere atención manual" } },
    ],
    active: false,
    createdAt: "2025-03-24",
    runsToday: 0,
  },
];

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOWS);
  const [showEditor, setShowEditor] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Editor state
  const [editorName, setEditorName] = useState("");
  const [editorTrigger, setEditorTrigger] = useState("");
  const [editorActions, setEditorActions] = useState<WorkflowAction[]>([]);
  const [showActionPicker, setShowActionPicker] = useState(false);

  function openEditor(wf?: Workflow) {
    if (wf) {
      setEditingWorkflow(wf);
      setEditorName(wf.name);
      setEditorTrigger(wf.trigger);
      setEditorActions([...wf.actions]);
    } else {
      setEditingWorkflow(null);
      setEditorName("");
      setEditorTrigger("");
      setEditorActions([]);
    }
    setShowEditor(true);
    setShowActionPicker(false);
  }

  function addAction(actionType: typeof ACTIONS[0]) {
    setEditorActions((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, type: actionType.id, label: actionType.label, config: {} },
    ]);
    setShowActionPicker(false);
  }

  function removeAction(actionId: string) {
    setEditorActions((prev) => prev.filter((a) => a.id !== actionId));
  }

  function saveWorkflow() {
    const trigger = TRIGGERS.find((t) => t.id === editorTrigger);
    const newWf: Workflow = {
      id: editingWorkflow?.id || `wf-${Date.now()}`,
      name: editorName,
      trigger: editorTrigger,
      triggerLabel: trigger?.label || "",
      actions: editorActions,
      active: editingWorkflow?.active ?? true,
      createdAt: editingWorkflow?.createdAt || new Date().toISOString().split("T")[0],
      runsToday: editingWorkflow?.runsToday || 0,
    };

    if (editingWorkflow) {
      setWorkflows((prev) => prev.map((w) => (w.id === newWf.id ? newWf : w)));
    } else {
      setWorkflows((prev) => [...prev, newWf]);
    }
    setShowEditor(false);
  }

  function toggleWorkflow(id: string) {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  }

  function deleteWorkflow(id: string) {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  const activeCount = workflows.filter((w) => w.active).length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runsToday, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Automatización
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crea flujos de trabajo para automatizar el seguimiento de prospectos.</p>
        </div>
        <button onClick={() => openEditor()} className="btn btn-primary">
          + NUEVO WORKFLOW
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-navy-700)' }}>{workflows.length}</p>
          <p className="text-xs text-gray-500">Workflows Totales</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-accent-600)' }}>{totalRuns}</p>
          <p className="text-xs text-gray-500">Ejecuciones Hoy</p>
        </div>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${wf.active ? 'bg-green-50' : 'bg-gray-100'}`}>
                  {TRIGGERS.find((t) => t.id === wf.trigger)?.icon || "⚡"}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{wf.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trigger: <span className="font-medium text-gray-700">{wf.triggerLabel}</span>
                  </p>
                  {/* Visual flow */}
                  <div className="flex items-center gap-1 mt-3 flex-wrap">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700">
                      {TRIGGERS.find((t) => t.id === wf.trigger)?.icon} TRIGGER
                    </span>
                    {wf.actions.map((action, idx) => (
                      <div key={action.id} className="flex items-center gap-1">
                        <span className="text-gray-300">→</span>
                        <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-600">
                          {ACTIONS.find((a) => a.id === action.type)?.icon} {action.label}
                          {idx < wf.actions.length - 1 ? "" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-gray-400">{wf.runsToday} hoy</span>
                {/* Toggle */}
                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: wf.active ? '#22C55E' : '#D1D5DB' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ left: wf.active ? '22px' : '2px' }}
                  />
                </button>
                <button onClick={() => openEditor(wf)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-700">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={() => deleteWorkflow(wf.id)} className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-red-500">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditor(false)}>
          <div className="card card-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-up" style={{ background: 'var(--color-surface-primary)' }}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-light)' }}>
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
                {editingWorkflow ? "Editar Workflow" : "Nuevo Workflow"}
              </h2>
              <button onClick={() => setShowEditor(false)} className="btn-ghost p-1.5 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 5L13 13M13 5L5 13" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Nombre del Workflow
                </label>
                <input
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="input text-sm"
                  placeholder="Ej: Bienvenida automática"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  ⚡ Disparador (¿Cuándo se activa?)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TRIGGERS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditorTrigger(t.id)}
                      className="text-left p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: editorTrigger === t.id ? 'var(--color-accent-500)' : 'var(--color-border-light)',
                        background: editorTrigger === t.id ? 'var(--color-accent-50)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{t.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-[11px] text-gray-500">{t.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  🎬 Acciones (¿Qué se hace?)
                </label>

                {editorActions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {editorActions.map((action, idx) => {
                      const actionDef = ACTIONS.find((a) => a.id === action.type);
                      return (
                        <div key={action.id} className="flex items-center gap-2">
                          {idx > 0 && (
                            <div className="w-6 flex justify-center">
                              <div className="w-0.5 h-6 bg-gray-200"></div>
                            </div>
                          )}
                          <div className="flex-1 flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-400">{idx + 1}.</span>
                              <span>{actionDef?.icon}</span>
                              <span className="text-sm font-medium">{action.label}</span>
                            </div>
                            <button onClick={() => removeAction(action.id)} className="text-gray-400 hover:text-red-500">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Action */}
                {!showActionPicker ? (
                  <button
                    onClick={() => setShowActionPicker(true)}
                    className="w-full p-3 rounded-xl border-2 border-dashed text-sm font-medium text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    style={{ borderColor: 'var(--color-border-light)' }}
                  >
                    + Agregar Acción
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface-secondary)' }}>
                    {ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => addAction(a)}
                        className="text-left p-2.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span>{a.icon}</span>
                          <div>
                            <p className="text-xs font-medium">{a.label}</p>
                            <p className="text-[10px] text-gray-400">{a.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Preview */}
              {editorTrigger && editorActions.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-secondary)' }}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-3">Vista previa del flujo</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                      {TRIGGERS.find((t) => t.id === editorTrigger)?.icon} {TRIGGERS.find((t) => t.id === editorTrigger)?.label}
                    </span>
                    {editorActions.map((action) => (
                      <div key={action.id} className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">→</span>
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          {ACTIONS.find((a) => a.id === action.type)?.icon} {action.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--color-border-light)' }}>
              <button onClick={() => setShowEditor(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button
                onClick={saveWorkflow}
                disabled={!editorName || !editorTrigger || editorActions.length === 0}
                className="btn btn-primary disabled:opacity-40"
              >
                {editingWorkflow ? "Guardar Cambios" : "Crear Workflow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
