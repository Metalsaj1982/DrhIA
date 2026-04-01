import { NextResponse } from "next/server";
import { processIncomingLead } from "@/lib/integrations";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return new NextResponse("Missing tenantId", { status: 400 });
  }

  try {
    const body = await request.json();
    console.log("[TikTok Webhook] Payload:", JSON.stringify(body, null, 2));

    // TikTok usually sends leads under lead_id or leadgen_id
    // This is a simplified mapper based on standard TikTok Lead Gen Webhooks
    if (body.event === "leadgen") {
      const leadData = body.data;
      
      await processIncomingLead({
        tenantId,
        guardianName: leadData.full_name || leadData.name || "Contacto TikTok",
        phone: leadData.phone_number || leadData.phone || "",
        email: leadData.email || "",
        source: "TikTok",
        notes: `TikTok Lead ID: ${leadData.lead_id}\nForm: ${leadData.form_id}`,
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[TikTok Webhook] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
