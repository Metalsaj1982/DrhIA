"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_ITEMS = [
  { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
  { href: "/leads", label: "Leads", icon: "leads" },
  { href: "/products", label: "Niveles", icon: "products" },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
  { href: "/analytics", label: "Datos", icon: "analytics" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav h-16 border-t px-2 items-center justify-around shrink-0" style={{
      background: 'var(--color-surface-primary)',
      borderColor: 'var(--color-border-light)',
    }}>
      {MOBILE_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const color = active ? "var(--color-accent-500)" : "var(--color-text-tertiary)";
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            {item.icon === "pipeline" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="5" height="14" rx="1.5" stroke={color} strokeWidth="1.5" />
                <rect x="7.5" y="5" width="5" height="10" rx="1.5" stroke={color} strokeWidth="1.5" />
                <rect x="13" y="7" width="5" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
              </svg>
            )}
            {item.icon === "leads" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke={color} strokeWidth="1.5" />
                <path d="M4 17C4 14 6.68 12 10 12C13.32 12 16 14 16 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {item.icon === "inbox" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6L10 11L17 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="4" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" />
              </svg>
            )}
            {item.icon === "products" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="5" width="12" height="10" rx="2" stroke={color} strokeWidth="1.5" />
                <path d="M7 5V3A1 1 0 018 2H12A1 1 0 0113 3V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 9V11M8 10H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {item.icon === "calendar" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke={color} strokeWidth="1.5" />
                <path d="M3 8H17" stroke={color} strokeWidth="1.5" />
                <path d="M7 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {item.icon === "analytics" && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="10" width="3" height="7" rx="1" stroke={color} strokeWidth="1.5" />
                <rect x="8.5" y="6" width="3" height="11" rx="1" stroke={color} strokeWidth="1.5" />
                <rect x="14" y="3" width="3" height="14" rx="1" stroke={color} strokeWidth="1.5" />
              </svg>
            )}
            <span
              className="text-[10px] font-medium"
              style={{ color, fontFamily: 'var(--font-display)' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
