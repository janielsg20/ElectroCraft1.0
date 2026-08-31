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
import { createGraphQLDataSourceAdapter, GRAPHQL_DATA_ADAPTER_ID } from '@electrocraft/connectors';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  electroCraftGraphQLDataSourceConfigSchema,
  electroCraftGraphQLVariableSchema,
  type ElectroCraftCanonicalDataSourceCapability,
  type ElectroCraftGraphQLOperationDefinition,
  type ElectroCraftGraphQLVariable,
  type JsonValue,
} from '@electrocraft/domain';
import { useMemo, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import './rest-source-wizard.css';

const steps = ['Endpoint', 'Autenticación', 'Esquema', 'Consultas / Mutaciones', 'Probar', 'Guardar'] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;
type AuthMode = 'none' | 'secret-ref';

const objectIdPattern = /^ec_[a-z][a-z0-9-]{1,31}_[0-9a-z]{13}$/;

function normalizeKey(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (/^[A-Za-z]/.test(normalized) ? normalized : `source-${normalized || 'graphql'}`).slice(0, 80);
}

function parseHeaders(value: string) {
  const parsed: unknown = JSON.parse(value || '{}');
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new TypeError('Los headers predeterminados deben ser un objeto JSON.');
  }
  return parsed as Record<string, unknown>;
}

function parseVariables(value: string): readonly ElectroCraftGraphQLVariable[] {
  const parsed: unknown = JSON.parse(value || '[]');
  if (!Array.isArray(parsed)) throw new TypeError('Variables debe ser un array JSON.');
  return parsed.map((variable) => electroCraftGraphQLVariableSchema.parse(variable));
}

function deriveCapabilities(operations: readonly ElectroCraftGraphQLOperationDefinition[]) {
  const values = new Set<ElectroCraftCanonicalDataSourceCapability>();
  for (const operation of operations) values.add(operation.kind);
  return [...values];
}

function operationId(operationType: 'query' | 'mutation', fieldName: string, used: ReadonlySet<string>) {
  const base = `${operationType}_${fieldName}`.replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 72);
  let candidate = /^[A-Za-z]/.test(base) ? base : `operation-${base}`;
  for (let suffix = 2; used.has(candidate); suffix += 1) candidate = `${base.slice(0, 68)}-${suffix}`;
  return candidate;
}

function Progress({ step }: { readonly step: StepIndex }) {
  return (
    <ol className="ec-rest-wizard-progress" aria-label="Pasos de configuración GraphQL">
      {steps.map((label, index) => (
        <li key={label} data-state={index === step ? 'active' : index < step ? 'complete' : 'pending'}>
          <span aria-hidden="true">{index + 1}</span>
          <strong>{label}</strong>
        </li>
      ))}
    </ol>
  );
}

