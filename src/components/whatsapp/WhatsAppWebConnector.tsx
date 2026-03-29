"use client";

import { useState, useEffect } from "react";

interface WhatsAppState {
  isReady: boolean;
  isLoading: boolean;
  qrCode: string | null;
  lastError: string | null;
  info: {
    phone: string | null;
    name: string | null;
  };
}

export default function WhatsAppWebConnector() {
  const [state, setState] = useState<WhatsAppState>({
    isReady: false,
    isLoading: false,
    qrCode: null,
    lastError: null,
    info: { phone: null, name: null },
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");

  // Check status every 3 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/web");
        if (res.ok) {
          const data = await res.json();
          setState(data);

          // Auto-stop connecting if ready
          if (data.isReady) {
            setIsConnecting(false);
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/whatsapp/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      });
      const data = await res.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          qrCode: data.qrCode,
          isLoading: data.isLoading,
        }));
      }
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/whatsapp/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConnecting(false);
        // State will update via polling
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) return;

    try {
      const res = await fetch("/api/whatsapp/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: testPhone,
          message: testMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Mensaje enviado!");
        setTestMessage("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  if (state.isReady) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-green-800">
            WhatsApp Conectado
          </h3>
        </div>

        <div className="mb-4 text-green-700">
          <p><strong>Nombre:</strong> {state.info.name || "N/A"}</p>
          <p><strong>Teléfono:</strong> {state.info.phone || "N/A"}</p>
        </div>

        <div className="border-t border-green-200 pt-4 mb-4">
          <h4 className="font-medium text-green-800 mb-2">
            Enviar mensaje de prueba
          </h4>
          <div className="space-y-2">
            <input
              type="tel"
              placeholder="Número de teléfono (ej: 0991234567)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Mensaje..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
            />
            <button
              onClick={handleSendTest}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Enviar Mensaje
            </button>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Desconectar WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Conectar WhatsApp</h3>

      {state.lastError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {state.lastError}
        </div>
      )}

      {state.qrCode ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Escanea este código QR con tu WhatsApp:
          </p>
          <div className="inline-block p-4 bg-white border rounded-lg">
            <img
              src={state.qrCode}
              alt="QR Code para WhatsApp"
              className="w-64 h-64"
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Abre WhatsApp en tu teléfono → Configuración → WhatsApp Web → Escanear código
          </p>
          <p className="mt-2 text-sm text-gray-400">Esperando conexión...⏳</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <p className="text-gray-600 mb-4">
            Conecta WhatsApp Web para enviar mensajes desde el CRM
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isConnecting ? "Conectando..." : "Conectar WhatsApp"}
          </button>
        </div>
      )}
    </div>
  );
}
