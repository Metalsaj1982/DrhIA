import { useCallback, useEffect, useState } from 'react';
import {
  cloudEnabled, createTeam, getUser, joinTeam, myTeams, sendMagicLink, signOut, supabase, teamBoard,
} from '../lib/cloud.js';
import { addDays, dayKey } from '../lib/store.js';

const WHATSAPP = 'https://wa.me/593984480203?text=' + encodeURIComponent('Hola, quiero activar Equipos de Apex Council para mi red.');

export default function Team({ profile }) {
  if (!cloudEnabled) {
    return (
      <main className="team">
        <h1>Equipos</h1>
        <p>Con Equipos, un líder crea su grupo, comparte un código y ve quién mantiene el ritmo cada semana. Cada persona solo comparte cuántas acciones hizo por día.</p>
        <p className="muted">Esta sección se activa cuando la app se conecta a su base de datos. Si diriges un equipo y quieres ser parte del piloto, escríbenos.</p>
        <a className="btn btn--ink" href={WHATSAPP} target="_blank" rel="noreferrer">Pedir acceso por WhatsApp</a>
      </main>
    );
  }
  return <CloudTeam profile={profile} />;
}

function CloudTeam({ profile }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [teams, setTeams] = useState([]);
  const [active, setActive] = useState(null);
  const [board, setBoard] = useState([]);
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    getUser().then((u) => { setUser(u); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const list = await myTeams();
      setTeams(list);
      setActive((a) => a || list[0]?.id || null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  useEffect(() => {
    if (!active) return;
    teamBoard(active, addDays(dayKey(), -6)).then(setBoard).catch((e) => setError(e.message));
  }, [active]);

  const run = (fn) => async (e) => {
    e.preventDefault();
    setError('');
    try { await fn(); } catch (err) { setError(err.message || 'Algo falló. Intenta otra vez.'); }
  };

  if (!ready) return <main className="team"><p className="muted">Cargando…</p></main>;

  if (!user) {
    return (
      <main className="team">
        <h1>Equipos</h1>
        <p>Entra con tu correo. Te enviamos un enlace; no necesitas contraseña.</p>
        {sent ? (
          <p className="notice">Revisa tu correo y abre el enlace en este mismo teléfono.</p>
        ) : (
          <form className="inline-form" onSubmit={run(async () => { await sendMagicLink(email.trim()); setSent(true); })}>
            <label className="sr-only" htmlFor="email">Correo</label>
            <input id="email" type="email" required className="field" value={email} placeholder="tu@correo.com" onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn--sun">Enviar enlace</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </main>
    );
  }

  const current = teams.find((t) => t.id === active);
  const days = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), i - 6));
  const members = Object.values(
    board.reduce((acc, row) => {
      acc[row.user_id] ||= { id: row.user_id, name: row.display_name, role: row.role, days: {} };
      if (row.day) acc[row.user_id].days[row.day] = row.total ? row.done / row.total : 0;
      return acc;
    }, {}),
  ).map((m) => ({ ...m, active: days.filter((d) => m.days[d] > 0).length }))
    .sort((a, b) => b.active - a.active);

  const shareText = current && encodeURIComponent(`Únete a mi equipo "${current.name}" en Apex Council. Código: ${current.code}\n${window.location.origin}/equipo`);

  return (
    <main className="team">
      <div className="row row--between">
        <h1>Equipos</h1>
        <button className="btn btn--ghost" onClick={() => signOut()}>Salir</button>
      </div>

      {teams.length > 1 && (
        <select className="field" value={active || ''} onChange={(e) => setActive(e.target.value)} aria-label="Elige equipo">
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}

      {current && (
        <section className="board">
          <h2>{current.name}</h2>
          <p className="muted">Código para invitar: <strong className="code">{current.code}</strong></p>
          <a className="btn btn--ink" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">Invitar por WhatsApp</a>
          <table>
            <caption className="sr-only">Días con al menos una acción, últimos 7 días</caption>
            <thead>
              <tr><th scope="col">Persona</th>{days.map((d) => <th scope="col" key={d}>{d.slice(8)}</th>)}<th scope="col">Días</th></tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{m.name}{m.role === 'leader' ? ' (líder)' : ''}</th>
                  {days.map((d) => (
                    <td key={d}><span className="week-sun" style={{ '--r': m.days[d] || 0 }} aria-label={`${Math.round((m.days[d] || 0) * 100)}%`} /></td>
                  ))}
                  <td>{m.active}/7</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="team-forms">
        <form onSubmit={run(async () => { await createTeam(teamName.trim(), profile.name); setTeamName(''); await refresh(); })}>
          <h2>Crear un equipo</h2>
          <input className="field" required minLength={2} maxLength={60} value={teamName} placeholder="Nombre del equipo" onChange={(e) => setTeamName(e.target.value)} />
          <button className="btn btn--sun">Crear equipo</button>
        </form>
        <form onSubmit={run(async () => { const t = await joinTeam(code, profile.name); setCode(''); setActive(t.id); await refresh(); })}>
          <h2>Unirme con un código</h2>
          <input className="field" required minLength={6} maxLength={6} value={code} placeholder="Código de 6 letras" onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn--ghost">Unirme</button>
        </form>
      </section>
      {error && <p className="error">{error}</p>}
    </main>
  );
}
