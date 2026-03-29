// WhatsApp integration - supports both Official API and WhatsApp Web
import { sendWhatsAppMessage } from "./whatsapp-web";

interface WhatsAppTextMessage {
  to: string;
  text: string;
}

interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }>;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Official WhatsApp Business API credentials
const API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0";
const API_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

// Check which mode to use: API or Web
const useOfficialAPI = API_TOKEN && PHONE_NUMBER_ID;

export async function sendTextMessage(
  msg: WhatsAppTextMessage
): Promise<WhatsAppResponse> {
  // Try official API first if configured
  if (useOfficialAPI) {
    return sendViaOfficialAPI(msg);
  }

  // Fallback to WhatsApp Web
  return sendWhatsAppMessage(msg.to, msg.text);
}

async function sendViaOfficialAPI(msg: WhatsAppTextMessage): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(
      `${API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.to,
          type: "text",
          text: { body: msg.text },
        }),
      }
    );

    const data = await response.json();
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, error: JSON.stringify(data.error || data) };
  } catch (error) {
    console.error("[WhatsApp API] Error:", error);
    // Fallback to WhatsApp Web on API error
    return sendWhatsAppMessage(msg.to, msg.text);
  }
}

export async function sendTemplateMessage(
  msg: WhatsAppTemplateMessage
): Promise<WhatsAppResponse> {
  if (!useOfficialAPI) {
    return {
      success: false,
      error: "Las plantillas solo funcionan con la API oficial de WhatsApp Business. Configura WHATSAPP_API_TOKEN y WHATSAPP_PHONE_NUMBER_ID, o envía mensajes de texto directos usando WhatsApp Web.",
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.to,
          type: "template",
          template: {
            name: msg.templateName,
            language: { code: msg.languageCode || "es" },
            components: msg.components || [],
          },
        }),
      }
    );

    const data = await response.json();
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, error: JSON.stringify(data.error || data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send personalized messages one-by-one (not broadcast)
export async function sendBulkPersonalized(
  messages: WhatsAppTextMessage[]
): Promise<WhatsAppResponse[]> {
  const results: WhatsAppResponse[] = [];

  for (const msg of messages) {
    const result = await sendTextMessage(msg);
    results.push(result);
    // Small delay between messages to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

// Get current WhatsApp mode
export function getWhatsAppMode(): "api" | "web" | "none" {
  if (useOfficialAPI) return "api";
  // Check if WhatsApp Web is connected
  const { getWhatsAppState } = require("./whatsapp-web");
  const state = getWhatsAppState();
  if (state.isReady) return "web";
  return "none";
}
