"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions";

interface TopbarProps {
  userName: string;
  tenantName: string;
}

export function Topbar({ userName, tenantName }: TopbarProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  // Get initials for avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b shrink-0 sticky top-0 z-30 backdrop-blur-md bg-white/80" style={{
      borderColor: 'var(--color-border-light)',
    }}>
      {/* Mobile brand — visible on mobile only */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-navy-700)' }}>
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
            <path d="M6 8C6 6.89 6.89 6 8 6H24C25.1 6 26 6.89 26 8V22C26 23.1 25.1 24 24 24H18L13 28V24H8C6.89 24 6 23.1 6 22V8Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          EduCRM
        </span>
      </div>

      {/* Search bar — desktop */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="var(--color-text-tertiary)" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar prospectos..."
            className="input pl-9 text-sm transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent-400)] focus:border-transparent outline-none"
            style={{ background: 'var(--color-surface-secondary)' }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="btn-ghost p-2 rounded-lg relative">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14 6A5 5 0 004 6C4 11 2 12.5 2 12.5H16S14 11 14 6Z" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.73 15.5A2 2 0 017.27 15.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--color-urgent)' }} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 rounded-lg transition-colors hover:bg-[var(--color-surface-tertiary)]"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{
              background: 'var(--color-navy-700)',
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}>
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {userName}
            </span>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-12 w-48 py-1 rounded-xl z-50 card card-elevated" style={{
                background: 'var(--color-surface-primary)',
              }}>
                <div className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {tenantName}
                </div>
                <hr style={{ borderColor: 'var(--color-border-light)' }} />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface-tertiary)] transition-colors"
                  style={{ color: 'var(--color-urgent)' }}
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
