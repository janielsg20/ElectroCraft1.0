import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  getStudioIcon,
} from '@electrocraft/design-system';
import type {
  ElectroCraftDataSourceDefinition,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftDataSourceKind,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import { DataExplorer } from './data-explorer';
import { RestSourceWizardSheet } from './rest-source-wizard';
import './studio-data-source-adapters';
import './data-sources-workspace.css';

const DataSourceIcon = getStudioIcon('studio.sidebar.dataSources');
const AddIcon = getStudioIcon('action.add');

const sourceKindOptions = Object.freeze([
  { value: 'internal' as const, label: 'Interna', adapterId: 'internal.pglite' },
  { value: 'rest' as const, label: 'REST API', adapterId: 'rest.fetch' },
  { value: 'graphql' as const, label: 'GraphQL', adapterId: 'graphql.fetch' },
]);

function sourceKindLabel(kind: ElectroCraftDataSourceKind) {
  return sourceKindOptions.find((option) => option.value === kind)?.label ?? kind;
}

function InspectorContent({
  source,
  adapterRegistered,
  compatibility,
}: {
  readonly source: ElectroCraftDataSourceDefinition;
  readonly adapterRegistered: boolean;
  readonly compatibility: readonly { readonly message: string }[];
}) {
  return (
    <div className="ec-data-source-inspector-content">
      <section>
        <span>Seguridad</span>
        <strong>Configuración portable</strong>
        <p>El proyecto guarda authRef y configuración no sensible; las Credenciales quedan fuera.</p>
      </section>
      <section>
        <span>Gateway</span>
        <strong>{source.authRef ? 'Credenciales referenciadas' : 'Sin credenciales'}</strong>
        <p>
          {source.kind === 'internal'
            ? 'No requiere gateway para datos locales.'
            : 'Requiere gateway si el endpoint necesita secretos.'}
        </p>
      </section>
      <section>
        <span>Compatibilidad</span>
        <strong>{adapterRegistered && compatibility.length === 0 ? 'Compatible' : 'Revisión requerida'}</strong>
        {!adapterRegistered ? <p>Adapter no registrado todavía para esta fuente.</p> : null}
        {compatibility.length > 0 ? (
          <ul>
            {compatibility.map((item, index) => (
              <li key={`${index}-${item.message}`}>{item.message}</li>
            ))}
          </ul>
        ) : null}
      </section>
      <section>
        <span>Entornos</span>
        <strong>{source.environmentScope.join(' · ')}</strong>
      </section>
    </div>
  );
}

export function DataSourcesWorkspace() {
  const snapshot = useSyncExternalStore(
    dataSourceWorkspaceRuntime.subscribe,
    dataSourceWorkspaceRuntime.getSnapshot,
    dataSourceWorkspaceRuntime.getSnapshot,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [environment, setEnvironment] = useState<ElectroCraftDataSourceEnvironment>('development');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void dataSourceWorkspaceRuntime.load();
  }, []);

  useEffect(() => {
    if (selectedId && snapshot.sources.some(({ id }) => id === selectedId)) return;
    setSelectedId(snapshot.sources[0]?.id ?? null);
    setDetailOpen(false);
    setExplorerOpen(false);
  }, [selectedId, snapshot.sources]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    if (!query) return snapshot.sources;
    return snapshot.sources.filter((source) =>
      `${source.label} ${source.key} ${source.kind} ${source.adapterId}`.toLocaleLowerCase('es').includes(query),
    );
  }, [search, snapshot.sources]);

  const selected = snapshot.sources.find(({ id }) => id === selectedId) ?? null;
  const compatibility = selected ? dataSourceWorkspaceRuntime.compatibility(selected) : [];
  const adapterDescriptor = selected
    ? (dataSourceWorkspaceRuntime.registry.list().find(({ adapterId }) => adapterId === selected.adapterId) ?? null)
    : null;
  const adapterRegistered = Boolean(adapterDescriptor?.adapterRegistered);
  const environmentEnabled = selected ? selected.environmentScope.includes(environment) : false;
  const adapterUsable = adapterRegistered && environmentEnabled && compatibility.length === 0;

  if (snapshot.state === 'loading' && snapshot.sources.length === 0) {
    return (
      <section className="ec-data-sources-workspace" data-data-sources-workspace>
        <p role="status">Cargando fuentes de datos…</p>
      </section>
    );
  }

  if (snapshot.state === 'error' && snapshot.sources.length === 0) {
    return (
      <section className="ec-data-sources-workspace" data-data-sources-workspace>
        <div className="ec-data-sources-empty" role="alert">
          <strong>No se pudieron cargar las fuentes de datos.</strong>
          <p>{snapshot.message}</p>
          <Button size="sm" onClick={() => void dataSourceWorkspaceRuntime.load()}>
            Reintentar
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="ec-data-sources-workspace" data-data-sources-workspace aria-labelledby="ec-data-sources-title">
      <header className="ec-data-sources-header">
        <div className="ec-data-sources-title">
          <span aria-hidden="true">
            <DataSourceIcon />
          </span>
          <div>
            <p>Datos</p>
            <div>
              <h2 id="ec-data-sources-title">Fuentes de datos</h2>
              <HelpTrigger helpId="help.data.sources" />
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!snapshot.project || snapshot.state === 'saving'}>
          <AddIcon aria-hidden="true" /> Nueva fuente
        </Button>
      </header>

      {!snapshot.project ? (
        <div className="ec-data-sources-empty">
          <strong>Abre un proyecto para configurar sus fuentes de datos.</strong>
          <p>Las fuentes pertenecen al proyecto, pero sus secretos nunca forman parte del payload portable.</p>
          <Button asChild size="sm">
            <a href="/">Abrir Proyectos</a>
          </Button>
        </div>
      ) : snapshot.sources.length === 0 ? (
        <div className="ec-data-sources-empty">
          <strong>Todavía no hay fuentes de datos.</strong>
          <p>Crea una fuente REST desde el wizard o configura ElectroCraft Data desde el panel superior.</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <AddIcon aria-hidden="true" /> Nueva fuente REST
          </Button>
        </div>
      ) : explorerOpen && selected ? (
        <DataExplorer source={selected} environment={environment} onBack={() => setExplorerOpen(false)} />
      ) : (
        <div className="ec-data-sources-layout" data-mobile-detail={detailOpen ? 'true' : 'false'}>
          <aside className="ec-data-sources-list" aria-label="Fuentes de datos">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar fuentes…"
              aria-label="Buscar fuentes"
            />
            <div role="listbox" aria-label="Fuentes del proyecto">
              {filtered.map((source) => {
                const diagnostics = dataSourceWorkspaceRuntime.compatibility(source);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedId === source.id}
                    data-selected={selectedId === source.id ? 'true' : 'false'}
                    className="ec-data-source-item"
                    key={source.id}
                    onClick={() => {
                      setSelectedId(source.id);
                      setDetailOpen(true);
                      setExplorerOpen(false);
                      setActionError(null);
                    }}
                  >
                    <span aria-hidden="true">
                      <DataSourceIcon />
                    </span>
                    <span>
                      <strong>{source.label}</strong>
                      <small>
                        {sourceKindLabel(source.kind)} · {source.adapterId}
                      </small>
                    </span>
                    <em data-state={diagnostics.length === 0 ? 'ready' : 'warning'}>
                      {diagnostics.length === 0 ? 'Compatible' : `${diagnostics.length} aviso(s)`}
                    </em>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="ec-data-source-detail" aria-live="polite">
            {selected ? (
              <>
                <div className="ec-data-source-detail-heading">
                  <Button
                    className="ec-data-source-mobile-back"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailOpen(false)}
                  >
                    ← Fuentes
                  </Button>
                  <div className="ec-data-source-detail-title">
                    <p>{sourceKindLabel(selected.kind)}</p>
                    <h3>{selected.label}</h3>
                    <small>{selected.key}</small>
                  </div>
                  <Button
                    className="ec-data-source-inspector-trigger"
                    size="sm"
                    variant="outline"
                    onClick={() => setInspectorOpen(true)}
                  >
                    Seguridad y compatibilidad
                  </Button>
                  <Button
                    size="sm"
                    disabled={!adapterUsable}
                    onClick={() => {
                      setActionError(null);
                      setExplorerOpen(true);
                    }}
                  >
                    Explorar
                  </Button>
                </div>

                <section className="ec-data-source-section" aria-labelledby="ec-data-source-summary">
                  <h4 id="ec-data-source-summary">Resumen</h4>
                  <div className="ec-data-source-detail-grid">
                    <section>
                      <span>Adapter</span>
                      <strong>{selected.adapterId}</strong>
                    </section>
                    <section>
                      <span>Estado</span>
                      <strong>{adapterRegistered ? 'Registrado' : 'No registrado'}</strong>
                    </section>
                    <section>
                      <span>Discovery</span>
                      <strong>{selected.schemaDiscovery}</strong>
                    </section>
                    <section>
                      <span>Actualización</span>
                      <strong>{dataSourceWorkspaceRuntime.sourceUpdatedAt(selected.id) ?? 'Sin fecha'}</strong>
                    </section>
                  </div>
                  <div className="ec-data-source-chips">
                    {dataSourceWorkspaceRuntime.canonicalCapabilities(selected).map((capability) => (
                      <span key={capability}>{capability}</span>
                    ))}
                  </div>
                </section>

                <section className="ec-data-source-section" aria-labelledby="ec-data-source-config">
                  <div className="ec-data-source-section-heading">
                    <h4 id="ec-data-source-config">Configuración</h4>
                    <Select
                      value={environment}
                      onValueChange={(value) => setEnvironment(value as ElectroCraftDataSourceEnvironment)}
                    >
                      <SelectTrigger aria-label="Entorno de la fuente">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <pre>
                    {JSON.stringify(
                      { ...selected.config, ...(selected.environmentOverrides[environment] ?? {}) },
                      null,
                      2,
                    )}
                  </pre>
                  <small>
                    {environmentEnabled
                      ? 'Este entorno está habilitado.'
                      : 'Esta fuente está deshabilitada en el entorno seleccionado.'}
                  </small>
                </section>

                <section className="ec-data-source-section" aria-labelledby="ec-data-source-auth">
                  <h4 id="ec-data-source-auth">Autenticación</h4>
                  <div className="ec-data-source-auth-summary">
                    <div>
                      <span>Credenciales</span>
                      <strong>{selected.authRef ? 'SecretRef configurado' : 'Sin credenciales'}</strong>
                    </div>
                    <div>
                      <span>Gateway</span>
                      <strong>
                        {selected.kind === 'internal' ? 'No requerido' : 'Requiere gateway si usa secretos'}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="ec-data-source-section" aria-labelledby="ec-data-source-schema">
                  <h4 id="ec-data-source-schema">Esquema</h4>
                  <p>
                    Política: <strong>{selected.schemaDiscovery}</strong>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      !adapterUsable || !adapterDescriptor?.supportsSchemaDiscovery || snapshot.state === 'testing'
                    }
                    onClick={() => {
                      setActionError(null);
                      void dataSourceWorkspaceRuntime
                        .introspectSchema(selected, environment)
                        .catch((cause: unknown) =>
                          setActionError(
                            cause instanceof Error ? cause.message : 'No se pudo inspeccionar el esquema.',
                          ),
                        );
                    }}
                  >
                    Inspeccionar esquema
                  </Button>
                  {!adapterRegistered ? (
                    <small>Disponible cuando el adapter de esta fuente esté registrado.</small>
                  ) : null}
                  {snapshot.discoveredSchema ? (
                    <p>
                      Esquema detectado: <strong>{snapshot.discoveredSchema.name}</strong>
                    </p>
                  ) : null}
                </section>

                <section className="ec-data-source-section" aria-labelledby="ec-data-source-test">
                  <h4 id="ec-data-source-test">Prueba</h4>
                  {actionError ? (
                    <p className="ec-data-source-error" role="alert">
                      {actionError}
                    </p>
                  ) : null}
                  {snapshot.lastOperation ? <p role="status">{snapshot.lastOperation}</p> : null}
                  <div className="ec-data-source-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!adapterUsable || snapshot.state === 'testing'}
                      onClick={() => {
                        setActionError(null);
                        void dataSourceWorkspaceRuntime
                          .testConnection(selected, environment)
                          .catch((cause: unknown) =>
                            setActionError(cause instanceof Error ? cause.message : 'No se pudo probar la conexión.'),
                          );
                      }}
                    >
                      Probar conexión
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={snapshot.state === 'saving'}
                      onClick={() =>
                        void dataSourceWorkspaceRuntime
                          .deleteSource(selected.id)
                          .catch((cause: unknown) =>
                            setActionError(cause instanceof Error ? cause.message : 'No se pudo eliminar la fuente.'),
                          )
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                  {!adapterRegistered ? <small>Prueba deshabilitada: adapter no registrado.</small> : null}
                  {adapterRegistered && compatibility.length > 0 ? (
                    <small>Prueba deshabilitada: resuelve primero los avisos de compatibilidad.</small>
                  ) : null}
                  {adapterRegistered && !environmentEnabled ? (
                    <small>Prueba deshabilitada: el entorno no pertenece al scope de la fuente.</small>
                  ) : null}
                </section>
              </>
            ) : (
              <p>Selecciona una fuente de datos.</p>
            )}
          </article>

          {selected ? (
            <aside className="ec-data-source-inspector" aria-label="Seguridad y compatibilidad">
              <InspectorContent source={selected} adapterRegistered={adapterRegistered} compatibility={compatibility} />
            </aside>
          ) : null}
        </div>
      )}

      <RestSourceWizardSheet open={addOpen} onOpenChange={setAddOpen} />
      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent side="right" className="ec-data-source-inspector-sheet">
          <SheetHeader>
            <SheetTitle>Seguridad y compatibilidad</SheetTitle>
            <SheetDescription>Resumen de secrets, gateway, adapter y entornos.</SheetDescription>
          </SheetHeader>
          {selected ? (
            <InspectorContent source={selected} adapterRegistered={adapterRegistered} compatibility={compatibility} />
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}
