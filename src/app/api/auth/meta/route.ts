import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    console.error("[Meta OAuth] Missing tenantId");
    return NextResponse.json({ error: "Falta el tenantId" }, { status: 400 });
  }

  const clientId = process.env.META_CLIENT_ID;
  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/meta/callback`;

  // Validar configuración
  if (!clientId) {
    console.error("[Meta OAuth] META_CLIENT_ID not configured");
    return NextResponse.json(
      { error: "La integración con Meta no está configurada en el servidor. Contacta al administrador." },
      { status: 500 }
    );
  }

  if (!process.env.META_CLIENT_SECRET) {
    console.error("[Meta OAuth] META_CLIENT_SECRET not configured");
    return NextResponse.json(
      { error: "La integración con Meta está incompleta (falta CLIENT_SECRET)." },
      { status: 500 }
    );
  }

  const state = Buffer.from(JSON.stringify({ tenantId })).toString("base64");

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "pages_show_list,leads_retrieval,pages_read_engagement");
  authUrl.searchParams.set("response_type", "code");

  console.log("[Meta OAuth] Starting OAuth flow for tenant:", tenantId);

  return NextResponse.redirect(authUrl.toString());
}
