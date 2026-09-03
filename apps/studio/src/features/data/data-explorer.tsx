import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import {
  buildDataExplorerInput,
  type DataExplorerExecutionResult,
  type DataExplorerOperationDescriptor,
} from '@electrocraft/application';
import type {
  ElectroCraftDataSourceDefinition,
  ElectroCraftDataSourceEnvironment,
  JsonValue,
} from '@electrocraft/domain';
import { useEffect, useId, useMemo, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

interface DataExplorerProps {
  readonly source: ElectroCraftDataSourceDefinition;
  readonly environment: ElectroCraftDataSourceEnvironment;
  readonly onBack: () => void;
}

interface TabularPreview {
  readonly columns: readonly string[];
  readonly rows: readonly Readonly<Record<string, JsonValue>>[];
}

function operationKey(operation: DataExplorerOperationDescriptor) {
  return `${operation.resourceId}:${operation.id}:${operation.capability}`;
}

function initialParameterValues(operation: DataExplorerOperationDescriptor | null) {
  return Object.fromEntries(
    (operation?.parameters ?? []).map((parameter) => [
      parameter.name,
      parameter.defaultValue === undefined
        ? ''
        : typeof parameter.defaultValue === 'string'
          ? parameter.defaultValue
          : JSON.stringify(parameter.defaultValue, null, 2),
    ]),
  );
}

function asRow(value: JsonValue): Readonly<Record<string, JsonValue>> {
  if (value !== null && !Array.isArray(value) && typeof value === 'object') return value;
  return Object.freeze({ valor: value });
}

function tabularPreview(value: JsonValue | null): TabularPreview | null {
  if (value === null) return null;
  const rows = (Array.isArray(value) ? value : [value]).map(asRow);
  if (rows.length === 0) return Object.freeze({ columns: Object.freeze([]), rows: Object.freeze([]) });
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].slice(0, 16);
  return Object.freeze({ columns: Object.freeze(columns), rows: Object.freeze(rows) });
}

function cellText(value: JsonValue | undefined) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function capabilityLabel(capability: DataExplorerOperationDescriptor['capability']) {
  if (capability === 'read') return 'Lectura';
  if (capability === 'create') return 'Crear';
  if (capability === 'update') return 'Actualizar';
  return 'Eliminar';
}

