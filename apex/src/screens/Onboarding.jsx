import { useState } from 'react';
import { SUGGESTED_HABITS, addDays, dayKey } from '../lib/store.js';

const MAX_HABITS = 3;

export default function Onboarding({ initial, onDone, onCancel }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name || '');
  const [goal, setGoal] = useState(initial?.goal || '');
  const [habits, setHabits] = useState(initial?.habits?.map((h) => h.label) || []);
  const [custom, setCustom] = useState('');

  const toggle = (h) =>
    setHabits((list) => (list.includes(h) ? list.filter((x) => x !== h) : list.length < MAX_HABITS ? [...list, h] : list));

  const addCustom = (e) => {
    e.preventDefault();
    const h = custom.trim();
    if (h && !habits.includes(h) && habits.length < MAX_HABITS) setHabits([...habits, h]);
    setCustom('');
  };

  const finish = () => {
    const start = initial?.goalStart || dayKey();
    onDone({
      name: name.trim(),
      goal: goal.trim(),
      goalStart: start,
      goalEnd: initial?.goalEnd || addDays(start, 90),
      habits: habits.map((label, i) => ({ id: initial?.habits?.find((h) => h.label === label)?.id || `h${Date.now()}${i}`, label })),
    });
  };

  const steps = [
    {
      title: 'Soy ILLARI. ¿Cómo te llamas?',
      body: (
        <input className="field" autoFocus value={name} maxLength={40} placeholder="Tu nombre" onChange={(e) => setName(e.target.value)} />
      ),
      ready: name.trim().length > 0,
    },
    {
      title: `${name.trim() || 'Bien'}, ¿qué quieres lograr en 90 días?`,
      hint: 'Una sola meta, que puedas medir. Ejemplo: sumar 10 socios activos a mi equipo.',
      body: (
        <textarea className="field" autoFocus rows={3} maxLength={200} value={goal} placeholder="Mi meta a 90 días" onChange={(e) => setGoal(e.target.value)} />
      ),
      ready: goal.trim().length > 3,
    },
    {
      title: 'Elige tres acciones diarias',
      hint: `Que dependan de ti, no del resultado. ${habits.length} de ${MAX_HABITS}.`,
      body: (
        <>
          <div className="chips">
            {[...new Set([...SUGGESTED_HABITS, ...habits])].map((h) => (
              <button key={h} className={`chip${habits.includes(h) ? ' is-on' : ''}`} aria-pressed={habits.includes(h)} onClick={() => toggle(h)}>
                {h}
              </button>
            ))}
          </div>
          <form className="inline-form" onSubmit={addCustom}>
            <input className="field" value={custom} maxLength={60} placeholder="Escribe otra acción" onChange={(e) => setCustom(e.target.value)} />
            <button className="btn btn--ghost" disabled={!custom.trim() || habits.length >= MAX_HABITS}>Agregar</button>
          </form>
        </>
      ),
      ready: habits.length > 0,
    },
  ];

  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <main className="onboarding">
      <p className="progress" aria-live="polite">Paso {step + 1} de {steps.length}</p>
      <h1>{s.title}</h1>
      {s.hint && <p className="muted">{s.hint}</p>}
      <div className="onboarding-body">{s.body}</div>
      <div className="row">
        {step > 0 ? (
          <button className="btn btn--ghost" onClick={() => setStep(step - 1)}>Atrás</button>
        ) : (
          onCancel && <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
        )}
        <button className="btn btn--sun" disabled={!s.ready} onClick={() => (last ? finish() : setStep(step + 1))}>
          {last ? 'Empezar mi día' : 'Siguiente'}
        </button>
      </div>
    </main>
  );
}
