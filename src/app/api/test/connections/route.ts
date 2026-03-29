import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/utils";

export async function GET() {
  const appUrl = getAppUrl();
  const isVercel = !!process.env.VERCEL_URL;

  const connections = {
    whatsapp: {
      name: "WhatsApp Business API",
      configured: !!(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      missing: [] as string[],
      testUrl: `${appUrl}/api/test/whatsapp`,
    },
    openai: {
      name: "OpenAI (GPT-4o-mini)",
      configured: !!process.env.OPENAI_API_KEY,
      missing: [] as string[],
      testUrl: `${appUrl}/api/test/ai`,
    },
    meta: {
      name: "Meta / Facebook OAuth",
      configured: !!(process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET),
      missing: [] as string[],
      testUrl: `${appUrl}/api/test/meta?tenantId=TU_TENANT_ID`,
    },
    google: {
      name: "Google OAuth",
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      missing: [] as string[],
    },
    database: {
      name: "Base de Datos (Supabase)",
      configured: !!process.env.DATABASE_URL,
      missing: [] as string[],
    },
  };

  // Identificar variables faltantes
  if (!process.env.WHATSAPP_API_TOKEN) connections.whatsapp.missing.push("WHATSAPP_API_TOKEN");
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) connections.whatsapp.missing.push("WHATSAPP_PHONE_NUMBER_ID");
  if (!process.env.OPENAI_API_KEY) connections.openai.missing.push("OPENAI_API_KEY");
  if (!process.env.META_CLIENT_ID) connections.meta.missing.push("META_CLIENT_ID");
  if (!process.env.META_CLIENT_SECRET) connections.meta.missing.push("META_CLIENT_SECRET");
  if (!process.env.GOOGLE_CLIENT_ID) connections.google.missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) connections.google.missing.push("GOOGLE_CLIENT_SECRET");
  if (!process.env.DATABASE_URL) connections.database.missing.push("DATABASE_URL");

  const allConfigured = Object.values(connections).every((c) => c.configured);
  const configuredCount = Object.values(connections).filter((c) => c.configured).length;
  const totalCount = Object.keys(connections).length;

  return NextResponse.json({
    environment: {
      isProduction: isVercel,
      appUrl,
      nodeEnv: process.env.NODE_ENV,
    },
    summary: {
      allConfigured,
      configured: configuredCount,
      total: totalCount,
      status: allConfigured ? "✅ Todas las conexiones configuradas" : `⚠️ ${configuredCount}/${totalCount} conexiones configuradas`,
    },
    connections,
    productionUrls: isVercel ? {
      metaWebhook: `${appUrl}/api/webhooks/meta?tenantId=TU_TENANT_ID`,
      metaCallback: `${appUrl}/api/auth/meta/callback`,
      googleCallback: `${appUrl}/api/auth/google/callback`,
    } : null,
    nextSteps: allConfigured
      ? ["🎉 Todas las conexiones están configuradas. Prueba los endpoints para verificar que funcionan."]
      : [
          isVercel
            ? "1. Configura las variables faltantes en Vercel Dashboard → Settings → Environment Variables"
            : "1. Completa las variables faltantes en el archivo .env.local",
          "2. Reinicia el servidor (npm run dev localmente o redeploy en Vercel)",
          `3. Verifica: ${appUrl}/api/test/connections`,
        ],
  });
}
