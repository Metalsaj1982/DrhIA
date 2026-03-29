import { type ClassValue, clsx } from "clsx";

// Lightweight cn utility — avoids needing tailwind-merge for simple cases
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(d);
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}

// Urgency level for pipeline cards based on next_action_at
export function getUrgencyLevel(
  nextActionAt: Date | string | null | undefined
): "critical" | "warning" | "normal" | "none" {
  if (!nextActionAt) return "none";
  const d = typeof nextActionAt === "string" ? new Date(nextActionAt) : nextActionAt;
  const hoursUntil = (d.getTime() - Date.now()) / 3600000;

  if (hoursUntil < 0) return "critical";
  if (hoursUntil < 24) return "warning";
  return "normal";
}

// Lead source labels in Spanish
export const SOURCE_LABELS: Record<string, string> = {
  facebook_ads: "Facebook Ads",
  instagram_ads: "Instagram Ads",
  website: "Formulario Web",
  whatsapp: "WhatsApp",
  referral: "Referido",
  manual: "Entrada Manual",
};

// Default pipeline stages
export const DEFAULT_STAGES = [
  "Nuevo",
  "Contactado",
  "Interesado",
  "Visita Programada",
  "Entrevista",
  "Pre-inscripción",
  "Inscrito",
];

// Stage colors for pipeline dots
export const STAGE_COLORS: Record<string, string> = {
  Nuevo: "#3B82F6",
  Contactado: "#F59E0B",
  Interesado: "#8B5CF6",
  "Visita Programada": "#06B6D4",
  Entrevista: "#EC4899",
  "Pre-inscripción": "#10B981",
  Inscrito: "#22C55E",
};

// Personalize template content by replacing variables with lead data
export function personalizeTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

// Get the app URL for production (Vercel) or development
export function getAppUrl(): string {
  // Vercel production URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Vercel project URL (custom domain)
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Fallback to env variable or localhost
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
