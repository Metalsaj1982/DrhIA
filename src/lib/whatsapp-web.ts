// WhatsApp Web integration using whatsapp-web.js
// This uses QR code scanning instead of the official API

import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode";

// Global state for WhatsApp Web
interface WhatsAppState {
  client: Client | null;
  qrCode: string | null;
  isReady: boolean;
  isLoading: boolean;
  lastError: string | null;
  info: {
    phone: string | null;
    name: string | null;
  };
}

const state: WhatsAppState = {
  client: null,
  qrCode: null,
  isReady: false,
  isLoading: false,
  lastError: null,
  info: {
    phone: null,
    name: null,
  },
};

// Event listeners
const listeners: {
  onQR?: (qr: string) => void;
  onReady?: (info: { phone: string; name: string }) => void;
  onMessage?: (msg: { from: string; body: string; timestamp: number }) => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: string) => void;
} = {};

export function onWhatsAppEvent(
  event: "qr" | "ready" | "message" | "disconnect" | "error",
  callback: (...args: any[]) => void
) {
  if (event === "qr") listeners.onQR = callback;
  if (event === "ready") listeners.onReady = callback;
  if (event === "message") listeners.onMessage = callback;
  if (event === "disconnect") listeners.onDisconnect = callback;
  if (event === "error") listeners.onError = callback;
}

export function getWhatsAppState(): WhatsAppState {
  return { ...state };
}

export async function initializeWhatsApp(): Promise<void> {
  if (state.client) {
    console.log("[WhatsApp Web] Already initialized");
    return;
  }

  if (state.isLoading) {
    console.log("[WhatsApp Web] Already initializing...");
    return;
  }

  state.isLoading = true;
  state.lastError = null;
  console.log("[WhatsApp Web] Initializing...");

  try {
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "/tmp/whatsapp-session",
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      },
    });

    // QR Code generation
    client.on("qr", async (qr: string) => {
      console.log("[WhatsApp Web] QR Code received");
      state.qrCode = qr;

      // Generate data URL for QR image
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, {
          width: 400,
          margin: 2,
          color: {
            dark: "#0F2B4C",
            light: "#FFFFFF",
          },
        });
        state.qrCode = qrDataUrl;
        listeners.onQR?.(qrDataUrl);
      } catch (err) {
        console.error("[WhatsApp Web] QR generation error:", err);
        state.qrCode = qr; // Fallback to raw QR
        listeners.onQR?.(qr);
      }
    });

    // Ready event
    client.on("ready", () => {
      console.log("[WhatsApp Web] Client is ready!");
      state.isReady = true;
      state.isLoading = false;
      state.qrCode = null;

      const info = client.info;
      state.info = {
        phone: info?.wid?.user || null,
        name: info?.pushname || null,
      };

      listeners.onReady?.(state.info as { phone: string; name: string });
    });

    // Authentication failure
    client.on("auth_failure", (msg: string) => {
      console.error("[WhatsApp Web] Authentication failure:", msg);
      state.lastError = msg;
      state.isLoading = false;
      listeners.onError?.(msg);
    });

    // Disconnected
    client.on("disconnected", (reason: string) => {
      console.log("[WhatsApp Web] Disconnected:", reason);
      state.isReady = false;
      state.isLoading = false;
      state.client = null;
      state.qrCode = null;
      listeners.onDisconnect?.(reason);
    });

    // Message received
    client.on("message_create", async (msg) => {
      // Only process incoming messages (not from me)
      if (!msg.fromMe) {
        listeners.onMessage?.({
          from: msg.from,
          body: msg.body,
          timestamp: msg.timestamp,
        });
      }
    });

    state.client = client;
    await client.initialize();
  } catch (error) {
    console.error("[WhatsApp Web] Initialization error:", error);
    state.lastError = String(error);
    state.isLoading = false;
    listeners.onError?.(String(error));
    throw error;
  }
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!state.client || !state.isReady) {
    return {
      success: false,
      error: "WhatsApp no está conectado. Escanea el QR primero.",
    };
  }

  try {
    // Format number (remove non-digits and add country code if needed)
    let formattedNumber = to.replace(/\D/g, "");

    // Ensure number has country code
    if (!formattedNumber.startsWith("5") && formattedNumber.length === 10) {
      // Assuming Ecuador (+593)
      formattedNumber = `593${formattedNumber}`;
    }

    const chatId = `${formattedNumber}@c.us`;
    const result = await state.client.sendMessage(chatId, message);

    return {
      success: true,
      messageId: result.id.id,
    };
  } catch (error) {
    console.error("[WhatsApp Web] Send message error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

export async function disconnectWhatsApp(): Promise<void> {
  if (state.client) {
    await state.client.destroy();
    state.client = null;
    state.isReady = false;
    state.qrCode = null;
    state.isLoading = false;
    console.log("[WhatsApp Web] Disconnected");
  }
}

export async function getWhatsAppChats(): Promise<
  Array<{
    id: string;
    name: string;
    lastMessage?: string;
    timestamp?: number;
    unreadCount?: number;
  }>
> {
  if (!state.client || !state.isReady) {
    return [];
  }

  try {
    const chats = await state.client.getChats();
    return chats.slice(0, 50).map((chat) => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      lastMessage: chat.lastMessage?.body,
      timestamp: chat.lastMessage?.timestamp,
      unreadCount: chat.unreadCount,
    }));
  } catch (error) {
    console.error("[WhatsApp Web] Get chats error:", error);
    return [];
  }
}
