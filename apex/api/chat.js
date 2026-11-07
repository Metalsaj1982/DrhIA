import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from './_mentors.js';
import { consume } from './_limits.js';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://apex-council.vercel.app,http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const MAX_MESSAGE = 1500;
const MAX_HISTORY = 6;
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;
// Primero el modelo barato; Flash solo si Flash-Lite falla.
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

// Límite en memoria, de mejor esfuerzo (cada instancia lleva su cuenta).
// Para un límite global, cambia esto por Upstash Redis del Marketplace de Vercel.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now - e.start > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  e.count += 1;
  return e.count > RATE_LIMIT;
}

const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vistas previas de Vercel del mismo proyecto.
  return /^https:\/\/apex-council-[a-z0-9-]+\.vercel\.app$/.test(origin);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = isAllowedOrigin(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(allowed ? 204 : 403).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST.' });
  if (!allowed) return res.status(403).json({ error: 'Origen no permitido.' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiados mensajes seguidos. Espera un minuto.' });
  }

  const { mentor, message, context, history, device } = req.body || {};
  const text = clip(message, MAX_MESSAGE).trim();
  if (!text) return res.status(400).json({ error: 'Escribe un mensaje.' });

  // VITE_GEMINI_API_KEY: nombre que usaba la v1. Solo se lee en el servidor (el navegador no la referencia).
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta GEMINI_API_KEY en el servidor.' });

  // Tope diario: por teléfono, por red y total de la app. Se cuenta antes de llamar a la IA.
  const quota = await consume({ device, ip });
  if (!quota.ok) {
    const error = quota.reason === 'global'
      ? 'El coach alcanzó su límite de hoy. Vuelve mañana; tus hábitos se siguen guardando.'
      : 'Usaste tus mensajes de hoy con el coach. Vuelve mañana.';
    return res.status(429).json({ error, limit: quota.reason });
  }

  const pastTurns = (Array.isArray(history) ? history : [])
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m?.role === 'user' ? 'user' : 'model',
      parts: [{ text: clip(m?.text, MAX_MESSAGE) }],
    }))
    .filter((m) => m.parts[0].text);
  while (pastTurns.length && pastTurns[0].role !== 'user') pastTurns.shift();

  const genAI = new GoogleGenerativeAI(key);
  const systemInstruction = buildSystemPrompt(mentor, context);

  for (const model of MODELS) {
    try {
      const chat = genAI
        .getGenerativeModel({ model, systemInstruction, generationConfig: { maxOutputTokens: 300, temperature: 0.7 } })
        .startChat({ history: pastTurns });
      const result = await chat.sendMessage(text);
      return res.status(200).json({ text: result.response.text(), remaining: quota.remaining });
    } catch (err) {
      console.error(`[chat] ${model}:`, err?.message);
    }
  }
  return res.status(502).json({ error: 'El coach no responde ahora. Tu lista de hoy sigue aquí: marca una acción.' });
}
