import { NextResponse } from "next/server";
import { getWhatsAppState } from "@/lib/whatsapp-web";

export async function GET() {
  const state = getWhatsAppState();

  return NextResponse.json({
    connected: state.isReady,
    loading: state.isLoading,
    hasQR: !!state.qrCode,
    phone: state.info.phone,
    name: state.info.name,
    error: state.lastError,
  });
}
