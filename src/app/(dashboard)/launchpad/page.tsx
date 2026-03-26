"use client";

import { useSearchParams } from 'next/navigation';

export default function LaunchpadPage() {
  const steps = [
    { id: 1, title: 'Conectar Aplicación Móvil', desc: 'Descarga EduCRM App y obtén notificaciones en tiempo real.', icon: '📱', color: '#4F46E5', done: true, href: '/settings' },
    { id: 2, title: 'Vincular Google Business', desc: 'Responde a reseñas y mensajes de Google directamente.', icon: 'G', color: '#EA4335', done: false, href: '/settings' },
    { id: 3, title: 'Vincular Facebook / Instagram', desc: 'Gestiona leads y DMs de Meta en un solo lugar.', icon: 'f', color: '#1877F2', done: true, href: '/settings' },
    { id: 4, title: 'Chat Website', desc: 'Instala el widget de chat en tu sitio institucional.', icon: '💬', color: '#10B981', done: false, href: '/settings' },
    { id: 5, title: 'Agregar Miembros', desc: 'Invita a tu equipo de admisiones y ventas.', icon: '👥', color: '#6366F1', done: false, href: '/settings' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          Bienvenido a EduCRM Launchpad
        </h1>
        <p className="text-gray-500">Completa estos pasos para configurar tu institución educativa y maximizar tus conversiones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div 
            key={step.id} 
            onClick={() => window.location.href = step.href}
            className="card p-5 hover:shadow-md transition-all flex items-start gap-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 group-hover:scale-105 transition-transform" style={{ background: step.color }}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                {step.done ? (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">CONECTADO</span>
                ) : (
                  <span className="btn btn-primary py-1 px-3 text-xs">CONECTAR</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