export function DataExplorer({ source, environment, onBack }: DataExplorerProps) {
  const id = useId();
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [operations, setOperations] = useState<readonly DataExplorerOperationDescriptor[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [execution, setExecution] = useState<DataExplorerExecutionResult | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingInput, setPendingInput] = useState<JsonValue | null>(null);
  const [lastInput, setLastInput] = useState<JsonValue | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setError(null);
    void dataSourceWorkspaceRuntime
      .listExplorerOperations(source, environment)
      .then((next) => {
        if (cancelled) return;
        const first = next[0] ?? null;
        setOperations(next);
        setSelectedKey(first ? operationKey(first) : '');
        setValues(initialParameterValues(first));
        setLoadState('ready');
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadState('error');
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los recursos.');
      });
    return () => {
      cancelled = true;
    };
  }, [environment, source]);

  const selected = operations.find((operation) => operationKey(operation) === selectedKey) ?? null;
  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      { readonly label: string; readonly operations: DataExplorerOperationDescriptor[] }
    >();
    for (const operation of operations) {
      const current = grouped.get(operation.resourceId);
      if (current) current.operations.push(operation);
      else grouped.set(operation.resourceId, { label: operation.resourceLabel, operations: [operation] });
    }
    return [...grouped.entries()];
  }, [operations]);
  const table = useMemo(() => tabularPreview(execution?.preview ?? null), [execution]);

  async function execute(input: JsonValue, mutationConfirmed: boolean) {
    if (!selected) return;
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const result = await dataSourceWorkspaceRuntime.executeExplorerOperation(
        source,
        environment,
        selected,
        input,
        mutationConfirmed,
      );
      setExecution(result);
      setLastInput(input);
      if (result.status === 'error') setError(result.error);
      else setMessage('Operación ejecutada correctamente.');
    } finally {
      setRunning(false);
    }
  }

  function prepareExecution() {
    if (!selected) return;
    setError(null);
    try {
      const input = buildDataExplorerInput(selected, values);
      if (selected.capability !== 'read') {
        setPendingInput(input);
        setConfirmOpen(true);
        return;
      }
      void execute(input, false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Los parámetros no son válidos.');
    }
  }

  return (
    <section className="ec-data-explorer" aria-labelledby={`${id}-title`}>
      <header className="ec-data-explorer-header">
        <Button size="sm" variant="ghost" onClick={onBack}>
          ← {source.label}
        </Button>
        <div>
          <p>Datos · Fuentes de datos · {source.label}</p>
          <div>
            <h3 id={`${id}-title`}>Explorar</h3>
            <HelpTrigger helpId="help.data.explorer" />
          </div>
        </div>
        <span>{environment}</span>
      </header>

      {loadState === 'loading' ? <p role="status">Cargando recursos y operaciones…</p> : null}
      {loadState === 'error' ? (
        <div className="ec-data-explorer-state" role="alert">
          <strong>No se pudo abrir el Explorer.</strong>
          <p>{error}</p>
          <Button size="sm" onClick={() => onBack()}>
            Volver a la fuente
          </Button>
        </div>
      ) : null}
      {loadState === 'ready' && operations.length === 0 ? (
        <div className="ec-data-explorer-state">
          <strong>No hay operaciones disponibles.</strong>
          <p>Define recursos y una capacidad de lectura compatible en esta fuente.</p>
          <Button size="sm" variant="outline" onClick={onBack}>
            Revisar configuración
          </Button>
        </div>
      ) : null}

      {loadState === 'ready' && selected ? (
        <div className="ec-data-explorer-layout">
          <aside className="ec-data-explorer-operations" aria-label="Recursos y operaciones">
            <h4>Recurso</h4>
            {groups.map(([resourceId, group]) => (
              <section key={resourceId}>
                <strong>{group.label}</strong>
                <small>{resourceId}</small>
                {group.operations.map((operation) => (
                  <Button
                    key={operationKey(operation)}
                    type="button"
                    size="sm"
                    variant={selectedKey === operationKey(operation) ? 'secondary' : 'ghost'}
                    aria-pressed={selectedKey === operationKey(operation)}
                    onClick={() => {
                      setSelectedKey(operationKey(operation));
                      setValues(initialParameterValues(operation));
                      setExecution(null);
                      setLastInput(null);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    <span>{operation.label}</span>
                    <small>{capabilityLabel(operation.capability)}</small>
                  </Button>
                ))}
              </section>
            ))}
          </aside>

          <main className="ec-data-explorer-parameters">
            <div className="ec-data-explorer-panel-heading">
              <div>
                <span>Operación</span>
                <h4>{selected.label}</h4>
              </div>
              <em data-mutation={selected.capability === 'read' ? 'false' : 'true'}>
                {capabilityLabel(selected.capability)}
              </em>
            </div>
            <fieldset disabled={running}>
              <legend>Parámetros</legend>
              {selected.parameters.length === 0 ? <p>Esta operación no requiere parámetros.</p> : null}
              {selected.parameters.map((parameter) => (
                <label key={`${selectedKey}:${parameter.name}`}>
                  <span>
                    {parameter.label} {parameter.required ? <abbr title="Obligatorio">*</abbr> : null}
                  </span>
                  {parameter.valueType === 'boolean' ? (
                    <Select
                      value={values[parameter.name] ?? ''}
                      onValueChange={(value) => setValues((current) => ({ ...current, [parameter.name]: value }))}
                    >
                      <SelectTrigger aria-label={parameter.label}>
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verdadero</SelectItem>
                        <SelectItem value="false">Falso</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : parameter.valueType === 'json' || parameter.valueType === 'array' ? (
                    <textarea
                      value={values[parameter.name] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [parameter.name]: event.target.value }))
                      }
                      rows={5}
                      aria-label={parameter.label}
                      placeholder={parameter.valueType === 'array' ? '[]' : '{}'}
                    />
                  ) : (
                    <Input
                      type={parameter.valueType === 'number' ? 'number' : 'text'}
                      value={values[parameter.name] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [parameter.name]: event.target.value }))
                      }
                      aria-label={parameter.label}
                    />
                  )}
                  <small>{parameter.location}</small>
                </label>
              ))}
            </fieldset>
            {error ? (
              <p className="ec-data-explorer-error" role="alert">
                <strong>Error:</strong> {error}
              </p>
            ) : null}
            {message ? <p role="status">{message}</p> : null}
            <div className="ec-data-explorer-actions">
              <Button onClick={prepareExecution} disabled={running}>
                {running ? 'Ejecutando…' : 'Ejecutar'}
              </Button>
              {execution?.status === 'success' && selected.capability === 'read' && lastInput ? (
                <Button
                  variant="outline"
                  disabled={running}
                  onClick={() => {
                    setError(null);
                    void dataSourceWorkspaceRuntime
                      .createExplorerQueryDraft(source, selected, lastInput)
                      .then((query) => setMessage(`Consulta ${query.name} creada como borrador.`))
                      .catch((cause: unknown) =>
                        setError(cause instanceof Error ? cause.message : 'No se pudo crear la consulta.'),
                      );
                  }}
                >
                  Crear consulta desde esta operación
                </Button>
              ) : null}
            </div>
          </main>

          <section className="ec-data-explorer-result" aria-labelledby={`${id}-result-title`}>
            <div className="ec-data-explorer-panel-heading">
              <div>
                <span>Resultado</span>
                <h4 id={`${id}-result-title`}>
                  {execution ? `${execution.durationMs.toFixed(1)} ms` : 'Sin ejecutar'}
                </h4>
              </div>
              {execution ? <em>Tiempo</em> : null}
            </div>
            {!execution ? <p>Configura los parámetros y pulsa Ejecutar.</p> : null}
            {execution?.truncated ? <p role="status">Vista truncada para mantener el Explorer ágil.</p> : null}
            {table && table.rows.length > 0 ? (
              <div className="ec-data-explorer-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {table.columns.map((column) => (
                        <th key={column} scope="col">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {table.columns.map((column) => (
                          <td key={column}>{cellText(row[column])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : execution?.status === 'success' ? (
              <p>La operación terminó sin filas.</p>
            ) : null}
            {execution ? (
              <details>
                <summary>Avanzado · traza sanitizada</summary>
                <pre>{JSON.stringify(execution.trace, null, 2)}</pre>
              </details>
            ) : null}
          </section>
        </div>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirmar mutación</AlertDialogTitle>
          <AlertDialogDescription>
            {selected
              ? `${selected.label} puede modificar datos en ${source.label}.`
              : 'Esta operación modifica datos.'}
          </AlertDialogDescription>
          <div className="ec-data-explorer-confirm-actions">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  if (pendingInput !== null) void execute(pendingInput, true);
                  setPendingInput(null);
                }}
              >
                Confirmar y ejecutar
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
