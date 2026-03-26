"use client";

import { useState, useEffect, useRef } from "react";
import { getLeadMessages, sendMessage } from "@/app/actions";
import { timeAgo } from "@/lib/utils";
import type { MessageData } from "@/types";
import Link from "next/link";

interface Conversation {
  leadId: string;
  guardianName: string;
  studentName: string;
  whatsapp: string | null;
  lastMessage: MessageData | null;
  status: string;
}

const TEMPLATES = [
  {
    id: "welcome",
    label: "Bienvenida",
    icon: "👋",
    text: "¡Hola! Gracias por su interés en nuestro colegio. Soy {agente} del equipo de admisiones. ¿En qué puedo ayudarle?",
  },
  {
    id: "followup",
    label: "Seguimiento",
    icon: "📞",
    text: "Buen día, le escribimos para hacerle seguimiento sobre la solicitud de admisión de su hijo/a. ¿Tiene alguna duda o requiere información adicional?",
  },
  {
    id: "price",
    label: "Precios",
    icon: "💰",
    text: "Le informamos que nuestra mensualidad para el grado de interés es de $___. Incluye: matrícula, útiles escolares y acceso a plataforma digital. ¿Le gustaría agendar una visita?",
  },
  {
    id: "appointment",
    label: "Agendar Cita",
    icon: "📅",
    text: "Nos encantaría invitarle a conocer nuestras instalaciones. ¿Qué día y hora le quedaría mejor para una visita guiada? Contamos con disponibilidad de lunes a viernes.",
  },
  {
    id: "close",
    label: "Cierre",
    icon: "✅",
    text: "Excelente decisión. Para completar el proceso de admisión necesitamos: cédula del representante, partida de nacimiento del estudiante y último boletín. ¿Le puedo guiar en el proceso?",
  },
  {
    id: "reminder",
    label: "Recordatorio",
    icon: "⏰",
    text: "Le recordamos que su cita de visita está programada para mañana. Le esperamos con gusto. Por favor confirme asistencia respondiendo 'SÍ'.",
  },
];

const LABELS = [
  { id: "hot", label: "Caliente", color: "#EF4444", bg: "#FEE2E2" },
  { id: "warm", label: "Tibio", color: "#F59E0B", bg: "#FEF3C7" },
  { id: "cold", label: "Frío", color: "#6B7280", bg: "#F3F4F6" },
  { id: "scholarship", label: "Becas", color: "#7C3AED", bg: "#EDE9FE" },
  { id: "visit", label: "Visita", color: "#059669", bg: "#ECFDF5" },
];

const FILTER_TABS = ["Todos", "Sin leer", "Abiertos", "Cerrados"];

type RightPanel = "templates" | "info" | null;

