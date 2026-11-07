// Topes de uso del coach. Con Upstash Redis (Vercel → Storage) los topes son globales y exactos.
// Sin Redis, se cuentan en memoria por instancia: sirve en pruebas, no en producción.

export const LIMITS = {
  perDevice: Number(process.env.DAILY_LIMIT_DEVICE || 10),   // mensajes por teléfono al día
  perIp: Number(process.env.DAILY_LIMIT_IP || 40),           // por red (oficinas, wifi compartido)
  global: Number(process.env.DAILY_LIMIT_GLOBAL || 3000),    // techo total de la app al día
};

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const redisEnabled = Boolean(REDIS_URL && REDIS_TOKEN);

// El día se cuenta en hora de Ecuador.
export function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
}

const memory = new Map();

async function incrAll(keys) {
  if (!redisEnabled) {
    return keys.map((k) => {
      const v = (memory.get(k) || 0) + 1;
      memory.set(k, v);
      return v;
    });
  }
  const commands = keys.flatMap((k) => [['INCR', k], ['EXPIRE', k, 90000]]);
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const data = await res.json();
  return keys.map((_, i) => Number(data[i * 2]?.result || 0));
}

// Devuelve { ok, remaining, reason }. Si Redis falla, deja pasar (mejor que tumbar la app) y lo registra.
export async function consume({ device, ip }) {
  const day = today();
  const safeDevice = String(device || 'sin-id').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64) || 'sin-id';
  const keys = [`apex:d:${day}:${safeDevice}`, `apex:i:${day}:${ip}`, `apex:g:${day}`];
  let counts;
  try {
    counts = await incrAll(keys);
  } catch (err) {
    console.error('[limits] Redis no responde:', err.message);
    return { ok: true, remaining: null };
  }
  const [d, i, g] = counts;
  if (g > LIMITS.global) return { ok: false, reason: 'global' };
  if (i > LIMITS.perIp) return { ok: false, reason: 'ip' };
  if (d > LIMITS.perDevice) return { ok: false, reason: 'device' };
  return { ok: true, remaining: LIMITS.perDevice - d };
}
