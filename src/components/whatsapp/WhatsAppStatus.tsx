"use client";

import { useState, useEffect } from "react";

interface WhatsAppStatusProps {
  onClickConnect?: () => void;
}

export default function WhatsAppStatus({ onClickConnect }: WhatsAppStatusProps) {
  const [status, setStatus] = useState<{
    connected: boolean;
    loading: boolean;
    phone: string | null;
    name: string | null;
  } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        Cargando...
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>WhatsApp conectado: {status.name || status.phone || "✓"}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClickConnect}
      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
    >
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <span>{status.loading ? "Conectando..." : "WhatsApp desconectado - Haz clic para conectar"}</span>
    </button>
  );
}
