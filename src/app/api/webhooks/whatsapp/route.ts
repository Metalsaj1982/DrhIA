/**
 * WhatsApp Business API — Webhook
 *
 * GET  → Verificación del webhook por Meta (handshake inicial)
 * POST → Recibe mensajes entrantes y responde automáticamente con IA
 *
 * Variables de entorno requeridas:
 *   WHATSAPP_WEBHOOK_VERIFY_TOKEN  — string secreto que ingresás en el panel de Meta
 *   WHATSAPP_API_TOKEN             — token de acceso del sistema
 *   WHATSAPP_PHONE_NUMBER_ID       — ID del número en Meta
 *   GEMINI_API_KEY                 — clave de Google AI Studio (gratis)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp";

// ─── Gemini AI response generator ───────────────────────────────────────────

async function generateAIReply(
  incomingText: string,
  contactName: string,
  institutionName: string,
  leadContext: {
    status?: string;
    gradeInterest?: string;
    productName?: string;
    productPrice?: number;
  }
): Promise<{ reply: string; suggestedStage: string | null }> {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `Eres un asistente de admisiones de "${institutionName}". 
Tu función es responder preguntas de padres de familia interesados en inscribir a sus hijos y clasificar su intención.
Sé amable, profesional y conciso (máximo 3 oraciones).
Información del prospecto:
- Nombre: ${contactName}
- Etapa en proceso: ${leadContext.status || "Nuevo contacto"}
- Grado de interés: ${leadContext.gradeInterest || "No especificado"}
- Programa: ${leadContext.productName || "Pendiente de definir"}
- Mensualidad: ${leadContext.productPrice ? `$${leadContext.productPrice}` : "Por consultar"}

Responde siempre en español. No compartas precios exactos a menos que el sistema los tenga.
Si no sabes algo específico, dí que un asesor les contactará pronto.

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "reply": "Tu mensaje de respuesta al prospecto",
  "suggestedStage": "La nueva etapa sugerida"
}

Reglas para "suggestedStage":
- Etapas válidas: "Nuevo", "Contactado", "Interesado", "Visita Programada", "Entrevista", "Pre-inscripción", "Inscrito".
- Si el usuario acaba de escribir por primera vez, pero pide información de precios o detalles: "Interesado".
- Si el usuario dice que quiere agendar o programar una visita/reunión: "Visita Programada".
- Si el usuario ya está listo para inscribirse o enviar documentos: "Pre-inscripción".
- Si es sólo una pregunta suelta y no avanza la intención, devuelve null o la misma etapa actual.`;

  // Si no hay API key, usa respuesta automática básica
  if (!apiKey) {
    return {
      reply: generateFallbackReply(incomingText, contactName, institutionName),
      suggestedStage: null
    };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: incomingText }], role: "user" }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            maxOutputTokens: 256,
          },
        }),
      }
    );

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(rawText);
    return {
      reply: parsed.reply || generateFallbackReply(incomingText, contactName, institutionName),
      suggestedStage: parsed.suggestedStage || null
    };
  } catch (err) {
    console.error("[WhatsApp AI] Error calling Gemini:", err);
    return {
      reply: generateFallbackReply(incomingText, contactName, institutionName),
      suggestedStage: null
    };
  }
}

// Respuesta automática sin IA (fallback si no hay GEMINI_API_KEY)
function generateFallbackReply(
  text: string,
  name: string,
  institution: string
): string {
  const lower = text.toLowerCase();
  const firstName = name.split(" ")[0];

  if (lower.includes("precio") || lower.includes("costo") || lower.includes("mensualidad") || lower.includes("cuánto")) {
    return `¡Hola ${firstName}! Nuestros valores varían según el nivel educativo. Un asesor de ${institution} le contactará en breve con toda la información. 😊`;
  }
  if (lower.includes("horario") || lower.includes("visita") || lower.includes("ver")) {
    return `¡Con gusto ${firstName}! Podemos agendar una visita de lunes a viernes. ¿Qué día y horario le queda mejor?`;
  }
  if (lower.includes("vacante") || lower.includes("cupo") || lower.includes("lugar")) {
    return `Hola ${firstName}, consultaremos la disponibilidad de cupos. Un asesor de ${institution} le responderá pronto.`;
  }
  if (lower.includes("gracias") || lower.includes("ok") || lower.includes("listo") || lower.includes("perfecto")) {
    return `¡Con mucho gusto ${firstName}! Estamos aquí para lo que necesite. 😊`;
  }
  return `¡Hola ${firstName}! Recibimos su mensaje y un asesor de ${institution} le atenderá en breve. ¡Gracias por su interés!`;
}

// ─── Webhook Meta verification — GET ────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "educrm-webhook-secret-2025";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] ✅ Webhook verificado por Meta");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] ❌ Token de verificación incorrecto");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─── Incoming message handler — POST ────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Meta envía el payload con esta estructura
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Ignorar notificaciones de estado (delivered, read, etc.)
    if (value?.statuses) {
      return NextResponse.json({ status: "ok" });
    }

    const messages = value?.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ok" });
    }

    const msg = messages[0];
    if (msg.type !== "text") {
      // Por ahora solo procesamos mensajes de texto
      return NextResponse.json({ status: "ok" });
    }

    const incomingText: string = msg.text?.body || "";
    const fromPhone: string = msg.from; // Número del remitente (ej. "593999999999")
    const whatsappMsgId: string = msg.id;

    console.log(`[WhatsApp] ← Mensaje de ${fromPhone}: "${incomingText}"`);

    // ─── 1. Buscar el lead por número de WhatsApp ──────────────────────────
    // Normalización: el número viene sin + ni espacios
    const lead = await prisma.lead.findFirst({
      where: {
        whatsapp: { contains: fromPhone.slice(-9) }, // últimos 9 dígitos por tolerancia
      },
      include: {
        tenant: true,
        product: true,
      },
    });

    const institutionName = lead?.tenant?.name || "nuestra institución";
    const contactName = lead?.guardianName || "Prospecto";
    const leadContext = {
      status: lead?.status,
      gradeInterest: lead?.gradeInterest || undefined,
      productName: lead?.product?.name,
      productPrice: lead?.product?.price ?? undefined,
    };

    // ─── 2. Guardar mensaje entrante en la BD ──────────────────────────────
    if (lead) {
      await prisma.leadMessage.create({
        data: {
          tenantId: lead.tenantId,
          leadId: lead.id,
          content: incomingText,
          direction: "inbound",
          channel: "whatsapp",
        },
      });
    }

    // ─── 3. Generar respuesta con IA y analizar intención ───────────────
    const aiResult = await generateAIReply(
      incomingText,
      contactName,
      institutionName,
      leadContext
    );

    // ─── 4. Enviar respuesta vía WhatsApp API ──────────────────────────────
    const sendResult = await sendTextMessage({ to: fromPhone, text: aiResult.reply });

    // ─── 5. Guardar respuesta en la BD y actualizar pipeline ─────────────
    if (lead && sendResult.success) {
      await prisma.leadMessage.create({
        data: {
          tenantId: lead.tenantId,
          leadId: lead.id,
          content: aiResult.reply,
          direction: "outbound",
          channel: "whatsapp",
        },
      });

      // Si la IA detectó un avance en la intención, actualiza la etapa del lead automáticamente
      const validStages = ["Nuevo", "Contactado", "Interesado", "Visita Programada", "Entrevista", "Pre-inscripción", "Inscrito"];
      if (
        aiResult.suggestedStage && 
        validStages.includes(aiResult.suggestedStage) && 
        lead.status !== aiResult.suggestedStage
      ) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: aiResult.suggestedStage }
        });
        console.log(`[WhatsApp AI] → Lead ${lead.id} movido automáticamente a etapa: ${aiResult.suggestedStage}`);
      }
    }

    console.log(`[WhatsApp] → Respuesta enviada a ${fromPhone}: "${aiResult.reply}"`);
    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    // Meta requiere siempre un 200 o reintentará el envío
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
