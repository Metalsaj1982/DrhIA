import type { Metadata, Viewport } from "next";
import { DM_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "EduCRM — CRM de Admisiones Escolares",
  description:
    "Sistema CRM para gestión de prospectos, seguimiento personalizado y conversión de inscripciones en instituciones educativas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduCRM",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F2B4C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${sourceSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-[var(--color-surface-secondary)]">
        {children}
      </body>
    </html>
  );
}
