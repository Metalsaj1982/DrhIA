import { useState } from 'react';
import Horizon from '../Horizon.jsx';
import { askCoach } from '../lib/ai.js';
import { dayKey, daysLeft, lastDays, streak } from '../lib/store.js';

const WEEKDAY = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export default function Today({ state, setState }) {
  const { profile, checkins } = state;
  const today = dayKey();
  const doneIds = checkins[today] || [];
  const total = profile.habits.length;
  const ratio = total ? doneIds.length / total : 0;
  const currentStreak = streak(checkins, today);
  const left = daysLeft(profile, today);
  const week = lastDays(checkins, total, 7, today);
  const [note, setNote] = useState(state.notes?.[today] || '');
  const [loading, setLoading] = useState(false);

  const toggle = (id) =>
    setState((s) => {
      const list = s.checkins[today] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...s, checkins: { ...s.checkins, [today]: next } };
    });

  const getNote = async () => {
    setLoading(true);
    const text = await askCoach({
      mentor: 'illari',
      message: doneIds.length === total ? 'Ya completé todo hoy. Dame un cierre del día.' : 'Dame mi mensaje de hoy.',
      profile,
      done: doneIds.length,
      streak: currentStreak,
    });
    setNote(text);
    setState((s) => ({ ...s, notes: { [today]: text } }));
    setLoading(false);
  };

  return (
    <main className="today">
      <header className="today-head">
        <p className="muted">{greeting()}, {profile.name}</p>
        <h1>{doneIds.length === total ? 'Amaneció completo.' : `${doneIds.length} de ${total} hoy`}</h1>
      </header>

      <Horizon ratio={ratio} label={`Has completado ${doneIds.length} de ${total} acciones hoy`} />

      <ul className="habit-list habit-list--big">
        {profile.habits.map((h) => {
          const on = doneIds.includes(h.id);
          return (
            <li key={h.id}>
              <button className={`habit${on ? ' is-done' : ''}`} aria-pressed={on} onClick={() => toggle(h.id)}>
                <span className="habit-check" aria-hidden="true" />
                {h.label}
              </button>
            </li>
          );
        })}
      </ul>

      <section className="stats" aria-label="Tu avance">
        <div><span className="stat">{currentStreak}</span> {currentStreak === 1 ? 'día' : 'días'} de racha</div>
        {left !== null && <div><span className="stat">{left}</span> días para tu meta</div>}
      </section>

      <ol className="week" aria-label="Últimos 7 días">
        {week.map((d) => (
          <li key={d.key} title={`${d.key}: ${d.done} de ${total}`}>
            <span className="week-sun" style={{ '--r': d.ratio }} />
            <span className="week-day">{WEEKDAY[new Date(`${d.key}T12:00:00`).getDay()]}</span>
          </li>
        ))}
      </ol>

      <section className="goal-card">
        <p className="muted">Tu meta a 90 días</p>
        <p className="goal">{profile.goal}</p>
      </section>

      <section className="illari">
        <h2>ILLARI</h2>
        {note ? <p className="illari-note">{note}</p> : <p className="muted">Pide tu mensaje de hoy cuando quieras.</p>}
        {note ? (
          <p className="fineprint">Tu próximo mensaje llega mañana. Si necesitas más, habla con tu consejo en Coach.</p>
        ) : (
          <button className="btn btn--ghost" onClick={getNote} disabled={loading}>
            {loading ? 'ILLARI está escribiendo…' : 'Recibir mi mensaje de hoy'}
          </button>
        )}
      </section>
    </main>
  );
}
