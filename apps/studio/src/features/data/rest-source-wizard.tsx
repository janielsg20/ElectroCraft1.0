import {
  Button,
  Checkbox,
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
} from '@electrocraft/design-system';
import {
  createRestDataSourceAdapter,
  importOpenApiDocument,
  REST_DATA_ADAPTER_ID,
} from '@electrocraft/connectors';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  electroCraftRestDataSourceConfigSchema,
  type ElectroCraftCanonicalDataSourceCapability,
  type ElectroCraftDataOperationDefinition,
  type ElectroCraftRestMethod,
  type JsonValue,
} from '@electrocraft/domain';
import { useMemo, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import './rest-source-wizard.css';

const steps = Object.freeze([
  { id: 'endpoint', label: 'Endpoint base' },
  { id: 'auth', label: 'Autenticación' },
  { id: 'definition', label: 'OpenAPI / Manual' },
  { id: 'operations', label: 'Operaciones' },
  { id: 'test', label: 'Probar' },
  { id: 'save', label: 'Guardar' },
] as const);

type WizardStep = (typeof steps)[number]['id'];
type DefinitionMode = 'openapi' | 'manual';
type AuthMode = 'none' | 'secret-ref';

const objectIdPattern = /^ec_[a-z][a-z0-9-]{1,31}_[0-9a-z]{13}$/;

function normalizeKey(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const prefixed = /^[A-Za-z]/.test(normalized) ? normalized : `source-${normalized || 'rest'}`;
  return prefixed.slice(0, 80);
}

function operationKind(method: ElectroCraftRestMethod): ElectroCraftDataOperationDefinition['kind'] {
  if (method === 'GET') return 'read';
  if (method === 'POST') return 'create';
  if (method === 'DELETE') return 'delete';
  return 'update';
}

function operationId(label: string, method: ElectroCraftRestMethod, path: string, used: ReadonlySet<string>) {
  const seed = (label.trim() || `${method}-${path}`)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const prefix = /^[A-Za-z]/.test(seed) ? seed : `operation-${seed || method.toLowerCase()}`;
  const base = prefix.slice(0, 72);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, Math.max(1, 72 - String(suffix).length - 1))}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function pathParameters(path: string) {
  const names = [...path.matchAll(/\{([^}]+)\}/g)].flatMap((match) => (match[1] ? [match[1]] : []));
  return names.map((name) => ({
    name,
    location: 'path' as const,
    required: true,
    valueType: 'string' as const,
  }));
}

function parseHeaders(value: string) {
  const parsed: unknown = JSON.parse(value || '{}');
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new TypeError('Los headers predeterminados deben ser un objeto JSON.');
  }
  return parsed as Record<string, unknown>;
}

function parseInput(value: string): JsonValue | undefined {
  if (!value.trim()) return undefined;
  return JSON.parse(value) as JsonValue;
}

function deriveCapabilities(operations: readonly ElectroCraftDataOperationDefinition[]) {
  const result = new Set<ElectroCraftCanonicalDataSourceCapability>();
  for (const operation of operations) {
    result.add(operation.kind);
    if (operation.pagination.kind !== 'none') result.add('pagination');
    const queryNames = operation.parameters
      .filter(({ location }) => location === 'query')
      .map(({ name }) => name.toLocaleLowerCase('en'));
    if (queryNames.some((name) => /filter|search|query|(^|_)q$/.test(name))) result.add('filtering');
    if (queryNames.some((name) => /sort|order/.test(name))) result.add('sort');
  }
  return Object.freeze([...result]);
}

function WizardProgress({ step }: { readonly step: WizardStep }) {
  const activeIndex = steps.findIndex(({ id }) => id === step);
  return (
    <ol className="ec-rest-wizard-progress" aria-label="Pasos de configuración REST">
      {steps.map((item, index) => (
        <li key={item.id} data-state={index === activeIndex ? 'active' : index < activeIndex ? 'complete' : 'pending'}>
          <span aria-hidden="true">{index + 1}</span>
          <strong>{item.label}</strong>
        </li>
      ))}
    </ol>
  );
}

