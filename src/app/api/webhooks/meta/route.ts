import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET for verifying the webhook subscription
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Normally we would verify this token with our DB settings, but for now we accept any string
  if (mode === "subscribe" && token) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// POST for receiving the lead
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return new NextResponse("Missing tenantId", { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Meta Webhook payload structure
    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadgenId = change.value.leadgen_id;
            const pageId = change.value.page_id;
            const adGroupId = change.value.adgroup_id;
            const formId = change.value.form_id;

            console.log("Received Meta Lead:", { leadgenId, pageId, adGroupId, formId });

            // EN UN ENTORNO REAL:
            // 1. Obtener el Access Token del tenant desde la BD
            // 2. Fetch a la Graph API: `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
            // 3. Parsear los field_data para obtener email, nombre, teléfono.
            
            // SIMULACIÓN para el propósito del sistema:
            // Como no tenemos el Access Token real, vamos a crear un prospecto de prueba 
            // indicando que es proveniente de Meta Ads.
            await prisma.lead.create({
              data: {
                tenantId: tenantId,
                studentName: `Lead Meta #${leadgenId.slice(-4)}`,
                guardianName: "Contacto de FB Ads",
                phone: null,
                whatsapp: null,
                email: null,
                source: "facebook_ads",
                notes: `Leadgen ID: ${leadgenId} | Page: ${pageId} | Form: ${formId}`,
                status: "Nuevo",
              }
            });
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Meta Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
