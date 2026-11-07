import { useState } from 'react';
import Horizon from '../Horizon.jsx';

const DEMO = ['Contactar a 5 personas nuevas', 'Leer 10 páginas', 'Moverme 30 minutos'];
const WHATSAPP = 'https://wa.me/593984480203?text=' + encodeURIComponent('Hola, soy líder de equipo y quiero probar Apex Council con mi red.');

export default function Landing({ onStart }) {
  const [demo, setDemo] = useState([true, false, false]);
  const done = demo.filter(Boolean).length;

  return (
    <div className="landing">
      <header className="topbar">
        <span className="wordmark">Apex Council</span>
        <button className="btn btn--ghost" onClick={onStart}>Empezar gratis</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Cada día es un amanecer. Tú decides cuánto sube el sol.</h1>
          <p className="lede">
            Apex Council convierte tu meta de 90 días en tres acciones diarias. Las marcas, el sol sube,
            y un coach con IA te ayuda a no fallar dos días seguidos.
          </p>
          <div className="hero-actions">
            <button className="btn btn--sun" onClick={onStart}>Empezar gratis</button>
            <a className="btn btn--ghost" href="#lideres">Soy líder de equipo</a>
          </div>
        </div>

        <div className="hero-demo">
          <Horizon ratio={done / DEMO.length} label={`Demostración: ${done} de ${DEMO.length} hábitos marcados`} />
          <p className="demo-hint">Pruébalo: marca tus acciones de hoy.</p>
          <ul className="habit-list">
            {DEMO.map((h, i) => (
              <li key={h}>
                <button
                  className={`habit${demo[i] ? ' is-done' : ''}`}
                  aria-pressed={demo[i]}
                  onClick={() => setDemo((d) => d.map((v, j) => (j === i ? !v : v)))}
                >
                  <span className="habit-check" aria-hidden="true" />
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="split" id="lideres">
        <article>
          <h2>Para ti</h2>
          <p>Una meta, tres hábitos, cinco minutos al día. Tu racha cuenta los días en que hiciste al menos una acción: la constancia vale más que el día perfecto.</p>
          <p>Tu meta y tus hábitos se guardan en tu teléfono. No necesitas cuenta para empezar.</p>
        </article>
        <article>
          <h2>Para líderes de equipo</h2>
          <p>Si diriges una red de mercadeo o un equipo de ventas, crea tu equipo, comparte un código por WhatsApp y mira quién mantiene el ritmo esta semana.</p>
          <p>Tu equipo solo comparte cuántas acciones hizo cada día. Sus metas personales siguen siendo suyas.</p>
          <a className="btn btn--ink" href={WHATSAPP} target="_blank" rel="noreferrer">Pedir un piloto por WhatsApp</a>
        </article>
      </section>

      <section className="steps">
        <h2>Cómo funciona</h2>
        <ol>
          <li><strong>Escribe tu meta a 90 días.</strong> Una sola, concreta y medible.</li>
          <li><strong>Elige tres acciones diarias</strong> que dependan de ti, no del resultado.</li>
          <li><strong>Márcalas cada día.</strong> Si fallas uno, el coach reduce la meta al mínimo para que no falles el siguiente.</li>
        </ol>
      </section>

      <section className="council">
        <h2>Tu consejo</h2>
        <p className="muted">Cuatro coaches de IA, cada uno con un enfoque. Son asistentes, no profesionales de salud ni asesores financieros.</p>
        <dl className="mentors">
          <div><dt>ILLARI</dt><dd>Tu guía diaria. "Illari" significa amanecer en kichwa.</dd></div>
          <div><dt>Estratega</dt><dd>Qué priorizar hoy para mover tu meta.</dd></div>
          <div><dt>Disciplina</dt><dd>Cómo volver al ritmo cuando fallaste.</dd></div>
          <div><dt>Mente</dt><dd>Calma, enfoque y manejo del rechazo.</dd></div>
        </dl>
      </section>

      <section className="pilot">
        <h2>Piloto abierto</h2>
        <p>Apex Council es gratis para uso personal mientras dura el piloto. Los planes para equipos se definen con los primeros líderes que lo usen.</p>
        <button className="btn btn--sun" onClick={onStart}>Empezar gratis</button>
      </section>

      <footer className="footer">
        <p>Apex Council · Hecho en Ecuador. No prometemos ingresos: te ayudamos a cumplir lo que tú decides hacer.</p>
      </footer>
    </div>
  );
}
