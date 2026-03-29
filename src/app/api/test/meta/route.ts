import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const appUrl = getAppUrl();

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;

  // Verificar configuración del servidor
  const missing: string[] = [];
  if (!clientId) missing.push("META_CLIENT_ID");
  if (!clientSecret) missing.push("META_CLIENT_SECRET");

  if (missing.length > 0) {
    return NextResponse.json(
      {
        configured: false,
        message: "Meta OAuth no está completamente configurado",
        missing,
        instructions: [
          "1. Ve a https://developers.facebook.com/apps",
          '2. Crea una app tipo "Business" o "None"',
          "3. En Configuración → Básica:",
          "   - Copia el App ID → META_CLIENT_ID",
          "   - Copia el App Secret → META_CLIENT_SECRET",
          "4. Agrega producto 'Webhooks' y 'Marketing API'",
          "5. Configura el webhook con URL:",
          `   ${appUrl}/api/webhooks/meta?tenantId=TU_TENANT_ID`,
          "6. Agrega estas URLs de redirección OAuth válidas:",
          `   - ${appUrl}/api/auth/meta/callback`,
          "7. Token de verificación:",
          `   ${process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "educrm-webhook-secret-2025"}`,
        ],
      },
      { status: 200 }
    );
  }

  let integration = null;
  if (tenantId) {
    integration = await prisma.integration.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider: "meta",
        },
      },
    });
  }

  // Probar conexión si hay token
  let connectionTest = null;
  if (integration?.accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${integration.accessToken}`
      );
      connectionTest = await response.json();
    } catch (e) {
      connectionTest = { error: String(e) };
    }
  }

  return NextResponse.json({
    configured: true,
    oauth: {
      clientId: clientId ? `${clientId.slice(0, 8)}...` : null,
      clientSecret: clientSecret ? "configured" : null,
      authUrl: `${appUrl}/api/auth/meta?tenantId=TU_TENANT_ID`,
      callbackUrl: `${appUrl}/api/auth/meta/callback`,
      scopes: "pages_show_list,leads_retrieval,pages_read_engagement",
    },
    webhook: {
      url: `${appUrl}/api/webhooks/meta?tenantId=TU_TENANT_ID`,
      verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "educrm-webhook-secret-2025",
    },
    integration: integration
      ? {
          connected: true,
          providerId: integration.providerId,
          tokenExpiresAt: integration.tokenExpiresAt,
          connectedAt: integration.connectedAt,
          apiTest: connectionTest,
        }
      : {
          connected: false,
          message: "No hay integración activa para este tenant",
          setupUrl: `${appUrl}/api/auth/meta?tenantId=${tenantId || "TU_TENANT_ID"}`,
        },
  });
}