import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const appUrl = getAppUrl();

  console.log("[Meta OAuth] Callback received:", { code: code ? "present" : "missing", state: state ? "present" : "missing", error });

  // Validar configuración del servidor
  if (!process.env.META_CLIENT_ID || !process.env.META_CLIENT_SECRET) {
    console.error("[Meta OAuth] Server not configured: META_CLIENT_ID or META_CLIENT_SECRET missing");
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=server_not_configured`);
  }

  if (error) {
    console.error("[Meta OAuth] Error from Meta:", error, errorDescription);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=meta_${error}`);
  }

  if (!code || !state) {
    console.error("[Meta OAuth] Missing code or state");
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=missing_params`);
  }

  let tenantId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    tenantId = decoded.tenantId;
    console.log("[Meta OAuth] Tenant ID decoded:", tenantId);
  } catch (e) {
    console.error("[Meta OAuth] Invalid state:", e);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=invalid_state`);
  }

  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/meta/callback`;

  try {
    // Paso 1: Intercambiar code por token Short-Lived
    console.log("[Meta OAuth] Exchanging code for short-lived token...");
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("[Meta OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=token_exchange_failed`);
    }

    const shortLivedToken = tokenData.access_token;
    console.log("[Meta OAuth] Short-lived token obtained");

    // Paso 2: Cambiar por Long-Lived Token (60 días)
    console.log("[Meta OAuth] Exchanging for long-lived token...");
    const longTokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longTokenUrl.searchParams.set("client_id", clientId);
    longTokenUrl.searchParams.set("client_secret", clientSecret);
    longTokenUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longTokenResponse = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenResponse.json();

    if (!longTokenResponse.ok) {
      console.error("[Meta OAuth] Long-lived token exchange failed:", longTokenData);
      // Si falla, usamos el short-lived como fallback
      console.log("[Meta OAuth] Falling back to short-lived token");
    }

    const finalToken = longTokenData.access_token || shortLivedToken;
    const expiresAt = longTokenData.expires_in
      ? new Date(Date.now() + longTokenData.expires_in * 1000)
      : null;

    console.log("[Meta OAuth] Token obtained, expires:", expiresAt || "session");

    // Paso 3: Guardar en base de datos
    await prisma.integration.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: "meta",
        },
      },
      update: {
        accessToken: finalToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        provider: "meta",
        accessToken: finalToken,
        tokenExpiresAt: expiresAt,
      },
    });

    console.log("[Meta OAuth] Integration saved successfully for tenant:", tenantId);

    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&success=meta`);
  } catch (err) {
    console.error("[Meta OAuth] Unexpected error:", err);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=internal_error`);
  }
}