export function ConversationsClient({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(
    conversations[0]?.leadId || null
  );
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>("templates");
  const [activeLabels, setActiveLabels] = useState<Record<string, string[]>>({});
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(leadId: string) {
    setLoading(true);
    const msgs = await getLeadMessages(leadId);
    setMessages(msgs as MessageData[]);
    setLoading(false);
  }

  async function handleSend() {
    if (!newMsg.trim() || !selected || sending) return;
    setSending(true);
    await sendMessage(selected, newMsg);
    setNewMsg("");
    await loadMessages(selected);
    setSending(false);
  }

  function openWhatsApp() {
    if (!selectedConvo?.whatsapp) return;
    const phone = selectedConvo.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(newMsg || "Hola, le contactamos del equipo de admisiones.");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  function insertTemplate(text: string) {
    setNewMsg(text);
  }

  function toggleLabel(leadId: string, labelId: string) {
    setActiveLabels((prev) => {
      const current = prev[leadId] || [];
      const updated = current.includes(labelId)
        ? current.filter((l) => l !== labelId)
        : [...current, labelId];
      return { ...prev, [leadId]: updated };
    });
  }

  const selectedConvo = conversations.find((c) => c.leadId === selected);
  const leadLabels = activeLabels[selected || ""] || [];

  const filteredConvos = conversations.filter((c) => {
    const matchSearch =
      c.guardianName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className="flex h-full overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--color-border-light)",
        background: "var(--color-surface-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* ── Zone 1: Sidebar ── */}
      <div
        className="w-72 flex flex-col shrink-0 border-r"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        {/* Sidebar header */}
        <div
          className="px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-navy-700)",
              }}
            >
              💬 WhatsApp CRM
            </p>
            <div
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
              title="Conectado"
            />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar contacto..."
            className="input text-xs w-full"
          />
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-0 border-b shrink-0"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="flex-1 py-2 text-[10px] font-semibold transition-colors"
              style={{
                color:
                  filter === tab
                    ? "var(--color-accent-600)"
                    : "var(--color-text-tertiary)",
                borderBottom:
                  filter === tab
                    ? "2px solid var(--color-accent-500)"
                    : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvos.map((convo) => {
            const isSelected = selected === convo.leadId;
            const labels = activeLabels[convo.leadId] || [];
            return (
              <button
                key={convo.leadId}
                onClick={() => setSelected(convo.leadId)}
                className="w-full text-left px-3 py-3 transition-colors border-b"
                style={{
                  borderColor: "var(--color-border-light)",
                  background: isSelected
                    ? "var(--color-accent-50)"
                    : "transparent",
                }}
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                    style={{
                      background: isSelected
                        ? "var(--color-accent-500)"
                        : "var(--color-navy-400, #64748B)",
                    }}
                  >
                    {initials(convo.guardianName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {convo.guardianName}
                      </p>
                      {convo.lastMessage && (
                        <span
                          className="text-[9px] shrink-0 ml-1"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {timeAgo(convo.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[10px] truncate mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {convo.lastMessage?.content || "Sin mensajes"}
                    </p>
                    {/* Labels */}
                    {labels.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {labels.map((lId) => {
                          const l = LABELS.find((x) => x.id === lId);
                          if (!l) return null;
                          return (
                            <span
                              key={lId}
                              className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ background: l.bg, color: l.color }}
                            >
                              {l.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredConvos.length === 0 && (
            <div
              className="flex items-center justify-center h-32 text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Sin resultados
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div
          className="p-3 border-t shrink-0"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          <div
            className="text-[10px] text-center"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {conversations.length} conversaciones · {conversations.filter(c => c.whatsapp).length} con WhatsApp
          </div>
        </div>
      </div>

      {/* ── Zone 2: Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div
              className="px-4 py-3 border-b flex items-center gap-3 shrink-0"
              style={{ borderColor: "var(--color-border-light)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: "var(--color-accent-500)" }}
              >
                {initials(selectedConvo.guardianName)}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-bold truncate"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-navy-700)",
                  }}
                >
                  {selectedConvo.guardianName}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {selectedConvo.whatsapp || "Sin WhatsApp registrado"} ·{" "}
                  {selectedConvo.studentName}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge badge-green text-[9px]">
                  {selectedConvo.status}
                </span>
                <Link
                  href={`/leads/${selectedConvo.leadId}`}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                  style={{
                    background: "var(--color-surface-secondary)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Ver Lead →
                </Link>
                {/* Panel toggles */}
                <button
                  onClick={() =>
                    setRightPanel(
                      rightPanel === "templates" ? null : "templates"
                    )
                  }
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background:
                      rightPanel === "templates"
                        ? "var(--color-accent-100)"
                        : "var(--color-surface-secondary)",
                    color:
                      rightPanel === "templates"
                        ? "var(--color-accent-600)"
                        : "var(--color-text-tertiary)",
                  }}
                  title="Plantillas"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="1" y="1" width="13" height="3" rx="1" fill="currentColor" opacity="0.5" />
                    <rect x="1" y="6" width="9" height="2" rx="1" fill="currentColor" />
                    <rect x="1" y="10" width="11" height="2" rx="1" fill="currentColor" opacity="0.7" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setRightPanel(rightPanel === "info" ? null : "info")
                  }
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background:
                      rightPanel === "info"
                        ? "var(--color-accent-100)"
                        : "var(--color-surface-secondary)",
                    color:
                      rightPanel === "info"
                        ? "var(--color-accent-600)"
                        : "var(--color-text-tertiary)",
                  }}
                  title="Info del contacto"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
                    <path d="M2 13C2 10.2 4.5 8 7.5 8S13 10.2 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                background: "#ECE5DD",
                backgroundImage:
                  "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="spinner" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isOut = msg.direction === "outbound";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOut ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[75%] px-3 py-2 rounded-xl shadow-sm"
                        style={{
                          background: isOut ? "#DCF8C6" : "white",
                          borderRadius: isOut
                            ? "12px 12px 2px 12px"
                            : "12px 12px 12px 2px",
                        }}
                      >
                        <p className="text-sm text-gray-800">{msg.content}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${isOut ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-[9px] text-gray-400">
                            {timeAgo(msg.sentAt)}
                          </span>
                          {isOut && (
                            <span className="text-[11px] text-blue-400">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.88 2.51 15.64 3.39 17.15L2 22L6.85 20.61C8.36 21.49 10.12 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#25D366" opacity="0.4"/>
                  </svg>
                  <p className="text-sm text-gray-500">Inicia la conversación</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className="px-3 py-2.5 border-t shrink-0"
              style={{
                borderColor: "var(--color-border-light)",
                background: "white",
              }}
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-0">
                  <textarea
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    className="input text-sm resize-none"
                    placeholder="Escribe un mensaje..."
                    style={{ minHeight: "36px", maxHeight: "100px" }}
                  />
                </div>
                {/* WhatsApp send — opens wa.me link */}
                {selectedConvo.whatsapp && (
                  <button
                    onClick={openWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold shrink-0 transition-colors"
                    style={{ background: "#25D366" }}
                    title="Abrir en WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 13.88 2.51 15.64 3.39 17.15L2 22L6.85 20.61C8.36 21.49 10.12 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.57 15.57C16.35 16.17 15.45 16.7 14.78 16.82C14.32 16.9 13.72 16.96 11.74 16.17C9.3 15.2 7.73 12.73 7.62 12.58C7.51 12.43 6.73 11.4 6.73 10.33C6.73 9.26 7.3 8.74 7.53 8.5C7.72 8.3 8.03 8.21 8.32 8.21C8.41 8.21 8.49 8.21 8.57 8.22C8.8 8.23 8.92 8.24 9.08 8.62C9.27 9.09 9.73 10.16 9.79 10.28C9.85 10.4 9.91 10.55 9.83 10.71C9.75 10.88 9.68 10.95 9.56 11.09C9.44 11.23 9.33 11.34 9.21 11.49C9.1 11.62 8.97 11.76 9.1 11.99C9.23 12.21 9.73 13.03 10.47 13.69C11.42 14.54 12.2 14.81 12.46 14.92C12.66 15.01 12.9 14.99 13.04 14.84C13.22 14.65 13.44 14.33 13.67 14.02C13.83 13.79 14.03 13.76 14.24 13.85C14.45 13.93 15.52 14.46 15.74 14.58C15.96 14.7 16.11 14.76 16.17 14.85C16.23 14.97 16.23 15.5 16.01 16.1L16.57 15.57Z"/>
                    </svg>
                    WhatsApp
                  </button>
                )}
                {/* Internal send */}
                <button
                  onClick={handleSend}
                  disabled={sending || !newMsg.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
                  style={{ background: "var(--color-accent-500)" }}
                >
                  {sending ? (
                    <span className="spinner w-4 h-4" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 2L7 9M14 2L10 14L7 9M14 2L2 6L7 9"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[9px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                Enter para enviar (interno) · Botón WhatsApp para abrir wa.me
              </p>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 opacity-40"
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 13.88 2.51 15.64 3.39 17.15L2 22L6.85 20.61C8.36 21.49 10.12 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#25D366"/>
            </svg>
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              Selecciona una conversación
            </p>
          </div>
        )}
      </div>

      {/* ── Zone 3 & 4: Right Panels ── */}
      {rightPanel && selectedConvo && (
        <div
          className="w-64 border-l flex flex-col shrink-0"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          {/* Panel header tabs */}
          <div
            className="flex border-b shrink-0"
            style={{ borderColor: "var(--color-border-light)" }}
          >
            <button
              onClick={() => setRightPanel("templates")}
              className="flex-1 py-2.5 text-[10px] font-semibold transition-colors"
              style={{
                color:
                  rightPanel === "templates"
                    ? "var(--color-accent-600)"
                    : "var(--color-text-tertiary)",
                borderBottom:
                  rightPanel === "templates"
                    ? "2px solid var(--color-accent-500)"
                    : "2px solid transparent",
              }}
            >
              📝 Plantillas
            </button>
            <button
              onClick={() => setRightPanel("info")}
              className="flex-1 py-2.5 text-[10px] font-semibold transition-colors"
              style={{
                color:
                  rightPanel === "info"
                    ? "var(--color-accent-600)"
                    : "var(--color-text-tertiary)",
                borderBottom:
                  rightPanel === "info"
                    ? "2px solid var(--color-accent-500)"
                    : "2px solid transparent",
              }}
            >
              👤 Contacto
            </button>
          </div>

          {/* Templates Panel */}
          {rightPanel === "templates" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <p
                className="text-[10px] font-semibold mb-3"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                RESPUESTAS RÁPIDAS
              </p>
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => insertTemplate(tpl.text)}
                  className="w-full text-left p-2.5 rounded-xl border transition-all hover:border-indigo-300 hover:bg-indigo-50"
                  style={{ borderColor: "var(--color-border-light)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{tpl.icon}</span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--color-accent-600)" }}
                    >
                      {tpl.label}
                    </span>
                  </div>
                  <p
                    className="text-[10px] leading-relaxed line-clamp-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {tpl.text}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Contact Info Panel */}
          {rightPanel === "info" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Contact card */}
              <div
                className="p-3 rounded-xl text-center"
                style={{ background: "var(--color-surface-secondary)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto mb-2"
                  style={{ background: "var(--color-accent-500)" }}
                >
                  {initials(selectedConvo.guardianName)}
                </div>
                <p
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-navy-700)",
                  }}
                >
                  {selectedConvo.guardianName}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  👨‍🎓 {selectedConvo.studentName}
                </p>
                {selectedConvo.whatsapp && (
                  <p
                    className="text-[10px] mt-0.5 font-mono"
                    style={{ color: "var(--color-accent-500)" }}
                  >
                    {selectedConvo.whatsapp}
                  </p>
                )}
              </div>

              {/* Lead info */}
              <div>
                <p
                  className="text-[10px] font-semibold mb-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  ETAPA DEL PIPELINE
                </p>
                <span
                  className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--color-surface-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {selectedConvo.status}
                </span>
              </div>

              {/* Labels */}
              <div>
                <p
                  className="text-[10px] font-semibold mb-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  ETIQUETAS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LABELS.map((label) => {
                    const isActive = leadLabels.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() =>
                          toggleLabel(selectedConvo.leadId, label.id)
                        }
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                        style={{
                          background: isActive ? label.bg : "var(--color-surface-secondary)",
                          color: isActive ? label.color : "var(--color-text-tertiary)",
                          border: `1.5px solid ${isActive ? label.color : "var(--color-border-light)"}`,
                        }}
                      >
                        {label.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <p
                  className="text-[10px] font-semibold mb-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  ACCIONES RÁPIDAS
                </p>
                <div className="space-y-1.5">
                  <Link
                    href={`/leads/${selectedConvo.leadId}`}
                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg text-[11px] font-medium transition-colors hover:bg-indigo-50"
                    style={{ color: "var(--color-accent-600)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M1 6.5H12M12 6.5L7.5 2M12 6.5L7.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Ver ficha completa
                  </Link>
                  {selectedConvo.whatsapp && (
                    <button
                      onClick={openWhatsApp}
                      className="flex items-center gap-2 w-full text-left p-2 rounded-lg text-[11px] font-medium transition-colors"
                      style={{
                        background: "#F0FDF4",
                        color: "#16A34A",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.88 2.51 15.64 3.39 17.15L2 22L6.85 20.61C8.36 21.49 10.12 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2Z"/>
                      </svg>
                      Abrir en WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
