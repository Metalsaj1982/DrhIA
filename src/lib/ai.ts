// AI assistance module for admissions follow-up
// Uses OpenAI-compatible API for generating suggestions

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface LeadContext {
  studentName: string;
  guardianName: string;
  gradeInterest: string | null;
  source: string;
  status: string;
  notes: string | null;
  daysSinceLastInteraction: number | null;
  nextAction: string | null;
  conversationHistory?: string[];
}

export interface AISuggestion {
  nextAction: string;
  followUpMessage: string;
  objectionHandling: string | null;
  coldLeadAlert: boolean;
  confidence: number;
}

const SYSTEM_PROMPT = `Eres un asistente de admisiones escolares experto. Tu trabajo es ayudar al equipo de admisiones a convertir prospectos en alumnos inscritos.

Debes analizar el contexto del prospecto y generar:
1. La siguiente mejor acción recomendada
2. Un mensaje de seguimiento personalizado por WhatsApp (breve, cálido, profesional)
3. Manejo de objeciones si detectas alguna (precio, ubicación, indecisión, metodología, disciplina, infraestructura)
4. Alerta si el prospecto parece frío (sin interacción reciente)

Responde SIEMPRE en JSON con esta estructura:
{
  "nextAction": "string",
  "followUpMessage": "string",
  "objectionHandling": "string o null",
  "coldLeadAlert": boolean,
  "confidence": number entre 0 y 1
}`;

export async function getAISuggestion(
  context: LeadContext
): Promise<AISuggestion> {
  // Fallback when API key is not configured
  if (!OPENAI_API_KEY) {
    return generateFallbackSuggestion(context);
  }

  try {
    const userPrompt = `Prospecto: ${context.guardianName} (padre/madre de ${context.studentName})
Grado de interés: ${context.gradeInterest || "No especificado"}
Fuente: ${context.source}
Estado actual: ${context.status}
Notas: ${context.notes || "Sin notas"}
Días desde última interacción: ${context.daysSinceLastInteraction ?? "Sin interacción registrada"}
Próxima acción pendiente: ${context.nextAction || "Ninguna"}
${context.conversationHistory?.length ? `Últimos mensajes:\n${context.conversationHistory.slice(-5).join("\n")}` : "Sin historial de conversación"}`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as AISuggestion;
    }
    return generateFallbackSuggestion(context);
  } catch (error) {
    console.error("[AI] Error generating suggestion:", error);
    return generateFallbackSuggestion(context);
  }
}

// Rule-based fallback when AI API is unavailable
function generateFallbackSuggestion(context: LeadContext): AISuggestion {
  const isCold = (context.daysSinceLastInteraction ?? 999) > 7;
  const isNew = context.status === "Nuevo";
  const isContacted = context.status === "Contactado";

  let nextAction = "Enviar mensaje de seguimiento";
  let followUpMessage = "";
  let objectionHandling: string | null = null;

  if (isNew) {
    nextAction = "Hacer primer contacto por WhatsApp";
    followUpMessage = `Hola ${context.guardianName}, ¡gracias por su interés en nuestro colegio! Me encantaría platicar sobre las opciones que tenemos para ${context.studentName}. ¿Le parece bien si le comparto más información?`;
  } else if (isCold) {
    nextAction = "Reactivar prospecto frío";
    followUpMessage = `Hola ${context.guardianName}, espero que se encuentre bien. Hace tiempo platicamos sobre la inscripción de ${context.studentName}. ¿Sigue interesado(a)? Con gusto le actualizo sobre nuestras opciones disponibles.`;
  } else if (isContacted) {
    nextAction = "Programar visita al campus";
    followUpMessage = `Hola ${context.guardianName}, ¿le gustaría agendar una visita a nuestras instalaciones? Es la mejor forma de conocer el ambiente y resolver cualquier duda sobre el programa para ${context.studentName}.`;
  } else {
    followUpMessage = `Hola ${context.guardianName}, ¿cómo va todo? Quería darle seguimiento sobre el proceso de admisión de ${context.studentName}. ¿Tiene alguna duda que pueda resolver?`;
  }

  return {
    nextAction,
    followUpMessage,
    objectionHandling: objectionHandling,
    coldLeadAlert: isCold,
    confidence: isCold ? 0.6 : 0.8,
  };
}
