// WhatsApp Cloud API client — designed for official Meta Business API integration
// Requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars

const API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0";
const API_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

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

export async function sendTextMessage(
  msg: WhatsAppTextMessage
): Promise<WhatsAppResponse> {
  if (!API_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("[WhatsApp] API credentials not configured — message simulated");
    return { success: true, messageId: `sim_${Date.now()}` };
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
    return { success: false, error: String(error) };
  }
}

export async function sendTemplateMessage(
  msg: WhatsAppTemplateMessage
): Promise<WhatsAppResponse> {
  if (!API_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("[WhatsApp] API credentials not configured — template simulated");
    return { success: true, messageId: `sim_tpl_${Date.now()}` };
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
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}
