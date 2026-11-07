import { useEffect, useRef, useState } from 'react';
import { askCoach } from '../lib/ai.js';
import { dayKey, streak } from '../lib/store.js';

const MENTORS = [
  { id: 'illari', name: 'ILLARI', role: 'Guía diaria' },
  { id: 'estratega', name: 'Estratega', role: 'Prioridades' },
  { id: 'disciplina', name: 'Disciplina', role: 'Constancia' },
  { id: 'mente', name: 'Mente', role: 'Calma y enfoque' },
];

const STARTERS = {
  illari: '¿Qué hago hoy si solo tengo 15 minutos?',
  estratega: '¿Cuál de mis acciones mueve más mi meta?',
  disciplina: 'Ayer fallé. ¿Cómo vuelvo hoy?',
  mente: 'Me dijeron que no tres veces hoy. ¿Cómo sigo?',
};

export default function Coach({ state, setState }) {
  const [mentor, setMentor] = useState('illari');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const today = dayKey();
  const messages = (state.chat || []).filter((m) => m.mentor === mentor);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, busy]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput('');
    setBusy(true);
    const history = messages.slice(-12).map((m) => ({ role: m.role, text: m.text }));
    setState((s) => ({ ...s, chat: [...(s.chat || []), { mentor, role: 'user', text: msg }].slice(-200) }));
    const reply = await askCoach({
      mentor,
      message: msg,
      history,
      profile: state.profile,
      done: (state.checkins[today] || []).length,
      streak: streak(state.checkins, today),
    });
    setState((s) => ({ ...s, chat: [...(s.chat || []), { mentor, role: 'model', text: reply }].slice(-200) }));
    setBusy(false);
  };

  return (
    <main className="coach">
      <h1>Tu consejo</h1>
      <div className="segmented" role="tablist" aria-label="Elige coach">
        {MENTORS.map((m) => (
          <button key={m.id} role="tab" aria-selected={mentor === m.id} className={mentor === m.id ? 'is-on' : ''} onClick={() => setMentor(m.id)}>
            <strong>{m.name}</strong>
            <span>{m.role}</span>
          </button>
        ))}
      </div>

      <div className="thread" aria-live="polite">
        {messages.length === 0 && (
          <button className="starter" onClick={() => send(STARTERS[mentor])}>{STARTERS[mentor]}</button>
        )}
        {messages.map((m, i) => (
          <p key={i} className={`bubble bubble--${m.role}`}>{m.text}</p>
        ))}
        {busy && <p className="bubble bubble--model muted">Escribiendo…</p>}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <label className="sr-only" htmlFor="msg">Mensaje</label>
        <input id="msg" className="field" value={input} maxLength={1500} placeholder="Escribe tu mensaje" onChange={(e) => setInput(e.target.value)} />
        <button className="btn btn--sun" disabled={busy || !input.trim()}>Enviar</button>
      </form>
      <p className="fineprint">Los coaches son IA. No reemplazan a un profesional de salud ni a un asesor financiero.</p>
    </main>
  );
}
