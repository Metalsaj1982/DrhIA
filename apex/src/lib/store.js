// Datos personales: se guardan en este dispositivo. Equipos usan Supabase (ver cloud.js).
const KEY = 'apex.v2';

export const SUGGESTED_HABITS = [
  'Contactar a 5 personas nuevas',
  'Hacer 3 seguimientos',
  'Leer 10 páginas',
  'Moverme 30 minutos',
  'Planificar el día en 5 minutos',
  'Escuchar 20 minutos de formación',
  'Agradecer por escrito a una persona',
  'Dormir antes de las 11',
];

export const EMPTY = { profile: null, checkins: {}, chat: [] };

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Sin almacenamiento (modo privado): la app sigue funcionando en memoria.
  }
}

export function dayKey(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function addDays(key, n) {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

// Un día cuenta para la racha si completaste al menos un hábito.
// Regla del producto: nunca fallar dos días seguidos importa más que el día perfecto.
export function streak(checkins, today = dayKey()) {
  let count = 0;
  let cursor = (checkins[today] || []).length ? today : addDays(today, -1);
  while ((checkins[cursor] || []).length) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function lastDays(checkins, total, n = 7, today = dayKey()) {
  return Array.from({ length: n }, (_, i) => {
    const key = addDays(today, i - (n - 1));
    const done = (checkins[key] || []).length;
    return { key, done, ratio: total ? Math.min(1, done / total) : 0 };
  });
}

export function daysLeft(profile, today = dayKey()) {
  if (!profile?.goalEnd) return null;
  const ms = new Date(`${profile.goalEnd}T12:00:00`) - new Date(`${today}T12:00:00`);
  return Math.max(0, Math.round(ms / 86_400_000));
}
