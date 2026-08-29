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
  ElectroCraftCanonicalDataSourceCapability,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftDataSourceKind,
  JsonValue,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import './data-sources-workspace.css';

const DataSourceIcon = getStudioIcon('studio.sidebar.data-sources');
const AddIcon = getStudioIcon('action.add');
const capabilityOptions: readonly ElectroCraftCanonicalDataSourceCapability[] = [
  'read',
  'write',
  'filter',
  'sort',
  'pagination',
  'realtime',
  'files',
  'transactions',
];

function parseConfig(value: string): Record<string, JsonValue> {
  const parsed: unknown = JSON.parse(value || '{}');
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new TypeError('La configuración debe ser un objeto JSON.');
  }
  return parsed as Record<string, JsonValue>;
}

function AddDataSourceSheet({ open, onOpenChange }: { readonly open: boolean; readonly onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [kind, setKind] = useState<ElectroCraftDataSourceKind>('rest');
  const [adapter, setAdapter] = useState('rest.fetch');
  const [config, setConfig] = useState('{\n  "baseUrl": "https://api.example.com"\n}');
  const [capabilities, setCapabilities] = useState<readonly ElectroCraftCanonicalDataSourceCapability[]>(['read']);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName('');
    setKey('');
    setKind('rest');
    setAdapter('rest.fetch');
    setConfig('{\n  "baseUrl": "https://api.example.com"\n}');
    setCapabilities(['read']);
    setError(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="ec-data-source-sheet">
        <SheetHeader>
          <SheetTitle>Añadir fuente de datos</SheetTitle>
          <SheetDescription>
            Guarda solo configuración portable. Credenciales y tokens deben vivir fuera del modelo canónico mediante authRef.
          </SheetDescription>
        </SheetHeader>
        <form
          className="ec-data-source-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            try {
              const portableConfig = parseConfig(config);
              void dataSourceWorkspaceRuntime
                .createSource({
                  name,
                  key: key || name,
                  type: kind,
                  adapter,
                  config: portableConfig,
                  capabilities,
                  schemaDiscovery: 'on-demand',
                })
                .then(() => {
                  reset();
                  onOpenChange(false);
                })
                .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudo crear la fuente.'));
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Configuración JSON inválida.');
            }
          }}
        >
          <label>
            <span>Nombre</span>
            <Input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Catálogo API" />
          </label>
          <label>
            <span>Clave</span>
            <Input value={key} onChange={(event) => setKey(event.target.value)} placeholder="catalogApi" />
          </label>
          <label>
            <span>Tipo</span>
            <Select value={kind} onValueChange={(value) => setKind(value as ElectroCraftDataSourceKind)}>
              <SelectTrigger aria-label="Tipo de fuente de datos"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Interna</SelectItem>
                <SelectItem value="rest">REST</SelectItem>
                <SelectItem value="graphql">GraphQL</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="custom">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label>
            <span>Adapter</span>
            <Input required value={adapter} onChange={(event) => setAdapter(event.target.value)} placeholder="rest.fetch" />
            <small>M08.2–M08.5 registrarán adapters concretos; M08.1 mantiene este contrato backend-agnostic.</small>
          </label>
          <fieldset>
            <legend>Capacidades declaradas</legend>
            <div className="ec-data-source-capability-picker">
              {capabilityOptions.map((capability) => (
                <label key={capability}>
                  <input
                    type="checkbox"
                    checked={capabilities.includes(capability)}
                    onChange={(event) =>
                      setCapabilities((current) =>
                        event.target.checked
                          ? [...current, capability]
                          : current.filter((candidate) => candidate !== capability),
                      )
                    }
                  />
                  <span>{capability}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            <span>Configuración portable · base</span>
            <textarea value={config} onChange={(event) => setConfig(event.target.value)} rows={7} spellCheck={false} />
            <small>No introduzcas passwords, API keys, tokens ni Authorization; el schema los rechaza.</small>
          </label>
          {error ? <p className="ec-data-source-error" role="alert">{error}</p> : null}
          <div className="ec-data-source-form-actions">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim() || !adapter.trim() || capabilities.length === 0}>Guardar fuente</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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
    ? dataSourceWorkspaceRuntime.registry.list().find(({ adapterId }) => adapterId === selected.adapterId) ?? null
    : null;

  if (snapshot.state === 'loading' && snapshot.sources.length === 0) {
    return <section className="ec-data-sources-workspace"><p role="status">Cargando fuentes de datos…</p></section>;
  }

  return (
    <section className="ec-data-sources-workspace" data-data-sources-workspace aria-labelledby="ec-data-sources-title">
      <header className="ec-data-sources-header">
        <div className="ec-data-sources-title">
          <span aria-hidden="true"><DataSourceIcon /></span>
          <div>
            <p>Datos</p>
            <div>
              <h2 id="ec-data-sources-title">Fuentes de datos</h2>
              <HelpTrigger helpId="help.section.data-sources" />
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!snapshot.project || snapshot.state === 'saving'}>
          <AddIcon aria-hidden="true" /> Añadir fuente de datos
        </Button>
      </header>

      {!snapshot.project ? (
        <div className="ec-data-sources-empty">
          <strong>Abre un proyecto para configurar sus fuentes de datos.</strong>
          <p>Las conexiones se guardan como objetos canónicos del proyecto; los secrets quedan fuera.</p>
          <Button asChild size="sm"><a href="/">Abrir Proyectos</a></Button>
        </div>
      ) : snapshot.sources.length === 0 ? (
        <div className="ec-data-sources-empty">
          <strong>Todavía no hay fuentes de datos.</strong>
          <p>Añade una fuente portable. Los adapters concretos se incorporan en las siguientes microfases de F08.</p>
          <Button size="sm" onClick={() => setAddOpen(true)}><AddIcon aria-hidden="true" /> Añadir fuente de datos</Button>
        </div>
      ) : (
        <div className="ec-data-sources-layout" data-mobile-detail={detailOpen ? 'true' : 'false'}>
          <aside className="ec-data-sources-list" aria-label="Fuentes de datos">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar fuentes…" aria-label="Buscar fuentes" />
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
                      setActionError(null);
                    }}
                  >
                    <span aria-hidden="true"><DataSourceIcon /></span>
                    <span><strong>{source.label}</strong><small>{source.kind} · {source.adapterId}</small></span>
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
                  <Button className="ec-data-source-mobile-back" size="sm" variant="ghost" onClick={() => setDetailOpen(false)}>← Fuentes</Button>
                  <div><p>{selected.kind}</p><h3>{selected.label}</h3><small>{selected.key}</small></div>
                </div>

                <div className="ec-data-source-detail-grid">
                  <section><span>Adapter</span><strong>{selected.adapterId}</strong></section>
                  <section><span>Auth</span><strong>{selected.authRef ? 'authRef configurado' : 'Sin authRef'}</strong></section>
                  <section><span>Schema discovery</span><strong>{selected.schemaDiscovery ?? 'on-demand'}</strong></section>
                  <section><span>Última actualización</span><strong>{dataSourceWorkspaceRuntime.sourceUpdatedAt(selected.id) ?? 'Sin fecha'}</strong></section>
                </div>

                <section className="ec-data-source-section">
                  <div className="ec-data-source-section-heading"><h4>Entorno</h4>
                    <Select value={environment} onValueChange={(value) => setEnvironment(value as ElectroCraftDataSourceEnvironment)}>
                      <SelectTrigger aria-label="Entorno de la fuente"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <pre>{JSON.stringify({ ...selected.config, ...(selected.environmentOverrides?.[environment] ?? {}) }, null, 2)}</pre>
                  <small>Vista portable resuelta. Los secrets no forman parte de este objeto.</small>
                </section>

                <section className="ec-data-source-section">
                  <h4>Capacidades</h4>
                  <div className="ec-data-source-chips">
                    {dataSourceWorkspaceRuntime.canonicalCapabilities(selected).map((capability) => <span key={capability}>{capability}</span>)}
                  </div>
                </section>

                <section className="ec-data-source-section">
                  <h4>Estado del adapter</h4>
                  {compatibility.length === 0 ? <p>Compatible con las capacidades declaradas.</p> : (
                    <ul>{compatibility.map((diagnostic) => <li key={`${diagnostic.code}-${diagnostic.capability ?? ''}`}>{diagnostic.message}</li>)}</ul>
                  )}
                  {actionError ? <p className="ec-data-source-error" role="alert">{actionError}</p> : null}
                  {snapshot.lastOperation ? <p role="status">{snapshot.lastOperation}</p> : null}
                  <div className="ec-data-source-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={snapshot.state === 'testing'}
                      onClick={() => {
                        setActionError(null);
                        void dataSourceWorkspaceRuntime.testConnection(selected, environment).catch((cause: unknown) =>
                          setActionError(cause instanceof Error ? cause.message : 'No se pudo probar la conexión.'),
                        );
                      }}
                    >Probar conexión</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!adapterDescriptor?.supportsSchemaDiscovery || snapshot.state === 'testing'}
                      onClick={() => {
                        setActionError(null);
                        void dataSourceWorkspaceRuntime.introspectSchema(selected, environment).catch((cause: unknown) =>
                          setActionError(cause instanceof Error ? cause.message : 'No se pudo inspeccionar el esquema.'),
                        );
                      }}
                    >Inspeccionar esquema</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void dataSourceWorkspaceRuntime.deleteSource(selected.id).catch((cause: unknown) =>
                        setActionError(cause instanceof Error ? cause.message : 'No se pudo eliminar la fuente.'),
                      )}
                    >Eliminar</Button>
                  </div>
                  {snapshot.discoveredSchema ? <p>Esquema detectado: <strong>{snapshot.discoveredSchema.name}</strong></p> : null}
                </section>
              </>
            ) : <p>Selecciona una fuente de datos.</p>}
          </article>
        </div>
      )}
      <AddDataSourceSheet open={addOpen} onOpenChange={setAddOpen} />
    </section>
  );
}
