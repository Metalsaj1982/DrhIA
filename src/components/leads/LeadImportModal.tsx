"use client";

import { useState } from "react";
import { importLeadsAction } from "@/app/actions";

interface LeadImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadImportModal({ onClose, onSuccess }: LeadImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      const headers = rows[0].map(h => h.trim().replace(/"/g, ''));
      
      const data = rows.slice(1).filter(row => row.length > 1).map(row => {
        const obj: any = {};
        headers.forEach((header, i) => {
          const val = row[i]?.trim().replace(/"/g, '');
          // Mapping simple headers
          if (header.toLowerCase().includes("representante") || header.toLowerCase().includes("tutor") || header.toLowerCase().includes("padre")) obj.guardianName = val;
          if (header.toLowerCase().includes("alumno") || header.toLowerCase().includes("estudiante") || header.toLowerCase().includes("nombre")) {
            if (!obj.studentName) obj.studentName = val;
          }
          if (header.toLowerCase().includes("tel") || header.toLowerCase().includes("cel") || header.toLowerCase().includes("phone")) obj.phone = val;
          if (header.toLowerCase().includes("mail")) obj.email = val;
          if (header.toLowerCase().includes("grado") || header.toLowerCase().includes("curso")) obj.gradeInterest = val;
          if (header.toLowerCase().includes("fuente") || header.toLowerCase().includes("source")) obj.source = val;
        });
        return obj;
      });

      if (data.length === 0) {
        throw new Error("No se encontraron datos válidos en el archivo.");
      }

      const result = await importLeadsAction(data);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Error al importar");
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Importar Prospectos</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Sube un archivo CSV con columnas para: Nombre Representante, Nombre Alumno, Teléfono, Email, etc.
        </p>
        
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="hidden" 
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-navy-400)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="mt-2 text-sm font-medium">
                {file ? file.name : "Seleccionar archivo CSV"}
              </span>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button 
            onClick={processFile} 
            className="btn btn-primary" 
            disabled={!file || loading}
          >
            {loading ? "Importando..." : "Importar Datos"}
          </button>
        </div>
      </div>
    </div>
  );
}