export function GraphQLSourceWizardSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<StepIndex>(0);
  const [name, setName] = useState('GraphQL');
  const [key, setKey] = useState('graphQL');
  const [endpoint, setEndpoint] = useState('https://api.example.com/graphql');
  const [defaultHeaders, setDefaultHeaders] = useState('{}');
  const [timeoutMs, setTimeoutMs] = useState('15000');
  const [executionMode, setExecutionMode] = useState<'auto' | 'browser' | 'gateway'>('auto');
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [authRef, setAuthRef] = useState('');
  const [introspectionEnabled, setIntrospectionEnabled] = useState(true);
  const [operations, setOperations] = useState<readonly ElectroCraftGraphQLOperationDefinition[]>([]);
  const [operationType, setOperationType] = useState<'query' | 'mutation'>('query');
  const [mutationKind, setMutationKind] = useState<'create' | 'update' | 'delete'>('update');
  const [fieldName, setFieldName] = useState('items');
  const [operationLabel, setOperationLabel] = useState('Listar items');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [variableDefinitions, setVariableDefinitions] = useState('[]');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rawDocument, setRawDocument] = useState('query Items { items { __typename } }');
  const [testOperationId, setTestOperationId] = useState('');
  const [testVariables, setTestVariables] = useState('{}');
  const [result, setResult] = useState<JsonValue | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [testAttempted, setTestAttempted] = useState(false);

  const capabilities = useMemo(() => deriveCapabilities(operations), [operations]);
  const testOperation = operations.find(({ id }) => id === testOperationId) ?? operations[0] ?? null;

  function reset() {
    setStep(0);
    setName('GraphQL');
    setKey('graphQL');
    setEndpoint('https://api.example.com/graphql');
    setDefaultHeaders('{}');
    setTimeoutMs('15000');
    setExecutionMode('auto');
    setAuthMode('none');
    setAuthRef('');
    setIntrospectionEnabled(true);
    setOperations([]);
    setOperationType('query');
    setMutationKind('update');
    setFieldName('items');
    setOperationLabel('Listar items');
    setRequiresAuth(false);
    setVariableDefinitions('[]');
    setAdvancedOpen(false);
    setRawDocument('query Items { items { __typename } }');
    setTestOperationId('');
    setTestVariables('{}');
    setResult(null);
    setMessage(null);
    setError(null);
    setBusy(false);
    setTestAttempted(false);
  }

  function config() {
    return electroCraftGraphQLDataSourceConfigSchema.parse({
      endpoint: endpoint.trim(),
      defaultHeaders: parseHeaders(defaultHeaders),
      timeoutMs: Number(timeoutMs),
      executionMode,
      introspectionEnabled,
      operations,
    });
  }

  function draftSource() {
    return electroCraftDataSourceDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-source', 'graphql-wizard-preview'),
      version: 1,
      key: normalizeKey(key || name),
      label: name.trim(),
      kind: 'graphql',
      adapterId: GRAPHQL_DATA_ADAPTER_ID,
      authRef: authMode === 'secret-ref' ? authRef.trim() : null,
      config: config(),
      environmentScope: ['development', 'preview', 'production'],
      environmentOverrides: {},
      schemaDiscovery: introspectionEnabled ? 'on-demand' : 'manual',
      capabilities,
      metadata: { owner: 'GraphQL over fetch + DataSourceAdapter' },
    });
  }

  function validateStep() {
    if (step === 0) {
      if (!name.trim() || !key.trim()) throw new Error('Completa nombre y clave.');
      config();
    }
    if (step === 1 && authMode === 'secret-ref' && !objectIdPattern.test(authRef.trim())) {
      throw new Error('SecretRef debe ser un ID ElectroCraft válido; nunca pegues un token o API key.');
    }
    if (step === 2 && operations.length === 0 && !introspectionEnabled) {
      throw new Error('Activa introspection o añade una operación manual en el siguiente paso.');
    }
    if (step === 3 && operations.length === 0) throw new Error('Añade al menos una consulta o mutación.');
    if (step === 4 && !testAttempted) throw new Error('Ejecuta “Probar” al menos una vez antes de guardar.');
  }

  function next() {
    setError(null);
    try {
      validateStep();
      setStep(Math.min(5, step + 1) as StepIndex);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Revisa este paso.');
    }
  }

  async function introspect() {
    setBusy(true);
    setError(null);
    setMessage('Inspeccionando esquema…');
    try {
      const source = draftSource();
      const adapter = createGraphQLDataSourceAdapter();
      const snapshot = await adapter.introspect({ source, environment: 'development', config: config() });
      setOperations(snapshot.operations);
      setTestOperationId(snapshot.operations[0]?.id ?? '');
      setMessage(`${snapshot.operations.length} operación(es) detectadas por introspection.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo inspeccionar el esquema GraphQL.');
      setMessage('Si introspection está bloqueada, configura operaciones manuales desde Advanced.');
    } finally {
      setBusy(false);
    }
  }

  function addManualOperation() {
    setError(null);
    try {
      if (!advancedOpen) throw new Error('Abre Advanced para definir el documento GraphQL manual.');
      if (!fieldName.trim() || !rawDocument.trim()) throw new Error('Completa field y documento GraphQL.');
      const variables = [...parseVariables(variableDefinitions)];
      const candidate: ElectroCraftGraphQLOperationDefinition = {
        id: operationId(operationType, fieldName.trim(), new Set(operations.map(({ id }) => id))),
        label: operationLabel.trim() || fieldName.trim(),
        operationType,
        kind: operationType === 'query' ? 'read' : mutationKind,
        fieldName: fieldName.trim(),
        document: rawDocument.trim(),
        requiresAuth,
        variables,
        outputSchema: null,
      };
      const parsed = electroCraftGraphQLDataSourceConfigSchema.parse({
        ...config(),
        operations: [...operations, candidate],
      });
      setOperations(parsed.operations);
      if (!testOperationId) setTestOperationId(candidate.id);
      setMessage('Operación manual añadida.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo añadir la operación GraphQL.');
    }
  }

  async function testRequest() {
    setBusy(true);
    setError(null);
    setResult(null);
    setMessage('Probando GraphQL…');
    setTestAttempted(true);
    try {
      if (!testOperation) throw new Error('Selecciona una operación.');
      const source = draftSource();
      const adapter = createGraphQLDataSourceAdapter();
      const input = testVariables.trim() ? ({ variables: JSON.parse(testVariables) } as JsonValue) : undefined;
      const context = { source, environment: 'development' as const, config: config() };
      const response =
        testOperation.kind === 'read'
          ? await adapter.query(context, { resourceId: testOperation.id, input })
          : await adapter.mutate(context, { resourceId: testOperation.id, operation: testOperation.kind, input });
      setResult(response);
      setMessage('Prueba completada mediante GraphQLDataSourceAdapter.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo probar GraphQL.');
      setMessage('Corrige la operación o usa ConnectorGateway si CORS/secret policy lo requiere.');
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
        type: 'graphql',
        adapter: GRAPHQL_DATA_ADAPTER_ID,
        authRef: authMode === 'secret-ref' ? authRef.trim() : null,
        config: config() as unknown as Readonly<Record<string, JsonValue>>,
        capabilities,
        schemaDiscovery: introspectionEnabled ? 'on-demand' : 'manual',
      });
      reset();
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la fuente GraphQL.');
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
      <SheetContent side="right" className="ec-rest-source-sheet ec-graphql-source-sheet" data-graphql-source-wizard>
        <SheetHeader>
          <div className="ec-rest-wizard-title-row">
            <SheetTitle>GraphQL</SheetTitle>
            <HelpTrigger helpId="help.data.graphql" />
          </div>
          <SheetDescription>
            Conecta GraphQL con introspection, operaciones y variables tipadas. Secrets solo por SecretRef/Gateway.
          </SheetDescription>
        </SheetHeader>
        <Progress step={step} />

        <div className="ec-rest-wizard-body">
          {step === 0 ? (
            <section>
              <h3>Endpoint</h3>
              <p>Define el endpoint GraphQL y el transporte portable.</p>
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
                <span>Endpoint</span>
                <Input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} inputMode="url" />
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
                    <SelectTrigger aria-label="Modo de ejecución GraphQL">
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
                <span>Headers no sensibles</span>
                <textarea
                  rows={5}
                  value={defaultHeaders}
                  onChange={(event) => setDefaultHeaders(event.target.value)}
                  spellCheck={false}
                />
                <small>Authorization, cookies y API keys están bloqueados.</small>
              </label>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h3>Autenticación</h3>
              <p>Las credenciales nunca forman parte del proyecto portable.</p>
              <label>
                <span>Modo</span>
                <Select value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
                  <SelectTrigger aria-label="Autenticación GraphQL">
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
                </label>
              ) : (
                <div className="ec-rest-wizard-note">
                  <strong>Sin credenciales</strong>
                  <span>Fetch directo solo si CORS lo permite.</span>
                </div>
              )}
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h3>Esquema</h3>
              <p>Usa introspection cuando el endpoint lo permita.</p>
              <label className="ec-rest-checkbox-row">
                <Checkbox
                  checked={introspectionEnabled}
                  onCheckedChange={(checked) => setIntrospectionEnabled(checked === true)}
                />
                <span>Permitir introspection para esta fuente</span>
              </label>
              <Button
                size="sm"
                variant="outline"
                disabled={busy || !introspectionEnabled}
                onClick={() => void introspect()}
              >
                Inspeccionar esquema
              </Button>
              {message ? <p role="status">{message}</p> : null}
              {operations.length > 0 ? (
                <p>{operations.length} operación(es) disponibles.</p>
              ) : (
                <p className="ec-rest-wizard-empty">Sin operaciones detectadas todavía.</p>
              )}
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h3>Consultas / Mutaciones</h3>
              <p>Las operaciones de introspection aparecen aquí. La edición raw permanece en Advanced.</p>
              <div className="ec-rest-operation-list">
                {operations.map((operation) => (
                  <article key={operation.id}>
                    <div>
                      <strong>{operation.operationType === 'query' ? 'Query' : 'Mutation'}</strong>
                      <span>{operation.fieldName}</span>
                    </div>
                    <div>
                      <span>{operation.label}</span>
                      <small>
                        {operation.kind} · {operation.variables.length} variable(s)
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAdvancedOpen((current) => !current)}
                aria-expanded={advancedOpen}
              >
                Advanced
              </Button>
              {advancedOpen ? (
                <div className="ec-rest-manual-operation" data-graphql-advanced>
                  <h4>Operación manual</h4>
                  <div className="ec-rest-wizard-grid two">
                    <label>
                      <span>Tipo</span>
                      <Select
                        value={operationType}
                        onValueChange={(value) => setOperationType(value as typeof operationType)}
                      >
                        <SelectTrigger aria-label="Tipo de operación GraphQL">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="query">Query</SelectItem>
                          <SelectItem value="mutation">Mutation</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    {operationType === 'mutation' ? (
                      <label>
                        <span>Capability</span>
                        <Select
                          value={mutationKind}
                          onValueChange={(value) => setMutationKind(value as typeof mutationKind)}
                        >
                          <SelectTrigger aria-label="Capability de mutación GraphQL">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create">create</SelectItem>
                            <SelectItem value="update">update</SelectItem>
                            <SelectItem value="delete">delete</SelectItem>
                          </SelectContent>
                        </Select>
                      </label>
                    ) : null}
                  </div>
                  <div className="ec-rest-wizard-grid two">
                    <label>
                      <span>Field</span>
                      <Input value={fieldName} onChange={(event) => setFieldName(event.target.value)} />
                    </label>
                    <label>
                      <span>Nombre</span>
                      <Input value={operationLabel} onChange={(event) => setOperationLabel(event.target.value)} />
                    </label>
                  </div>
                  <label>
                    <span>Variables tipadas (JSON)</span>
                    <textarea
                      rows={6}
                      value={variableDefinitions}
                      onChange={(event) => setVariableDefinitions(event.target.value)}
                      spellCheck={false}
                    />
                  </label>
                  <label>
                    <span>Documento GraphQL raw</span>
                    <textarea
                      rows={8}
                      value={rawDocument}
                      onChange={(event) => setRawDocument(event.target.value)}
                      spellCheck={false}
                    />
                  </label>
                  <label className="ec-rest-checkbox-row">
                    <Checkbox checked={requiresAuth} onCheckedChange={(checked) => setRequiresAuth(checked === true)} />
                    <span>Requiere SecretRef/Gateway</span>
                  </label>
                  <Button size="sm" variant="outline" onClick={addManualOperation}>
                    Añadir operación
                  </Button>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <h3>Probar</h3>
              <p>Ejecuta una operación mediante el adapter GraphQL real.</p>
              <label>
                <span>Operación</span>
                <Select value={testOperation?.id ?? ''} onValueChange={setTestOperationId}>
                  <SelectTrigger aria-label="Operación GraphQL de prueba">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((operation) => (
                      <SelectItem key={operation.id} value={operation.id}>
                        {operation.operationType} · {operation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label>
                <span>Variables</span>
                <textarea
                  rows={8}
                  value={testVariables}
                  onChange={(event) => setTestVariables(event.target.value)}
                  spellCheck={false}
                />
              </label>
              {testOperation && testOperation.kind !== 'read' ? (
                <div className="ec-rest-wizard-note warning">
                  <strong>Mutación</strong>
                  <span>La prueba puede modificar datos reales.</span>
                </div>
              ) : null}
              <div className="ec-rest-wizard-inline-actions">
                <Button size="sm" disabled={busy || !testOperation} onClick={() => void testRequest()}>
                  Probar
                </Button>
                {message ? <p role="status">{message}</p> : null}
              </div>
              {result !== null ? <pre className="ec-rest-test-result">{JSON.stringify(result, null, 2)}</pre> : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <h3>Guardar</h3>
              <p>Revisa el contrato portable antes de guardar.</p>
              <div className="ec-rest-save-summary">
                <section>
                  <span>Fuente</span>
                  <strong>{name}</strong>
                  <small>{normalizeKey(key || name)}</small>
                </section>
                <section>
                  <span>Endpoint</span>
                  <strong>{endpoint}</strong>
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
            <p className="ec-data-source-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="ec-rest-wizard-footer">
          <Button
            variant="ghost"
            disabled={busy || step === 0}
            onClick={() => setStep(Math.max(0, step - 1) as StepIndex)}
          >
            Atrás
          </Button>
          {step < 5 ? (
            <Button disabled={busy} onClick={next}>
              Continuar
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
