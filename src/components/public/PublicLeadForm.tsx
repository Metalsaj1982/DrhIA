"use client";

import { useState } from "react";
import { submitPublicLead } from "@/app/actions/public";
import type { ProductData } from "@/types";

interface PublicLeadFormProps {
  tenantId: string;
  tenantName: string;
  primaryColor: string;
  products: ProductData[];
}

export function PublicLeadForm({ tenantId, tenantName, primaryColor, products }: PublicLeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const leadData = {
      studentName: formData.get("studentName") as string,
      guardianName: formData.get("guardianName") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      studentAge: formData.get("studentAge") ? Number(formData.get("studentAge")) : undefined,
      productId: formData.get("productId") as string || undefined,
      campus: formData.get("campus") as string,
      interestReason: formData.get("interestReason") as string,
      source: "website",
    };

    const res = await submitPublicLead(tenantId, leadData as any);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center animate-fade-in" style={{ borderColor: primaryColor, borderWidth: '2px' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          ¡Información enviada con éxito!
        </h2>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Un asesor de admisiones de <strong>{tenantName}</strong> se comunicará contigo muy pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Nombre del Alumno *
          </label>
          <input name="studentName" required className="input w-full p-3 rounded-xl border border-gray-200" placeholder="Ej: Sofía Martínez" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Padre, Madre o Tutor *
          </label>
          <input name="guardianName" required className="input w-full p-3 rounded-xl border border-gray-200" placeholder="Ej: Laura Martínez" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Celular (WhatsApp) *
          </label>
          <input name="whatsapp" required type="tel" className="input w-full p-3 rounded-xl border border-gray-200" placeholder="+52 55 1234 5678" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Correo Electrónico *
          </label>
          <input name="email" required type="email" className="input w-full p-3 rounded-xl border border-gray-200" placeholder="correo@ejemplo.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Nivel Educativo de Interés *
          </label>
          <select name="productId" required className="input w-full p-3 rounded-xl border border-gray-200 bg-white">
            <option value="">Selecciona un nivel...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Campus preferido *
          </label>
          <select name="campus" required className="input w-full p-3 rounded-xl border border-gray-200 bg-white">
            <option value="Campus Norte">Campus Norte</option>
            <option value="Campus Sur">Campus Sur</option>
            <option value="Sede Principal">Sede Principal</option>
            <option value="Campus Centro">Campus Centro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          ¿Qué te gustaría saber del colegio?
        </label>
        <textarea name="interestReason" className="input w-full p-3 rounded-xl border border-gray-200" rows={3} placeholder="Costos, plan de estudios, actividades extraescolares..." />
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 mt-6"
        style={{ background: primaryColor }}
      >
        {loading ? "Enviando Solicitud..." : "Solicitar Información"}
      </button>
    </form>
  );
}
