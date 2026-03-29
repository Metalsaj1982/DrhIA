import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET for verifying the webhook subscription
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "educrm-webhook-secret-2025";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Meta Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }
  console.error("[Meta Webhook] Verification failed - token mismatch");
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
    console.log("[Meta Webhook] Received payload:", JSON.stringify(body, null, 2));

    // Meta Webhook payload structure for leads
    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadgenId = change.value.leadgen_id;
            const pageId = change.value.page_id;
            const adGroupId = change.value.adgroup_id;
            const formId = change.value.form_id;
            const createdTime = change.value.created_time;

            console.log("[Meta Webhook] New lead received:", { leadgenId, pageId, formId, tenantId });

            // Buscar el token de acceso de Meta para este tenant
            const integration = await prisma.integration.findUnique({
              where: {
                tenantId_provider: {
                  tenantId,
                  provider: "meta",
                },
              },
            });

            if (!integration?.accessToken) {
              console.warn("[Meta Webhook] No Meta integration found for tenant:", tenantId);
              // Crear lead básico si no hay integración configurada
              await prisma.lead.create({
                data: {
                  tenantId,
                  studentName: `Lead Meta #${leadgenId.slice(-4)}`,
                  guardianName: "Contacto de FB Ads (configurar integración)",
                  source: "facebook_ads",
                  notes: `Leadgen ID: ${leadgenId} | Page: ${pageId} | Form: ${formId}\n⚠️ Configura la integración de Meta para obtener datos completos`,
                  status: "Nuevo",
                },
              });
              continue;
            }

            // Obtener datos completos del lead desde la Graph API
            try {
              const leadData = await fetchMetaLead(leadgenId, integration.accessToken);

              if (leadData) {
                const parsedData = parseMetaLeadFields(leadData.field_data);

                await prisma.lead.create({
                  data: {
                    tenantId,
                    studentName: parsedData.studentName || `Lead Meta #${leadgenId.slice(-4)}`,
                    guardianName: parsedData.guardianName || "Contacto de Facebook",
                    phone: parsedData.phone,
                    whatsapp: parsedData.whatsapp,
                    email: parsedData.email,
                    gradeInterest: parsedData.gradeInterest,
                    source: "facebook_ads",
                    notes: `Leadgen ID: ${leadgenId}\nPage ID: ${pageId}\nForm ID: ${formId}\nAd Group: ${adGroupId || "N/A"}\n\nDatos completos recibidos desde Meta Ads`,
                    status: "Nuevo",
                  },
                });

                console.log("[Meta Webhook] Lead created with full data:", parsedData);
              }
            } catch (error) {
              console.error("[Meta Webhook] Error fetching lead data:", error);
              // Crear lead básico como fallback
              await prisma.lead.create({
                data: {
                  tenantId,
                  studentName: `Lead Meta #${leadgenId.slice(-4)}`,
                  guardianName: "Contacto de FB Ads (error al obtener datos)",
                  source: "facebook_ads",
                  notes: `Leadgen ID: ${leadgenId} | Error: ${error}`,
                  status: "Nuevo",
                },
              });
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("[Meta Webhook] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fetch lead data from Meta Graph API
async function fetchMetaLead(leadgenId: string, accessToken: string) {
  const url = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meta API error: ${error}`);
  }

  return await response.json();
}

// Parse Meta lead form fields into structured data
interface ParsedLeadData {
  studentName?: string;
  guardianName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  gradeInterest?: string;
}

function parseMetaLeadFields(fieldData: Array<{ name: string; values: string[] }>): ParsedLeadData {
  const data: ParsedLeadData = {};

  for (const field of fieldData) {
    const value = field.values[0];
    if (!value) continue;

    const fieldName = field.name.toLowerCase();

    // Map common field names
    if (fieldName.includes("nombre") || fieldName.includes("name")) {
      if (fieldName.includes("estudiante") || fieldName.includes("student") || fieldName.includes("hijo") || fieldName.includes("alumno")) {
        data.studentName = value;
      } else if (fieldName.includes("padre") || fieldName.includes("madre") || fieldName.includes("tutor") || fieldName.includes("apoderado") || fieldName.includes("guardian")) {
        data.guardianName = value;
      } else {
        // Si no hay contexto, asumimos que es el nombre del estudiante
        data.studentName = value;
      }
    }

    if (fieldName.includes("telefono") || fieldName.includes("phone") || fieldName.includes("celular") || fieldName.includes("whatsapp")) {
      const cleanPhone = value.replace(/\D/g, "");
      data.phone = cleanPhone;
      // Guardar también como WhatsApp si tiene formato válido
      if (cleanPhone.length >= 10) {
        data.whatsapp = cleanPhone.startsWith("5") ? cleanPhone : `593${cleanPhone}`;
      }
    }

    if (fieldName.includes("email") || fieldName.includes("correo")) {
      data.email = value;
    }

    if (fieldName.includes("grado") || fieldName.includes("curso") || fieldName.includes("nivel") || fieldName.includes("grade") || fieldName.includes("año")) {
      data.gradeInterest = value;
    }
  }

  // Si solo tenemos un nombre, asumimos que es el estudiante
  if (!data.studentName && !data.guardianName) {
    data.guardianName = "Contacto de Facebook";
  }

  return data;
}
