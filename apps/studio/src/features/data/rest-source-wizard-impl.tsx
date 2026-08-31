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
import { createRestDataSourceAdapter, importOpenApiDocument, REST_DATA_ADAPTER_ID } from '@electrocraft/connectors';
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

const steps = ['Endpoint base', 'Autenticación', 'OpenAPI / Manual', 'Operaciones', 'Probar', 'Guardar'] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;
type AuthMode = 'none' | 'secret-ref';
type DefinitionMode = 'openapi' | 'manual';

const objectIdPattern = /^ec_[a-z][a-z0-9-]{1,31}_[0-9a-z]{13}$/;

function normalizeKey(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (/^[A-Za-z]/.test(normalized) ? normalized : `source-${normalized || 'rest'}`).slice(0, 80);
}

function operationKind(method: ElectroCraftRestMethod): ElectroCraftDataOperationDefinition['kind'] {
  if (method === 'GET') return 'read';
  if (method === 'POST') return 'create';
  if (method === 'DELETE') return 'delete';
  return 'update';
}

function operationId(label: string, method: ElectroCraftRestMethod, path: string, used: ReadonlySet<string>) {
  const normalized = (label.trim() || `${method}-${path}`)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const base = (/^[A-Za-z]/.test(normalized) ? normalized : `operation-${normalized || method.toLowerCase()}`).slice(
    0,
    72,
  );
  let candidate = base;
  for (let suffix = 2; used.has(candidate); suffix += 1) candidate = `${base.slice(0, 68)}-${suffix}`;
  return candidate;
}

function pathParameters(path: string) {
  return [...path.matchAll(/\{([^}]+)\}/g)].flatMap((match) =>
    match[1]
      ? [
          {
            name: match[1],
            location: 'path' as const,
            required: true,
            valueType: 'string' as const,
          },
        ]
      : [],
  );
}

function parseHeaders(value: string) {
  const parsed: unknown = JSON.parse(value || '{}');
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new TypeError('Los headers predeterminados deben ser un objeto JSON.');
  }
  return parsed as Record<string, unknown>;
}

function deriveCapabilities(operations: readonly ElectroCraftDataOperationDefinition[]) {
  const result = new Set<ElectroCraftCanonicalDataSourceCapability>();
  for (const operation of operations) {
    result.add(operation.kind);
    if (operation.pagination.kind !== 'none') result.add('pagination');
    const queryNames = operation.parameters
      .filter(({ location }) => location === 'query')
      .map(({ name }) => name.toLowerCase());
    if (queryNames.some((name) => /filter|search|query|(^|_)q$/.test(name))) result.add('filtering');
    if (queryNames.some((name) => /sort|order/.test(name))) result.add('sort');
  }
  return [...result];
}

