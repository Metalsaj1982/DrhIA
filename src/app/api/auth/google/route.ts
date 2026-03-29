import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    console.error("[Google OAuth] Missing tenantId");
    return NextResponse.json({ error: "Falta el tenantId" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Validar configuración
  if (!clientId) {
    console.error("[Google OAuth] GOOGLE_CLIENT_ID not configured");
    return NextResponse.json(
      { error: "La integración con Google no está configurada en el servidor." },
      { status: 500 }
    );
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("[Google OAuth] GOOGLE_CLIENT_SECRET not configured");
    return NextResponse.json(
      { error: "La integración con Google está incompleta (falta CLIENT_SECRET)." },
      { status: 500 }
    );
  }

  // Guardar tenantId en el state
  const state = Buffer.from(JSON.stringify({ tenantId })).toString("base64");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/business.manage openid email");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  console.log("[Google OAuth] Starting OAuth flow for tenant:", tenantId);

  return NextResponse.redirect(authUrl.toString());
}
