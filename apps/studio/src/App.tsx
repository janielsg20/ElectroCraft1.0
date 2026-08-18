import { studioWorkspaceDescriptor } from './index';
import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import './styles.css';

const projectHomeRoute = Object.freeze({
  id: 'project-home-development',
  pathname: '/',
  finalNavigation: false,
});

export function App() {
  const health = evaluateStudioBootstrapHealth(studioWorkspaceDescriptor.dependencies);
  const isProjectHome = window.location.pathname === projectHomeRoute.pathname;

  return (
    <main className="development-shell" data-help-id={studioWorkspaceDescriptor.helpId}>
      <section className="development-panel" aria-labelledby="development-title">
        <p className="development-kicker">Studio · F01 / M01.4</p>
        <h1 id="development-title">ElectroCraft — Desarrollo</h1>
        <p className="development-summary">
          Bootstrap técnico temporal. La navegación y la interfaz final se implementan en fases posteriores.
        </p>

        <div className="development-status" data-state={health.state}>
          <span className="status-dot" aria-hidden="true" />
          <div>
            <p className="status-label">Estado del entorno</p>
            <p className="status-value" role="status" aria-live="polite">
              {health.label}
            </p>
            <p className="status-detail">{health.detail}</p>
          </div>
        </div>

        {isProjectHome ? (
          <section className="project-home" aria-labelledby="project-home-title">
            <p className="route-label">Ruta temporal · /</p>
            <h2 id="project-home-title">Inicio del proyecto</h2>
            <p>Esta superficie solo confirma el arranque del Studio; no contiene datos demo permanentes.</p>
          </section>
        ) : (
          <section className="project-home" aria-labelledby="route-blocked-title">
            <p className="route-label">Ruta no disponible en este bootstrap</p>
            <h2 id="route-blocked-title">Volver a /</h2>
            <p>Las rutas finales pertenecen al modelo de navegación de ElectroCraft y no se duplican aquí.</p>
          </section>
        )}

        <aside className="architecture-help" aria-label="Ayuda de arquitectura">
          <strong>Arquitectura del repositorio</strong>
          <p>
            Studio es un composition root. El modelo canónico permanece en sus owners y este bootstrap no crea una
            segunda fuente de verdad.
          </p>
          <code>{studioWorkspaceDescriptor.helpId}</code>
        </aside>
      </section>
    </main>
  );
}