function Progress({ step }: { readonly step: StepIndex }) {
  return (
    <ol className="ec-rest-wizard-progress" aria-label="Pasos de configuración REST">
      {steps.map((label, index) => (
        <li key={label} data-state={index === step ? 'active' : index < step ? 'complete' : 'pending'}>
          <span aria-hidden="true">{index + 1}</span>
          <strong>{label}</strong>
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
  const [step, setStep] = useState<StepIndex>(0);
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
  const [operations, setOperations] = useState<readonly ElectroCraftDataOperationDefinition[]>([]);
  const [manualMethod, setManualMethod] = useState<ElectroCraftRestMethod>('GET');
  const [manualPath, setManualPath] = useState('/items');
  const [manualLabel, setManualLabel] = useState('Listar items');
  const [manualRequiresAuth, setManualRequiresAuth] = useState(false);
  const [testOperationId, setTestOperationId] = useState('');
  const [testInput, setTestInput] = useState('{}');
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<JsonValue | null>(null);
  const [testAttempted, setTestAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capabilities = useMemo(() => deriveCapabilities(operations), [operations]);
  const testOperation = operations.find(({ id }) => id === testOperationId) ?? operations[0] ?? null;

  function reset() {
    setStep(0);
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
    setOperations([]);
    setManualMethod('GET');
    setManualPath('/items');
    setManualLabel('Listar items');
    setManualRequiresAuth(false);
    setTestOperationId('');
    setTestInput('{}');
    setMessage(null);
    setResult(null);
    setTestAttempted(false);
    setBusy(false);
    setError(null);
  }

  function config() {
    return electroCraftRestDataSourceConfigSchema.parse({
      baseUrl: baseUrl.trim(),
      defaultHeaders: parseHeaders(defaultHeaders),
      timeoutMs: Number(timeoutMs),
      executionMode,
      operations,
    });
  }

  function draftSource() {
    return electroCraftDataSourceDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-source', 'rest-wizard-preview'),
      version: 1,
      key: normalizeKey(key || name),
      label: name.trim(),
      kind: 'rest',
      adapterId: REST_DATA_ADAPTER_ID,
      authRef: authMode === 'secret-ref' ? authRef.trim() : null,
      config: config(),
      environmentScope: ['development', 'preview', 'production'],
      environmentOverrides: {},
      schemaDiscovery: 'manual',
      capabilities,
      metadata: { owner: 'Web Fetch API', definitionMode },
    });
  }

  function validateStep() {
    setError(null);
    if (step === 0) {
      if (!name.trim() || !key.trim()) throw new Error('Completa nombre y clave.');
      config();
    }
    if (step === 1 && authMode === 'secret-ref' && !objectIdPattern.test(authRef.trim())) {
      throw new Error('SecretRef debe ser un ID ElectroCraft válido; nunca pegues aquí el token o API key.');
    }
    if (step === 2 && definitionMode === 'openapi' && operations.length === 0) {
      throw new Error('Importa OpenAPI/Swagger o cambia a configuración manual.');
    }
    if (step === 3 && operations.length === 0) throw new Error('Añade al menos una operación REST.');
    if (step === 4 && !testAttempted) {
      throw new Error('Ejecuta “Probar solicitud” al menos una vez antes de guardar.');
    }
  }

  function next() {
    try {
      validateStep();
      setStep(Math.min(5, step + 1) as StepIndex);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Revisa este paso.');
    }
  }

  async function importOpenApi() {
    setBusy(true);
    setError(null);
    setMessage('Importando OpenAPI…');
    try {
      const imported = await importOpenApiDocument(openApiDocument);
      setOperations(imported.operations);
      setTestOperationId(
        imported.operations.find(({ kind }) => kind === 'read')?.id ?? imported.operations[0]?.id ?? '',
      );
      if (name === 'REST API') setName(imported.title);
      if (imported.suggestedBaseUrl) setBaseUrl(imported.suggestedBaseUrl);
      setMessage(
        `${imported.operations.length} operación(es) importadas${
          imported.warnings.length ? ` · ${imported.warnings.join(' ')}` : ''
        }`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo importar OpenAPI.');
      setMessage(null);
    } finally {
      setBusy(false);
    }
  }

  function addManualOperation() {
    setError(null);
    try {
      const path = manualPath.trim();
      if (!path.startsWith('/')) throw new Error('La ruta manual debe comenzar con /.');
      const id = operationId(manualLabel, manualMethod, path, new Set(operations.map((operation) => operation.id)));
      const candidate = {
        id,
        label: manualLabel.trim() || `${manualMethod} ${path}`,
        kind: operationKind(manualMethod),
        method: manualMethod,
        path,
        requiresAuth: manualRequiresAuth,
        parameters: pathParameters(path),
        inputSchema: null,
        outputSchema: null,
        pagination: { kind: 'none' as const },
      };
      const parsed = electroCraftRestDataSourceConfigSchema.parse({
        ...config(),
        operations: [...operations, candidate],
      });
      setOperations(parsed.operations);
      if (!testOperationId) setTestOperationId(id);
      setManualLabel('');
      setManualPath('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo añadir la operación.');
    }
  }

  async function testRequest() {
    setBusy(true);
    setError(null);
    setMessage('Probando solicitud…');
    setResult(null);
    setTestAttempted(true);
    try {
      if (!testOperation) throw new Error('Selecciona una operación.');
      const source = draftSource();
      const adapter = createRestDataSourceAdapter();
      const context = { source, environment: 'development' as const, config: config() };
      const input = testInput.trim() ? (JSON.parse(testInput) as JsonValue) : undefined;
      const response =
        testOperation.kind === 'read'
          ? await adapter.query(context, { resourceId: testOperation.id, input })
          : await adapter.mutate(context, {
              resourceId: testOperation.id,
              operation: testOperation.kind,
              input,
            });
      setResult(response);
      setMessage('Prueba completada mediante el adapter REST real.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo probar la solicitud.');
      setMessage('Corrige la configuración o usa ConnectorGateway cuando CORS/red privada lo requieran.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      draftSource();
      await dataSourceWorkspaceRuntime.createSource({
        name: name.trim(),
        key: normalizeKey(key || name),
        type: 'rest',
        adapter: REST_DATA_ADAPTER_ID,
        authRef: authMode === 'secret-ref' ? authRef.trim() : null,
        config: config() as unknown as Readonly<Record<string, JsonValue>>,
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
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent side="right" className="ec-rest-source-sheet">
        <SheetHeader>
          <div className="ec-rest-wizard-title-row">
            <SheetTitle>REST API</SheetTitle>
            <HelpTrigger helpId="help.data.rest" />
          </div>
          <SheetDescription>
            Conecta una API sin guardar tokens. Los secretos solo se referencian por SecretRef y se ejecutan mediante
            ConnectorGateway cuando corresponda.
          </SheetDescription>
        </SheetHeader>

        <Progress step={step} />

        <div className="ec-rest-wizard-body">
          {step === 0 ? (
            <section>
              <h3>Endpoint base</h3>
              <p>Define el endpoint y opciones portables.</p>
              <div className="ec-rest-wizard-grid two">
                <label>
                  <span>Nombre</span>
                  <Input autoFocus value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label>
                  <span>Clave</span>
                  <Input value={key} onChange={(event) => setKey(event.target.value)} />
                </label>
              </div>
              <label>
                <span>URL base</span>
                <Input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} inputMode="url" />
              </label>
              <div className="ec-rest-wizard-grid two">
                <label>
                  <span>Timeout (ms)</span>
                  <Input value={timeoutMs} onChange={(event) => setTimeoutMs(event.target.value)} inputMode="numeric" />
                </label>
                <label>
                  <span>Ejecución</span>
                  <Select
                    value={executionMode}
                    onValueChange={(value) => setExecutionMode(value as typeof executionMode)}
                  >
                    <SelectTrigger aria-label="Modo de ejecución REST">
                      <SelectValue />
                    </SelectTrigger>
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
                <textarea
                  rows={5}
                  value={defaultHeaders}
                  onChange={(event) => setDefaultHeaders(event.target.value)}
                  spellCheck={false}
                />
                <small>Authorization, API keys y cookies están bloqueados.</small>
              </label>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h3>Autenticación</h3>
              <p>Las credenciales nunca se guardan en el proyecto.</p>
              <label>
                <span>Modo</span>
                <Select value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
                  <SelectTrigger aria-label="Autenticación REST">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin autenticación</SelectItem>
                    <SelectItem value="secret-ref">SecretRef existente + Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {authMode === 'secret-ref' ? (
                <label>
                  <span>SecretRef</span>
                  <Input value={authRef} onChange={(event) => setAuthRef(event.target.value)} autoComplete="off" />
                  <small>Introduce solo el ID de referencia, nunca bearer token, API key o contraseña.</small>
                </label>
              ) : (
                <div className="ec-rest-wizard-note">
                  <strong>Sin credenciales</strong>
                  <span>Fetch directo solo cuando CORS y la política de seguridad lo permitan.</span>
                </div>
              )}
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h3>OpenAPI / Manual</h3>
              <p>Importa JSON/YAML/Swagger con Scalar o configura operaciones manualmente.</p>
              <label>
                <span>Origen</span>
                <Select value={definitionMode} onValueChange={(value) => setDefinitionMode(value as DefinitionMode)}>
                  <SelectTrigger aria-label="Origen de operaciones REST">
                    <SelectValue />
                  </SelectTrigger>
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
                    <textarea
                      rows={12}
                      value={openApiDocument}
                      onChange={(event) => setOpenApiDocument(event.target.value)}
                      spellCheck={false}
                    />
                  </label>
                  <div className="ec-rest-wizard-inline-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || !openApiDocument.trim()}
                      onClick={() => void importOpenApi()}
                    >
                      Importar OpenAPI
                    </Button>
                    {message ? <p role="status">{message}</p> : null}
                  </div>
                </>
              ) : (
                <div className="ec-rest-wizard-note">
                  <strong>Configuración manual</strong>
                  <span>Añade GET, POST, PUT, PATCH o DELETE en el siguiente paso.</span>
                </div>
              )}
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h3>Operaciones</h3>
              <p>Revisa las operaciones importadas y añade endpoints manuales.</p>
              <div className="ec-rest-operation-list">
                {operations.length === 0 ? <p className="ec-rest-wizard-empty">No hay operaciones todavía.</p> : null}
                {operations.map((operation) => (
                  <article key={operation.id}>
                    <div>
                      <strong>{operation.method}</strong>
                      <span>{operation.path}</span>
                    </div>
                    <div>
                      <span>{operation.label}</span>
                      <small>
                        {operation.kind} · {operation.parameters.length} parámetro(s)
                        {operation.requiresAuth ? ' · auth' : ''}
                      </small>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setOperations((current) => current.filter(({ id }) => id !== operation.id))}
                    >
                      Quitar
                    </Button>
                  </article>
                ))}
              </div>
              <div className="ec-rest-manual-operation">
                <h4>Añadir operación manual</h4>
                <div className="ec-rest-wizard-grid three">
                  <label>
                    <span>Método</span>
                    <Select
                      value={manualMethod}
                      onValueChange={(value) => setManualMethod(value as ElectroCraftRestMethod)}
                    >
                      <SelectTrigger aria-label="Método REST">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label>
                    <span>Ruta</span>
                    <Input value={manualPath} onChange={(event) => setManualPath(event.target.value)} />
                  </label>
                  <label>
                    <span>Nombre</span>
                    <Input value={manualLabel} onChange={(event) => setManualLabel(event.target.value)} />
                  </label>
                </div>
                <label className="ec-rest-checkbox-row">
                  <Checkbox
                    checked={manualRequiresAuth}
                    onCheckedChange={(checked) => setManualRequiresAuth(checked === true)}
                  />
                  <span>Requiere autenticación por SecretRef/Gateway</span>
                </label>
                <Button size="sm" variant="outline" onClick={addManualOperation}>
                  Añadir operación
                </Button>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <h3>Probar solicitud</h3>
              <p>Ejecuta una operación mediante el adapter real. CORS/red privada requieren ConnectorGateway.</p>
              <label>
                <span>Operación</span>
                <Select value={testOperation?.id ?? ''} onValueChange={setTestOperationId}>
                  <SelectTrigger aria-label="Operación REST de prueba">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((operation) => (
                      <SelectItem key={operation.id} value={operation.id}>
                        {operation.method} · {operation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label>
                <span>Input tipado (JSON)</span>
                <textarea
                  rows={9}
                  value={testInput}
                  onChange={(event) => setTestInput(event.target.value)}
                  spellCheck={false}
                />
                <small>{`{"path":{},"query":{},"headers":{},"body":null}`}</small>
              </label>
              {testOperation && testOperation.kind !== 'read' ? (
                <div className="ec-rest-wizard-note warning">
                  <strong>Operación con escritura</strong>
                  <span>La prueba puede modificar datos reales.</span>
                </div>
              ) : null}
              <div className="ec-rest-wizard-inline-actions">
                <Button size="sm" disabled={busy || !testOperation} onClick={() => void testRequest()}>
                  Probar solicitud
                </Button>
                {message ? <p role="status">{message}</p> : null}
              </div>
              {result !== null ? <pre className="ec-rest-test-result">{JSON.stringify(result, null, 2)}</pre> : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <h3>Guardar fuente</h3>
              <p>Revisa el contrato portable antes de guardar.</p>
              <div className="ec-rest-save-summary">
                <section>
                  <span>Fuente</span>
                  <strong>{name}</strong>
                  <small>{normalizeKey(key || name)}</small>
                </section>
                <section>
                  <span>Endpoint</span>
                  <strong>{baseUrl}</strong>
                  <small>{executionMode}</small>
                </section>
                <section>
                  <span>Operaciones</span>
                  <strong>{operations.length}</strong>
                  <small>{capabilities.join(' · ')}</small>
                </section>
                <section>
                  <span>Autenticación</span>
                  <strong>{authMode === 'secret-ref' ? 'SecretRef' : 'Sin autenticación'}</strong>
                  <small>{authMode === 'secret-ref' ? authRef : 'Sin secreto persistido'}</small>
                </section>
              </div>
              <Button disabled={busy} onClick={() => void save()}>
                Guardar fuente
              </Button>
            </section>
          ) : null}

          {error ? (
            <p className="ec-rest-wizard-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="ec-rest-wizard-footer">
          <Button
            variant="outline"
            disabled={step === 0 || busy}
            onClick={() => {
              setError(null);
              setStep(Math.max(0, step - 1) as StepIndex);
            }}
          >
            Atrás
          </Button>
          <span>
            {step + 1} de {steps.length}
          </span>
          {step < 5 ? (
            <Button disabled={busy} onClick={next}>
              Continuar
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cerrar
            </Button>
          )}
        </footer>
      </SheetContent>
    </Sheet>
  );
}
