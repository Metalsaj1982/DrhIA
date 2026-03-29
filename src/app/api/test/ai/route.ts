import { NextResponse } from "next/server";
import { getAISuggestion } from "@/lib/ai";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  // Verificar si la API key está configurada
  if (!apiKey) {
    return NextResponse.json(
      {
        configured: false,
        message: "OPENAI_API_KEY no está configurada",
        instructions: [
          "1. Ve a https://platform.openai.com/signup y crea una cuenta",
          "2. Ve a https://platform.openai.com/api-keys",
          "3. Crea una nueva clave API",
          "4. Agrega OPENAI_API_KEY=sk-xxx a tu archivo .env",
        ],
      },
      { status: 200 }
    );
  }

  // Probar la conexión con OpenAI
  try {
    const testResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say 'OpenAI connection successful'" }],
        max_tokens: 20,
      }),
    });

    if (!testResponse.ok) {
      const error = await testResponse.json();
      return NextResponse.json(
        {
          configured: true,
          connected: false,
          error: error.error?.message || "Error connecting to OpenAI",
          details: error,
        },
        { status: 200 }
      );
    }

    const data = await testResponse.json();

    // También probar el módulo de AI del CRM
    const suggestion = await getAISuggestion({
      studentName: "María García",
      guardianName: "Ana García",
      gradeInterest: "EGB 1",
      source: "facebook_ads",
      status: "Nuevo",
      notes: "Interesada en inscripción para el próximo año",
      daysSinceLastInteraction: null,
      nextAction: null,
    });

    return NextResponse.json(
      {
        configured: true,
        connected: true,
        model: "gpt-4o-mini",
        testMessage: data.choices?.[0]?.message?.content || "No response",
        aiModule: {
          working: true,
          nextAction: suggestion.nextAction,
          followUpMessage: suggestion.followUpMessage,
          confidence: suggestion.confidence,
        },
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
