import { useEffect, useState } from 'react';
import { load, save, dayKey, EMPTY } from './lib/store.js';
import { pushCheckin } from './lib/cloud.js';
import Landing from './screens/Landing.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Today from './screens/Today.jsx';
import Coach from './screens/Coach.jsx';
import Team from './screens/Team.jsx';

const TABS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'coach', label: 'Coach' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'ajustes', label: 'Ajustes' },
];

function initialTab() {
  const path = window.location.pathname.replace('/', '');
  return TABS.some((t) => t.id === path) ? path : 'hoy';
}

export default function App() {
  const [state, setState] = useState(load);
  const [mode, setMode] = useState(state.profile ? 'app' : 'landing');
  const [tab, setTab] = useState(initialTab);

  useEffect(() => save(state), [state]);

  // Si el usuario está en un equipo, sube solo el conteo del día.
  const today = dayKey();
  const doneToday = (state.checkins[today] || []).length;
  const total = state.profile?.habits.length || 0;
  useEffect(() => {
    if (state.profile) pushCheckin(today, doneToday, total).catch(() => {});
  }, [today, doneToday, total, state.profile]);

  const go = (id) => {
    setTab(id);
    window.history.replaceState(null, '', id === 'hoy' ? '/' : `/${id}`);
    window.scrollTo(0, 0);
  };

  if (mode === 'landing' && !state.profile) return <Landing onStart={() => setMode('onboarding')} />;

  if (mode === 'onboarding' || !state.profile) {
    return (
      <Onboarding
        initial={state.profile}
        onCancel={state.profile ? () => setMode('app') : () => setMode('landing')}
        onDone={(profile) => {
          setState((s) => ({ ...s, profile }));
          setMode('app');
          go('hoy');
        }}
      />
    );
  }

  return (
    <div className="shell">
      {tab === 'hoy' && <Today state={state} setState={setState} />}
      {tab === 'coach' && <Coach state={state} setState={setState} />}
      {tab === 'equipo' && <Team profile={state.profile} />}
      {tab === 'ajustes' && (
        <main className="settings">
          <h1>Ajustes</h1>
          <section className="goal-card">
            <p className="muted">Meta</p>
            <p className="goal">{state.profile.goal}</p>
            <p className="muted">Del {state.profile.goalStart} al {state.profile.goalEnd}</p>
          </section>
          <button className="btn btn--ghost" onClick={() => setMode('onboarding')}>Editar meta y acciones</button>
          <button
            className="btn btn--danger"
            onClick={() => {
              if (window.confirm('Esto borra tu meta, hábitos y conversaciones de este teléfono. ¿Seguir?')) {
                setState(EMPTY);
                setMode('landing');
              }
            }}
          >
            Borrar mis datos de este teléfono
          </button>
          <p className="fineprint">Tus datos personales viven en este dispositivo. Si usas Equipos, solo se comparte cuántas acciones hiciste por día.</p>
        </main>
      )}

      <nav className="tabbar" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'is-on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
