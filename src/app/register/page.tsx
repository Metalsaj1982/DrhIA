"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerTenantAction } from "../actions";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function RegisterPage() {
  const router = useRouter();
  const [institutionName, setInstitutionName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const slug = generateSlug(institutionName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!slug) {
      setError("El nombre de la institución no es válido.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerTenantAction({
        institutionName,
        slug,
        adminName,
        email,
        password,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error al registrar. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, var(--color-navy-800) 0%, var(--color-navy-700) 40%, var(--color-accent-700) 100%)',
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--color-accent-400)' }} />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-8" style={{ background: 'var(--color-accent-300)' }} />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
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
            Registra tu Institución
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Crea tu cuenta de EduCRM en 30 segundos
          </p>
        </div>

        <div className="card-elevated p-8 rounded-2xl" style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
        }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Nombre de la Institución
              </label>
              <input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="input"
                placeholder="Ej: Colegio San Rafael"
                required
              />
              {slug && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Tu URL será: <strong>/apply/{slug}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Tu Nombre (Administrador)
              </label>
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="input"
                placeholder="Ej: María García"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@tucolegio.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Mín. 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Confirmar
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Repetir contraseña"
                  required
                  minLength={6}
                />
              </div>
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
                  Creando tu cuenta...
                </>
              ) : (
                "Crear Mi Institución"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center text-sm" style={{ borderTop: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary)' }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-accent-600)' }}>
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
