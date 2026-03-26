"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  tenantName: string;
  userName: string;
}

const NAV_GROUPS = [
  {
    label: "Panel",
    items: [
      { href: "/launchpad", label: "Launchpad", icon: "rocket" },
      { href: "/dashboard", label: "Dashboard", icon: "analytics" },
    ]
  },
  {
    label: "CRM & Ventas",
    items: [
      { href: "/conversations", label: "Conversaciones", icon: "inbox" },
      { href: "/pipeline", label: "Oportunidades", icon: "pipeline" },
      { href: "/leads", label: "Contactos", icon: "leads" },
      { href: "/appointments", label: "Citas", icon: "calendar" },
    ]
  },
  {
    label: "Marketing & Automatización",
    items: [
      { href: "/marketing", label: "Marketing", icon: "marketing" },
      { href: "/automation", label: "Automatización", icon: "automation" },
      { href: "/sites", label: "Sitios / Formularios", icon: "sites" },
    ]
  },
  {
    label: "Comercial",
    items: [
      { href: "/products", label: "Productos", icon: "products" },
      { href: "/enrollments", label: "Inscripciones", icon: "enrollment" },
    ]
  },
  {
    label: "Configuración",
    items: [
      { href: "/settings", label: "Ajustes", icon: "settings" },
    ]
  }
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "var(--color-accent-500)" : "var(--color-text-tertiary)";

  const icons: Record<string, React.ReactNode> = {
    marketing: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    automation: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    sites: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    rocket: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.5-1 1-4c1.5 0 3 0 3 0" />
        <path d="M15 9v5s1-.5 4-1c0-1.5 0-3 0-3" />
      </svg>
    ),
    pipeline: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
        <path d="M21 7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2" />
        <path d="M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2" />
      </svg>
    ),
    leads: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    inbox: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    products: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12V9" />
        <path d="M10 12V9" />
        <path d="M14 12V9" />
        <path d="M20 12V9" />
        <path d="M2 7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
        <path d="M9 18h6" />
      </svg>
    ),
    calendar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    enrollment: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    analytics: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}

export function Sidebar({ tenantName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar-desktop w-56 h-screen flex flex-col border-r" style={{
      background: 'var(--color-surface-primary)',
      borderColor: 'var(--color-border-light)',
    }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'var(--color-navy-700)',
          }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M6 8C6 6.89 6.89 6 8 6H24C25.1 6 26 6.89 26 8V22C26 23.1 25.1 24 24 24H18L13 28V24H8C6.89 24 6 23.1 6 22V8Z" fill="white" fillOpacity="0.9"/>
              <circle cx="12" cy="15" r="1.5" fill="#2563EB"/>
              <circle cx="16" cy="15" r="1.5" fill="#2563EB"/>
              <circle cx="20" cy="15" r="1.5" fill="#2563EB"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
              EduCRM
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {tenantName}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/pipeline?new=true"
          className="btn btn-primary w-full justify-center transition-all duration-200 hover:shadow-md"
          style={{ fontFamily: 'var(--font-display)', background: 'var(--color-accent-600)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="ml-2 font-semibold">Nuevo Prospecto</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              {group.label}
            </h4>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: active ? 'var(--color-accent-50)' : 'transparent',
                    color: active ? 'var(--color-accent-600)' : 'var(--color-text-secondary)',
                  }}
                >
                  <NavIcon name={item.icon} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom context area could go here */}
      <div className="px-4 pb-4"></div>
    </aside>
  );
}
