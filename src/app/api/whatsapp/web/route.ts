import { NextResponse } from "next/server";
import {
  initializeWhatsApp,
  getWhatsAppState,
  disconnectWhatsApp,
  sendWhatsAppMessage,
  getWhatsAppChats,
} from "@/lib/whatsapp-web";

// GET - Get WhatsApp status
export async function GET() {
  const state = getWhatsAppState();

  return NextResponse.json({
    isReady: state.isReady,
    isLoading: state.isLoading,
    qrCode: state.qrCode,
    lastError: state.lastError,
    info: state.info,
  });
}

// POST - Actions: connect, disconnect, send
export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "connect": {
      try {
        const currentState = getWhatsAppState();

        if (currentState.isReady) {
          return NextResponse.json({
            success: true,
            message: "WhatsApp ya está conectado",
            isReady: true,
            info: currentState.info,
          });
        }

        if (currentState.isLoading) {
          return NextResponse.json({
            success: true,
            message: "Inicializando... esperando QR",
            isLoading: true,
            qrCode: currentState.qrCode,
          });
        }

        // Start initialization
        initializeWhatsApp().catch((err) => {
          console.error("[WhatsApp API] Init error:", err);
        });

        // Wait a bit for QR generation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const newState = getWhatsAppState();
        return NextResponse.json({
          success: true,
          message: newState.qrCode ? "Escanea el código QR" : "Inicializando...",
          qrCode: newState.qrCode,
          isLoading: newState.isLoading,
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: String(error),
          },
          { status: 500 }
        );
      }
    }

    case "disconnect": {
      try {
        await disconnectWhatsApp();
        return NextResponse.json({
          success: true,
          message: "WhatsApp desconectado",
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: String(error),
          },
          { status: 500 }
        );
      }
    }

    case "send": {
      const { phone, message } = body;

      if (!phone || !message) {
        return NextResponse.json(
          {
            success: false,
            error: "Se requiere 'phone' y 'message'",
          },
          { status: 400 }
        );
      }

      const result = await sendWhatsAppMessage(phone, message);
      return NextResponse.json(result);
    }

    case "chats": {
      const chats = await getWhatsAppChats();
      return NextResponse.json({ success: true, chats });
    }

    default:
      return NextResponse.json(
        { success: false, error: "Acción no válida" },
        { status: 400 }
      );
  }
}
