"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTenantSettings } from "@/app/actions";
import type { TenantSettings } from "@/types";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("social");
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  useEffect(() => {
    getTenantSettings().then((res) => {
      if (res) setSettings(res as unknown as TenantSettings);
    });
  }, []);

  const tabs = [
    { id: "social", label: "Planificador Social", icon: "📱" },
    { id: "emails", label: "Campañas Email", icon: "📧" },
    { id: "forms", label: "Formularios & Ads", icon: "📝" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Marketing Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus campañas y captación de leads en un solo lugar.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "social" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 border-dashed border-2 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="font-bold text-lg mb-2">No hay publicaciones agendadas</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Conecta tus redes sociales para empezar a crear y programar contenido educativo.
            </p>
            <button className="btn btn-primary">+ NUEVA PUBLICACIÓN</button>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Cuentas Conectadas</h3>
            <div className="space-y-4">
              {[
                { name: 'Meta (Facebook / Instagram)', icon: 'f', color: '#1877F2', status: settings?.integrations?.some(i => i.provider === 'meta') ? 'Conectado' : 'Pendiente' },
                { name: 'Google Business', icon: 'G', color: '#EA4335', status: settings?.integrations?.some(i => i.provider === 'google') ? 'Conectado' : 'Pendiente' },
              ].map((acc) => (
                <div key={acc.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: acc.color }}>
                      {acc.icon}
                    </div>
                    <span className="text-sm font-medium">{acc.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    acc.status === 'Conectado' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "emails" && (
        <div className="card p-12 text-center flex flex-col items-center justify-center border-2 border-dashed">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Crea tu primera Campaña de Email</h2>
          <p className="text-gray-500 max-w-md mb-8">
            Diseña boletines informativos y anuncios de matrículas para tu base de contactos existentes.
          </p>
          <button className="btn btn-primary">CREAR CAMPAÑA</button>
        </div>
      )}

      {activeTab === "forms" && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Formularios de Captación Activos</h3>
              <Link href="/settings" className="text-xs text-indigo-600 font-semibold hover:underline">Gestionar en Ajustes</Link>
            </div>
            <div className="p-4 rounded-2xl border-2 border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📝</div>
                <div>
                  <p className="font-bold text-sm">Formulario de Admisión V1</p>
                  <p className="text-xs text-gray-500">Recibiendo leads de Inicial, EGB y BGU.</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="btn btn-secondary py-1 px-3 text-xs">VER REGLAS</button>
                 <button className="btn btn-primary py-1 px-3 text-xs">EDITAR</button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Integración Meta Lead Ads</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Webhook de Meta Ads</p>
                <p className="text-xs text-gray-400">Estado: Recibiendo datos</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-700">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