export function RestSourceWizardSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<WizardStep>('endpoint');
  const [name, setName] = useState('REST API');
  const [key, setKey] = useState('restApi');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [defaultHeaders, setDefaultHeaders] = useState('{}');
  const [timeoutMs, setTimeoutMs] = useState('15000');
  const [executionMode, setExecutionMode] = useState<'auto' | 'browser' | 'gateway'>('auto');
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [authRef, setAuthRef] = useState('');
  const [definitionMode, setDefinitionMode] = useState<DefinitionMode>('openapi');
  const [openApiDocument, setOpenApiDocument] = useState('');
  const [openApiMessage, setOpenApiMessage] = useState<string | null>(null);
  const [operations, setOperations] = useState<readonly ElectroCraftDataOperationDefinition[]>([]);
  const [manualMethod, setManualMethod] = useState<ElectroCraftRestMethod>('GET');
  const [manualPath, setManualPath] = useState('/items');
  const [manualLabel, setManualLabel] = useState('Listar items');
  const [manualRequiresAuth, setManualRequiresAuth] = useState(false);
  const [testOperationId, setTestOperationId] = useState('');
  const [testInput, setTestInput] = useState('{}');
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<JsonValue | null>(null);
  const [testAttempted, setTestAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeIndex = steps.findIndex(({ id }) => id === step);
  const capabilities = useMemo(() => deriveCapabilities(operations), [operations]);
  const selectedTestOperation = operations.find(({ id }) => id === testOperationId) ?? operations[0] ?? null;

  function reset() {
    setStep('endpoint');
    setName('REST API');
    setKey('restApi');
    setBaseUrl('https://api.example.com');
    setDefaultHeaders('{}');
    setTimeoutMs('15000');
    setExecutionMode('auto');
    setAuthMode('none');
    setAuthRef('');
    setDefinitionMode('openapi');
    setOpenApiDocument('');
    setOpenApiMessage(null);
    setOperations([]);
    setManualMethod('GET');
    setManualPath('/items');
    setManualLabel('Listar items');
    setManualRequiresAuth(false);
    setTestOperationId('');
    setTestInput('{}');
    setTestMessage(null);
    setTestResult(null);
    setTestAttempted(false);
    setBusy(false);
    setError(null);
  }

  function buildConfig() {
    return electroCraftRestDataSourceConfigSchema.parse({
      baseUrl: baseUrl.trim(),
      defaultHeaders: parseHeaders(defaultHeaders),
      timeoutMs: Number(timeoutMs),
      executionMode,
      operations,
    });
  }

  function buildDraftSource() {
    const config = buildConfig();
    return electroCraftDataSourceDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-source', 'rest-wizard-preview'),
      version: 1,
      key: normalizeKey(key || name),
      label: name.trim(),
      kind: 'rest',
      adapterId: REST_DATA_ADAPTER_ID,
      authRef: authMode === 'secret-ref' ? authRef.trim() : null,
      config,
      environmentScope: ['development', 'preview', 'production'],
      environmentOverrides: {},
      schemaDiscovery: 'manual',
      capabilities,
      metadata: {
        owner: 'Web Fetch API',
        definitionMode,
      },
    });
  }

  function validateCurrentStep() {
    setError(null);
    if (step === 'endpoint') {
      if (!name.trim()) throw new Error('Escribe un nombre para la fuente REST.');
      if (!key.trim()) throw new Error('Escribe una clave portable para la fuente REST.');
      buildConfig();
      return;
    }
    if (step === 'auth') {
      if (authMode === 'secret-ref' && !objectIdPattern.test(authRef.trim())) {
        throw new Error('SecretRef debe ser un ID ElectroCraft válido; nunca pegues aquí el token o API key.');
      }
      return;
    }
    if (step === 'definition') {
      if (definitionMode === 'openapi' && operations.length === 0) {
        throw new Error('Importa un documento OpenAPI/Swagger antes de continuar o cambia a configuración manual.');
      }
      return;
    }
    if (step === 'operations') {
      if (operations.length === 0) throw new Error('Añade al menos una operación REST.');
      buildConfig();
      return;
    }
    if (step === 'test' && !testAttempted) {
      throw new Error('Ejecuta “Probar solicitud” al menos una vez antes de guardar.');
    }
  }

  function goNext() {
    try {
      validateCurrentStep();
      const next = steps[Math.min(activeIndex + 1, steps.length - 1)];
      setStep(next.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Revisa los datos de este paso.');
    }
  }

  function goBack() {
    setError(null);
    setStep(steps[Math.max(activeIndex - 1, 0)].id);
  }

  async function importOpenApi() {
    setBusy(true);
    setError(null);
    setOpenApiMessage('Importando OpenAPI…');
    try {
      const imported = await importOpenApiDocument(openApiDocument);
      setOperations(imported.operations);
      setTestOperationId(imported.operations.find(({ kind }) => kind === 'read')?.id ?? imported.operations[0]?.id ?? '');
      if (name === 'REST API' && imported.title) setName(imported.title);
      if (imported.suggestedBaseUrl) setBaseUrl(imported.suggestedBaseUrl);
      setOpenApiMessage(
        imported.warnings.length > 0
          ? `${imported.operations.length} operación(es) importadas. ${imported.warnings.join(' ')}`
          : `${imported.operations.length} operación(es) importadas desde OpenAPI ${imported.version}.`,
      );
    } catch (cause) {
      setOpenApiMessage(null);
      setError(cause instanceof Error ? cause.message : 'No se pudo importar el documento OpenAPI.');
    } finally {
      setBusy(false);
    }
  }

  function addManualOperation() {
    setError(null);
    try {
      if (!manualPath.trim().startsWith('/')) throw new Error('La ruta manual debe comenzar con /.');
      const id = operationId(manualLabel, manualMethod, manualPath, new Set(operations.map(({ id: value }) => value)));
      const next: ElectroCraftDataOperationDefinition = {
        id,
        label: manualLabel.trim() || `${manualMethod} ${manualPath.trim()}`,
        kind: operationKind(manualMethod),
        method: manualMethod,
        path: manualPath.trim(),
        requiresAuth: manualRequiresAuth,
        parameters: pathParameters(manualPath.trim()),
        inputSchema: null,
        outputSchema: null,
        pagination: { kind: 'none' },
      };
      const parsed = electroCraftRestDataSourceConfigSchema.parse({
        baseUrl: baseUrl.trim(),
        defaultHeaders: parseHeaders(defaultHeaders),
        timeoutMs: Number(timeoutMs),
        executionMode,
        operations: [...operations, next],
      });
      setOperations(parsed.operations);
      if (!testOperationId || (next.kind === 'read' && !operations.some(({ kind }) => kind === 'read'))) setTestOperationId(id);
      setManualLabel('');
      setManualPath('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo añadir la operación.');
    }
  }

  async function testRequest() {
    setBusy(true);
    setError(null);
    setTestAttempted(true);
    setTestResult(null);
    setTestMessage('Probando solicitud…');
    try {
      const source = buildDraftSource();
      const adapter = createRestDataSourceAdapter();
      const context = { source, environment: 'development' as const, config: buildConfig() };
      const operation = selectedTestOperation;
      if (!operation) throw new Error('No hay una operación REST para probar.');
      const input = parseInput(testInput);
      const result =
        operation.kind === 'read'
          ? await adapter.query(context, { resourceId: operation.id, input })
          : await adapter.mutate(context, { resourceId: operation.id, operation: operation.kind, input });
      setTestResult(result);
      const normalized = result as unknown as { ok?: boolean; status?: number | null; transport?: string };
      setTestMessage(
        normalized.ok
          ? `Solicitud correcta${normalized.status ? ` · HTTP ${normalized.status}` : ''} · ${normalized.transport ?? 'REST'}.`
          : `La solicitud respondió con error${normalized.status ? ` HTTP ${normalized.status}` : ''}.`,
      );
    } catch (cause) {
      setTestMessage('La prueba no pudo completarse. Puedes corregirla o guardar la fuente para configurar Gateway/SecretRef después.');
      setError(cause instanceof Error ? cause.message : 'No se pudo probar la solicitud REST.');
    } finally {
      setBusy(false);
    }
  }

  async function saveSource() {
    setBusy(true);
    setError(null);
    try {
      const config = buildConfig();
      buildDraftSource();
      await dataSourceWorkspaceRuntime.createSource({
        name: name.trim(),
        key: normalizeKey(key || name),
        type: 'rest',
        adapter: REST_DATA_ADAPTER_ID,
        authRef: authMode === 'secret-ref' ? authRef.trim() : null,
        config: config as unknown as Readonly<Record<string, JsonValue>>,
        capabilities,
        schemaDiscovery: 'manual',
      });
      reset();
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la fuente REST.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="ec-rest-source-sheet">
        <SheetHeader>
          <div className="ec-rest-wizard-title-row">
            <SheetTitle>REST API</SheetTitle>
            <HelpTrigger helpId="help.data.sources" />
          </div>
          <SheetDescription>
            Conecta una API sin guardar tokens en el proyecto. Los secretos solo se referencian por SecretRef y se ejecutan mediante ConnectorGateway cuando corresponda.
          </SheetDescription>
        </SheetHeader>

        <WizardProgress step={step} />

        <div className="ec-rest-wizard-body">
          {step === 'endpoint' ? (
            <section aria-labelledby="ec-rest-step-endpoint">
              <h3 id="ec-rest-step-endpoint">Endpoint base</h3>
              <p>Define el endpoint y las opciones de transporte portables.</p>
              <div className="ec-rest-wizard-grid two">
                <label><span>Nombre</span><Input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Catálogo REST" /></label>
                <label><span>Clave</span><Input value={key} onChange={(event) => setKey(event.target.value)} placeholder="catalogApi" /></label>
              </div>
              <label><span>URL base</span><Input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} inputMode="url" placeholder="https://api.example.com" /></label>
              <div className="ec-rest-wizard-grid two">
                <label><span>Timeout (ms)</span><Input value={timeoutMs} onChange={(event) => setTimeoutMs(event.target.value)} inputMode="numeric" /></label>
                <label>
                  <span>Ejecución</span>
                  <Select value={executionMode} onValueChange={(value) => setExecutionMode(value as 'auto' | 'browser' | 'gateway')}>
                    <SelectTrigger aria-label="Modo de ejecución REST"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto · navegador y fallback</SelectItem>
                      <SelectItem value="browser">Solo navegador</SelectItem>
                      <SelectItem value="gateway">Solo ConnectorGateway</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <label>
                <span>Headers predeterminados no sensibles</span>
                <textarea rows={5} value={defaultHeaders} onChange={(event) => setDefaultHeaders(event.target.value)} spellCheck={false} />
                <small>Authorization, API keys, cookies y otros secretos están bloqueados por el contrato.</small>
              </label>
            </section>
          ) : null}

          {step === 'auth' ? (
            <section aria-labelledby="ec-rest-step-auth">
              <h3 id="ec-rest-step-auth">Autenticación</h3>
              <p>Selecciona cómo se resolverán credenciales sin persistir valores secretos.</p>
              <label>
                <span>Modo</span>
                <Select value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
                  <SelectTrigger aria-label="Autenticación REST"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin autenticación</SelectItem>
                    <SelectItem value="secret-ref">SecretRef existente + Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {authMode === 'secret-ref' ? (
                <label>
                  <span>SecretRef</span>
                  <Input value={authRef} onChange={(event) => setAuthRef(event.target.value)} placeholder="ec_secret-..." autoComplete="off" />
                  <small>Introduce solo el ID de referencia. No pegues bearer tokens, API keys ni contraseñas.</small>
                </label>
              ) : (
                <div className="ec-rest-wizard-note"><strong>Sin credenciales</strong><span>La API se ejecutará directamente desde el navegador cuando CORS y la política de seguridad lo permitan.</span></div>
              )}
            </section>
          ) : null}

          {step === 'definition' ? (
            <section aria-labelledby="ec-rest-step-definition">
              <h3 id="ec-rest-step-definition">OpenAPI / Manual</h3>
              <p>Importa OpenAPI/Swagger con Scalar o define las operaciones manualmente.</p>
              <label>
                <span>Origen de operaciones</span>
                <Select value={definitionMode} onValueChange={(value) => setDefinitionMode(value as DefinitionMode)}>
                  <SelectTrigger aria-label="Origen de operaciones REST"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openapi">Importar OpenAPI / Swagger</SelectItem>
                    <SelectItem value="manual">Configurar manualmente</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {definitionMode === 'openapi' ? (
                <>
                  <label>
                    <span>Documento OpenAPI JSON/YAML</span>
                    <textarea rows={12} value={openApiDocument} onChange={(event) => setOpenApiDocument(event.target.value)} spellCheck={false} placeholder="openapi: 3.1.0\ninfo:\n  title: Mi API\n..." />
                  </label>
                  <div className="ec-rest-wizard-inline-actions">
                    <Button type="button" size="sm" variant="outline" disabled={busy || !openApiDocument.trim()} onClick={() => void importOpenApi()}>
                      {busy ? 'Importando…' : 'Importar OpenAPI'}
                    </Button>
                    {openApiMessage ? <p role="status">{openApiMessage}</p> : null}
                  </div>
                </>
              ) : (
                <div className="ec-rest-wizard-note"><strong>Configuración manual</strong><span>En el siguiente paso podrás añadir operaciones GET, POST, PUT, PATCH y DELETE con path params tipados.</span></div>
              )}
            </section>
          ) : null}

          {step === 'operations' ? (
            <section aria-labelledby="ec-rest-step-operations">
              <h3 id="ec-rest-step-operations">Operaciones</h3>
              <p>Revisa las operaciones importadas y añade endpoints manuales cuando sea necesario.</p>
              <div className="ec-rest-operation-list">
                {operations.length === 0 ? <p className="ec-rest-wizard-empty">No hay operaciones todavía.</p> : null}
                {operations.map((operation) => (
                  <article key={operation.id}>
                    <div><strong>{operation.method}</strong><span>{operation.path}</span></div>
                    <div><span>{operation.label}</span><small>{operation.kind} · {operation.parameters.length} parámetro(s){operation.requiresAuth ? ' · auth' : ''}</small></div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setOperations((current) => current.filter(({ id }) => id !== operation.id))}>Quitar</Button>
                  </article>
                ))}
              </div>
              <div className="ec-rest-manual-operation">
                <h4>Añadir operación manual</h4>
                <div className="ec-rest-wizard-grid three">
                  <label>
                    <span>Método</span>
                    <Select value={manualMethod} onValueChange={(value) => setManualMethod(value as ElectroCraftRestMethod)}>
                      <SelectTrigger aria-label="Método REST"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </label>
                  <label><span>Ruta</span><Input value={manualPath} onChange={(event) => setManualPath(event.target.value)} placeholder="/items/{id}" /></label>
                  <label><span>Nombre</span><Input value={manualLabel} onChange={(event) => setManualLabel(event.target.value)} placeholder="Obtener item" /></label>
                </div>
                <label className="ec-rest-checkbox-row">
                  <Checkbox checked={manualRequiresAuth} onCheckedChange={(checked) => setManualRequiresAuth(checked === true)} />
                  <span>Requiere autenticación por SecretRef/Gateway</span>
                </label>
                <Button type="button" size="sm" variant="outline" onClick={addManualOperation}>Añadir operación</Button>
              </div>
            </section>
          ) : null}

          {step === 'test' ? (
            <section aria-labelledby="ec-rest-step-test">
              <h3 id="ec-rest-step-test">Probar solicitud</h3>
              <p>Ejecuta una operación mediante el adapter real. Si CORS o una red privada bloquean el navegador, el resultado indicará que se necesita ConnectorGateway.</p>
              <label>
                <span>Operación</span>
                <Select value={selectedTestOperation?.id ?? ''} onValueChange={setTestOperationId}>
                  <SelectTrigger aria-label="Operación REST de prueba"><SelectValue placeholder="Selecciona una operación" /></SelectTrigger>
                  <SelectContent>
                    {operations.map((operation) => <SelectItem key={operation.id} value={operation.id}>{operation.method} · {operation.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label>
                <span>Input tipado (JSON)</span>
                <textarea rows={9} value={testInput} onChange={(event) => setTestInput(event.target.value)} spellCheck={false} />
                <small>Usa {`{"path":{},"query":{},"headers":{},"body":null}`} según los parámetros de la operación.</small>
              </label>
              {selectedTestOperation && selectedTestOperation.kind !== 'read' ? (
                <div className="ec-rest-wizard-note warning"><strong>Operación con escritura</strong><span>Esta prueba puede modificar datos reales en el endpoint configurado.</span></div>
              ) : null}
              <div className="ec-rest-wizard-inline-actions">
                <Button type="button" size="sm" disabled={busy || !selectedTestOperation} onClick={() => void testRequest()}>{busy ? 'Probando…' : 'Probar solicitud'}</Button>
                {testMessage ? <p role="status">{testMessage}</p> : null}
              </div>
              {testResult !== null ? <pre className="ec-rest-test-result">{JSON.stringify(testResult, null, 2)}</pre> : null}
            </section>
          ) : null}

          {step === 'save' ? (
            <section aria-labelledby="ec-rest-step-save">
              <h3 id="ec-rest-step-save">Guardar fuente</h3>
              <p>Revisa el contrato portable. Ningún valor secreto se guardará dentro del proyecto.</p>
              <div className="ec-rest-save-summary">
                <section><span>Fuente</span><strong>{name}</strong><small>{normalizeKey(key || name)}</small></section>
                <section><span>Endpoint</span><strong>{baseUrl}</strong><small>{executionMode}</small></section>
                <section><span>Operaciones</span><strong>{operations.length}</strong><small>{capabilities.join(' · ') || 'sin capacidades'}</small></section>
                <section><span>Autenticación</span><strong>{authMode === 'secret-ref' ? 'SecretRef' : 'Sin autenticación'}</strong><small>{authMode === 'secret-ref' ? authRef : 'Sin secreto persistido'}</small></section>
              </div>
              <Button type="button" disabled={busy} onClick={() => void saveSource()}>{busy ? 'Guardando…' : 'Guardar fuente'}</Button>
            </section>
          ) : null}

          {error ? <p className="ec-rest-wizard-error" role="alert">{error}</p> : null}
        </div>

        <footer className="ec-rest-wizard-footer">
          <Button type="button" variant="outline" disabled={activeIndex === 0 || busy} onClick={goBack}>Atrás</Button>
          <span>{activeIndex + 1} de {steps.length}</span>
          {step !== 'save' ? <Button type="button" disabled={busy} onClick={goNext}>Continuar</Button> : <Button type="button" variant="outline" disabled={busy} onClick={() => { reset(); onOpenChange(false); }}>Cerrar</Button>}
        </footer>
      </SheetContent>
    </Sheet>
  );
}
