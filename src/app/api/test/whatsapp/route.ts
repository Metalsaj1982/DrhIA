import { NextResponse } from "next/server";
import { sendTextMessage } from "@/lib/whatsapp";

export async function GET() {
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Verificar configuración
  const missing: string[] = [];
  if (!apiToken) missing.push("WHATSAPP_API_TOKEN");
  if (!phoneNumberId) missing.push("WHATSAPP_PHONE_NUMBER_ID");

  if (missing.length > 0) {
    return NextResponse.json(
      {
        configured: false,
        message: "WhatsApp API no está completamente configurada",
        missing,
        instructions: [
          "1. Ve a https://business.facebook.com y crea una cuenta",
          "2. Ve a https://developers.facebook.com/apps y crea una app",
          '3. Agrega el producto "WhatsApp" a tu app',
          "4. En WhatsApp → API Setup:",
          "   - Copia el Phone number ID → WHATSAPP_PHONE_NUMBER_ID",
          "   - Genera un Permanent Access Token → WHATSAPP_API_TOKEN",
          "5. Agrega estas variables a tu archivo .env",
        ],
        note: "Las funciones de WhatsApp funcionarán en modo simulación hasta que configures las credenciales reales.",
      },
      { status: 200 }
    );
  }

  // Probar conexión con la API de Meta
  try {
    const testUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}?access_token=${apiToken}`;
    const response = await fetch(testUrl);

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        {
          configured: true,
          connected: false,
          error: error.error?.message || "Error connecting to WhatsApp API",
          details: error,
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        configured: true,
        connected: true,
        phoneNumberId,
        accountInfo: {
          id: data.id,
          displayPhoneNumber: data.display_phone_number,
          verifiedName: data.verified_name,
          qualityRating: data.quality_rating,
        },
        note: "La conexión está activa. Puedes enviar mensajes reales.",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: String(error),
      },
      { status: 200 }
    );
  }
}

// POST para probar envío de mensaje
export async function POST(request: Request) {
  const body = await request.json();
  const { phone, message } = body;

  if (!phone || !message) {
    return NextResponse.json(
      { error: "Se requiere 'phone' y 'message'" },
      { status: 400 }
    );
  }

  const result = await sendTextMessage({ to: phone, text: message });

  return NextResponse.json(result);
}