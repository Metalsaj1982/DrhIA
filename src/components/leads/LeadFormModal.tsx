"use client";

import { useState, useEffect } from "react";
import { createLead } from "@/app/actions";
import { getProducts } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import type { ProductData } from "@/types";

interface LeadFormModalProps {
  onClose: () => void;
}

export function LeadFormModal({ onClose }: LeadFormModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createLead({
        studentName: formData.get("studentName") as string,
        guardianName: formData.get("guardianName") as string,
        phone: formData.get("phone") as string,
        whatsapp: formData.get("whatsapp") as string,
        email: formData.get("email") as string,
        studentAge: formData.get("studentAge") ? Number(formData.get("studentAge")) : undefined,
        productId: formData.get("productId") as string || undefined,
        campus: formData.get("campus") as string,
        source: formData.get("source") as string,
        interestReason: formData.get("interestReason") as string,
        notes: formData.get("notes") as string,
      });
      router.refresh();
      onClose();
    } catch {
      alert("Error al crear prospecto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card card-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-slide-up" style={{
        background: 'var(--color-surface-primary)',
      }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-light)' }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Nuevo Prospecto
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 5L13 13M13 5L5 13" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Nombre del Alumno *
              </label>
              <input name="studentName" required className="input text-sm" placeholder="Ej: Sofía Martínez" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Padre/Madre/Tutor *
              </label>
              <input name="guardianName" required className="input text-sm" placeholder="Ej: Laura Martínez" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Teléfono
              </label>
              <input name="phone" className="input text-sm" placeholder="+52 55 1234 5678" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                WhatsApp
              </label>
              <input name="whatsapp" className="input text-sm" placeholder="+5215512345678" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Correo Electrónico
            </label>
            <input name="email" type="email" className="input text-sm" placeholder="correo@ejemplo.com" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Edad
              </label>
              <input name="studentAge" type="number" min="1" max="25" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Nivel / Producto *
              </label>
              <select name="productId" required className="input select text-sm">
                <option value="">Selecciona un nivel...</option>
                {products.filter(p => p.active).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Campus
              </label>
              <input name="campus" className="input text-sm" placeholder="Campus Norte" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Fuente *
            </label>
            <select name="source" required className="input select text-sm">
              <option value="manual">Entrada Manual</option>
              <option value="facebook_ads">Facebook Ads</option>
              <option value="instagram_ads">Instagram Ads</option>
              <option value="website">Formulario Web</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="referral">Referido</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Razón de Interés
            </label>
            <textarea name="interestReason" className="input text-sm" rows={2} placeholder="¿Por qué se interesó en el colegio?" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Notas
            </label>
            <textarea name="notes" className="input text-sm" rows={2} placeholder="Notas adicionales..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : null}
              {loading ? "Guardando..." : "Crear Prospecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
