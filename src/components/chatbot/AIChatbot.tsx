"use client";

import { useState, useRef, useEffect } from "react";
import { getChatbotResponse } from "@/app/actions/chatbot";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      content: '🎯 Soy tu **Agente de Marketing**. Escribe **"plan de hoy"** para ver tus tareas de marketing o **"campaña whatsapp"** para generar mensajes.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await getChatbotResponse(userMsg.content);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", content: "Error al procesar tu solicitud. Intenta de nuevo.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Renderiza markdown básico (bold)
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
        }}
        title="Asistente IA"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.66 3.438 17.168L2.546 20.2C2.386 20.727 2.873 21.214 3.4 21.054L6.832 20.062C8.34 20.975 10.11 21.5 12 21.5C17.523 21.5 22 17.023 22 11.5C22 6.477 17.523 2 12 2Z" stroke="white" strokeWidth="1.5"/>
            <circle cx="8.5" cy="12" r="1" fill="white"/>
            <circle cx="12" cy="12" r="1" fill="white"/>
            <circle cx="15.5" cy="12" r="1" fill="white"/>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          style={{
            background: 'var(--color-surface-primary)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-3 shrink-0" style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Agente de Marketing</p>
              <p className="text-white/60 text-[10px]">Campañas • Contenido • Remarketing</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/60 text-[10px]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '280px', maxHeight: '360px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                  }`}
                  style={{
                    background: msg.role === "user" ? '#4F46E5' : 'var(--color-surface-tertiary)',
                    color: msg.role === "user" ? 'white' : 'var(--color-text-primary)',
                  }}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1" style={{ background: 'var(--color-surface-tertiary)' }}>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            {["Plan de hoy", "WhatsApp", "Post Instagram", "Remarketing", "Email"].map((cmd) => (
              <button
                key={cmd}
                onClick={() => { setInput(cmd); }}
                className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors hover:bg-indigo-100"
                style={{
                  background: 'var(--color-surface-tertiary)',
                  color: 'var(--color-accent-600)',
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-3 flex gap-2 shrink-0" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border-0 outline-none"
              style={{ background: 'var(--color-surface-tertiary)' }}
              placeholder="¿Qué campaña necesitas?"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
              style={{ background: '#4F46E5' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2L10 14L7 9M14 2L2 6L7 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
