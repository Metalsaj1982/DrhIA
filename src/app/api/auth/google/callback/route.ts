import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = getAppUrl();

  console.log("[Google OAuth] Callback received:", { code: code ? "present" : "missing", state: state ? "present" : "missing", error });

  // Validar configuración del servidor
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("[Google OAuth] Server not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=server_not_configured`);
  }

  if (error) {
    console.error("[Google OAuth] Error from Google:", error);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=google_${error}`);
  }

  if (!code || !state) {
    console.error("[Google OAuth] Missing code or state");
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=missing_params`);
  }

  let tenantId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
    tenantId = decoded.tenantId;
    console.log("[Google OAuth] Tenant ID decoded:", tenantId);
  } catch (e) {
    console.error("[Google OAuth] Invalid state:", e);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=invalid_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    console.log("[Google OAuth] Exchanging code for tokens...");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("[Google OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=token_exchange_failed`);
    }

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    console.log("[Google OAuth] Tokens obtained, expires:", expiresAt || "session");

    await prisma.integration.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: "google",
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || undefined,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        provider: "google",
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
      },
    });

    console.log("[Google OAuth] Integration saved successfully for tenant:", tenantId);

    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&success=google`);
  } catch (err) {
    console.error("[Google OAuth] Unexpected error:", err);
    return NextResponse.redirect(`${appUrl}/settings?tab=integrations&error=internal_error`);
  }
}
