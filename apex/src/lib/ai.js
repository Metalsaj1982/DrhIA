import { dayKey } from './store.js';

// Id anónimo del teléfono, para contar el tope diario de mensajes.
function deviceId() {
  try {
    let id = localStorage.getItem('apex.device');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('apex.device', id);
    }
    return id;
  } catch {
    return 'sin-id';
  }
}

// El navegador manda solo el id del mentor y datos del usuario; el prompt se arma en el servidor.
export async function askCoach({ mentor, message, profile, done = 0, streak = 0, history = [] }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentor,
        message,
        device: deviceId(),
        history,
        context: {
          name: profile?.name,
          goal: profile?.goal,
          habits: profile?.habits?.map((h) => h.label),
          done,
          total: profile?.habits?.length || 0,
          streak,
          today: dayKey(),
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error || 'El coach no responde ahora. Intenta en un momento.';
    return data.text || 'Sin respuesta. Intenta otra vez.';
  } catch {
    return 'Sin conexión. Tus hábitos se guardan igual; el coach vuelve cuando tengas internet.';
  }
}
