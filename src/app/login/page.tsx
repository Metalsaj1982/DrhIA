"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAction(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/pipeline");
        router.refresh();
      }
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, var(--color-navy-800) 0%, var(--color-navy-700) 40%, var(--color-accent-700) 100%)',
    }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--color-accent-400)' }} />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-8" style={{ background: 'var(--color-accent-300)' }} />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-white opacity-20" />
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white opacity-15" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V22C26 23.1046 25.1046 24 24 24H18L13 28V24H8C6.89543 24 6 23.1046 6 22V8Z" fill="white" fillOpacity="0.9"/>
              <circle cx="12" cy="15" r="1.5" fill="#2563EB"/>
              <circle cx="16" cy="15" r="1.5" fill="#2563EB"/>
              <circle cx="20" cy="15" r="1.5" fill="#2563EB"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            EduCRM
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            CRM de Admisiones Escolares
          </p>
        </div>

        {/* Login Card */}
        <div className="card-elevated p-8 rounded-2xl" style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
        }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@colegio.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{
                background: '#FEE2E2',
                color: '#991B1B',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg mt-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center text-xs space-y-2" style={{ borderTop: '1px solid var(--color-border-light)', color: 'var(--color-text-tertiary)' }}>
            <p>Demo: admin@colegio.com / demo1234</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              ¿No tienes cuenta?{" "}
              <a href="/register" className="font-semibold hover:underline" style={{ color: 'var(--color-accent-600)' }}>
                Registra tu institución
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
