import type { InternalDataRecord } from '@electrocraft/application';
import { Button, Input } from '@electrocraft/design-system';
import {
  readElectroCraftAdvancedFieldMetadata,
  type ElectroCraftDataField,
  type ElectroCraftDataModel,
  type ElectroCraftDataSchema,
  type JsonValue,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import './records-workspace.css';

type RecordDraft = Readonly<Record<string, JsonValue>>;

function queryResult(value: JsonValue): { rows: readonly InternalDataRecord[]; total: number } {
  if (!value || Array.isArray(value) || typeof value !== 'object') return { rows: [], total: 0 };
  const candidate = value as Record<string, JsonValue>;
  return {
    rows: Array.isArray(candidate.rows) ? (candidate.rows as unknown as InternalDataRecord[]) : [],
    total: typeof candidate.total === 'number' ? candidate.total : 0,
  };
}

function topLevelFields(model: ElectroCraftDataModel) {
  return model.fields.filter((field) => readElectroCraftAdvancedFieldMetadata(field).parentFieldRef === null);
}

function initialDraft(model: ElectroCraftDataModel): RecordDraft {
  return Object.freeze(
    Object.fromEntries(
      topLevelFields(model)
        .filter(({ type }) => type !== 'calculated')
        .flatMap((field) => (field.defaultValue === undefined ? [] : [[field.key, structuredClone(field.defaultValue)]])),
    ) as Record<string, JsonValue>,
  );
}

function recordLabel(record: InternalDataRecord, model: ElectroCraftDataModel) {
  const first = topLevelFields(model).find(({ type }) => ['text', 'textarea', 'email', 'phone'].includes(type));
  const value = first ? record.data[first.key] : undefined;
  return typeof value === 'string' && value.trim() ? value : record.id;
}

function complexField(field: ElectroCraftDataField) {
  return ['richtext', 'gallery', 'map', 'group', 'repeater', 'json'].includes(field.type);
}

function FieldEditor({
  field,
  value,
  jsonText,
  disabled,
  onValue,
  onJsonText,
}: {
  readonly field: ElectroCraftDataField;
  readonly value: JsonValue | undefined;
  readonly jsonText: string | undefined;
  readonly disabled: boolean;
  readonly onValue: (value: JsonValue | undefined) => void;
  readonly onJsonText: (value: string) => void;
}) {
  if (field.type === 'calculated') {
    return <Input value={value == null ? 'Se calcula al guardar' : String(value)} disabled />;
  }
  if (complexField(field)) {
    return (
      <textarea
        aria-label={field.label}
        rows={field.type === 'repeater' || field.type === 'group' ? 6 : 4}
        disabled={disabled}
        value={jsonText ?? JSON.stringify(value ?? (field.type === 'gallery' || field.type === 'repeater' ? [] : {}), null, 2)}
        onChange={(event) => onJsonText(event.target.value)}
      />
    );
  }
  if (field.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <select
        multiple
        aria-label={field.label}
        disabled={disabled}
        value={selected.map(String)}
        onChange={(event) => onValue(Array.from(event.currentTarget.selectedOptions).map(({ value }) => field.options?.find((option) => String(option.value) === value)?.value ?? value))}
      >
        {(field.options ?? []).map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
      </select>
    );
  }
  if (['select', 'radio'].includes(field.type)) {
    return (
      <select aria-label={field.label} disabled={disabled} value={value == null ? '' : String(value)} onChange={(event) => { const next = field.options?.find((option) => String(option.value) === event.target.value)?.value; onValue(event.target.value === '' ? undefined : (next ?? event.target.value)); }}>
        <option value="">Seleccionar…</option>
        {(field.options ?? []).map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
      </select>
    );
  }
  if (['boolean', 'switch'].includes(field.type)) {
    return (
      <label className="ec-record-boolean">
        <input type="checkbox" disabled={disabled} checked={value === true} onChange={(event) => onValue(event.target.checked)} />
        <span>{value === true ? 'Sí' : 'No'}</span>
      </label>
    );
  }
  if (['number', 'currency'].includes(field.type)) {
    return <Input type="number" disabled={disabled} value={typeof value === 'number' ? String(value) : ''} onChange={(event) => onValue(event.target.value === '' ? undefined : Number(event.target.value))} />;
  }
  if (field.type === 'textarea') {
    return <textarea aria-label={field.label} rows={4} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={(event) => onValue(event.target.value)} />;
  }
  const inputType = field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'datetime' ? 'datetime-local' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'color' ? 'color' : 'text';
  return <Input type={inputType} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={(event) => onValue(event.target.value)} />;
}

export function RecordsWorkspace() {
  const sourceSnapshot = useSyncExternalStore(
    dataSourceWorkspaceRuntime.subscribe,
    dataSourceWorkspaceRuntime.getSnapshot,
    dataSourceWorkspaceRuntime.getSnapshot,
  );
  const internalSource = useMemo(
    () => sourceSnapshot.sources.find(({ kind, adapterId }) => kind === 'internal' && adapterId === 'internal.pglite') ?? null,
    [sourceSnapshot.sources],
  );
  const [schema, setSchema] = useState<ElectroCraftDataSchema | null>(null);
  const [modelId, setModelId] = useState('');
  const [records, setRecords] = useState<readonly InternalDataRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RecordDraft>({});
  const [jsonTexts, setJsonTexts] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Cargando registros…');

  const model = schema?.models.find(({ id }) => id === modelId) ?? schema?.models[0] ?? null;
  const selected = records.find(({ id }) => id === selectedId) ?? null;

  useEffect(() => { void dataSourceWorkspaceRuntime.load(); }, []);
  useEffect(() => {
    if (!internalSource || !sourceSnapshot.project) { setSchema(null); setMessage('Crea ElectroCraft Data y al menos un modelo para gestionar registros.'); return; }
    let active = true;
    setLoading(true);
    void dataSourceWorkspaceRuntime.introspectSchema(internalSource, 'development')
      .then((next) => {
        if (!active) return;
        setSchema(next);
        setModelId((current) => next?.models.some(({ id }) => id === current) ? current : (next?.models[0]?.id ?? ''));
        setMessage(next?.models.length ? 'Selecciona un modelo y un registro.' : 'Crea un modelo antes de añadir registros.');
      })
      .catch((error: unknown) => active && setMessage(error instanceof Error ? error.message : 'No se pudo cargar el esquema.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [internalSource, sourceSnapshot.project]);

  async function refresh(preferredId?: string | null) {
    if (!internalSource || !model) return;
    setLoading(true);
    try {
      const result = queryResult(await dataSourceWorkspaceRuntime.query(internalSource, 'development', model.id, { offset: 0, limit: 200, includeDeleted }));
      setRecords(result.rows);
      const nextSelected = preferredId && result.rows.some(({ id }) => id === preferredId) ? preferredId : (result.rows.find(({ deletedAt }) => !deletedAt)?.id ?? result.rows[0]?.id ?? null);
      setSelectedId(nextSelected);
      setMessage(`${result.total} registro(s) cargado(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los registros.');
    } finally { setLoading(false); }
  }

  useEffect(() => { setCreating(false); setSelectedId(null); setRecords([]); if (model && internalSource) void refresh(null); }, [model?.id, internalSource?.id, includeDeleted]);
  useEffect(() => {
    if (!model) return;
    const next = selected ? selected.data : creating ? initialDraft(model) : {};
    setDraft(Object.freeze({ ...next }));
    setJsonTexts({});
  }, [selected?.id, creating, model?.id]);

  function setField(key: string, value: JsonValue | undefined) {
    setDraft((current) => {
      const next = { ...current } as Record<string, JsonValue>;
      if (value === undefined) delete next[key]; else next[key] = value;
      return Object.freeze(next);
    });
  }

  function materializeDraft() {
    const next = { ...draft } as Record<string, JsonValue>;
    for (const [key, text] of Object.entries(jsonTexts)) {
      if (!text.trim()) { delete next[key]; continue; }
      try { next[key] = JSON.parse(text) as JsonValue; }
      catch { throw new Error(`El campo ${model?.fields.find((field) => field.key === key)?.label ?? key} contiene JSON inválido.`); }
    }
    return next;
  }

  async function save() {
    if (!internalSource || !model) return;
    setMessage('Validando y guardando registro…');
    try {
      const data = materializeDraft();
      if (creating) {
        const created = await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'create', { data });
        const id = created && !Array.isArray(created) && typeof created === 'object' && typeof (created as Record<string, JsonValue>).id === 'string' ? String((created as Record<string, JsonValue>).id) : null;
        setCreating(false);
        await refresh(id);
        setMessage('Registro creado y validado.');
      } else if (selected) {
        await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'update', { id: selected.id, data, state: selected.state });
        await refresh(selected.id);
        setMessage('Registro actualizado y validado.');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar el registro.'); }
  }

  async function remove() {
    if (!internalSource || !model || !selected || selected.deletedAt) return;
    setMessage('Moviendo registro a eliminados…');
    try {
      await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'delete', { id: selected.id });
      await refresh(null);
      setMessage('Registro eliminado de forma reversible en almacenamiento.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el registro.'); }
  }

  if (!sourceSnapshot.project) return <div className="ec-records-empty"><strong>Abre un proyecto para gestionar registros.</strong></div>;
  if (!internalSource) return <div className="ec-records-empty"><strong>ElectroCraft Data no está configurada.</strong><a href="/data-sources">Ir a Fuentes de datos</a></div>;
  if (!schema?.models.length) return <div className="ec-records-empty"><strong>No hay modelos de datos.</strong><a href="/models">Crear un modelo</a></div>;

  return (
    <div className="ec-records-workspace" data-records-workspace>
      <div className="ec-records-toolbar">
        <label>Modelo<select aria-label="Modelo de registros" value={model?.id ?? ''} onChange={(event) => setModelId(event.target.value)}>{schema.models.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}</select></label>
        <label className="ec-records-toggle"><input type="checkbox" checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)} />Incluir eliminados</label>
        <Button size="sm" disabled={!model || loading} onClick={() => { if (!model) return; setCreating(true); setSelectedId(null); setDraft(initialDraft(model)); setJsonTexts({}); setMessage('Nuevo registro listo para completar.'); }}>Nuevo registro</Button>
      </div>
      <div className="ec-records-list-detail" data-list-detail-pattern>
        <section className="ec-records-list" aria-label="Lista de registros">
          <div className="ec-records-list-heading"><strong>{model?.pluralLabel ?? model?.label ?? 'Registros'}</strong><span>{loading ? '…' : records.length}</span></div>
          {records.length ? records.map((record) => (
            <button key={record.id} type="button" className="ec-record-card" aria-current={record.id === selectedId ? 'true' : undefined} data-deleted={record.deletedAt ? 'true' : undefined} onClick={() => { setCreating(false); setSelectedId(record.id); }}>
              <strong>{model ? recordLabel(record, model) : record.id}</strong><small>{record.id}</small><span>{record.deletedAt ? 'Eliminado' : record.state}</span>
            </button>
          )) : <div className="ec-records-empty"><strong>No hay registros en este modelo.</strong><span>Usa “Nuevo registro” para crear el primero.</span></div>}
        </section>
        <section className="ec-records-detail" aria-label="Detalle del registro">
          {model && (creating || selected) ? (
            <>
              <div className="ec-records-detail-heading"><div><strong>{creating ? `Nuevo ${model.singularLabel ?? model.label}` : recordLabel(selected!, model)}</strong><small>{selected?.deletedAt ? `Eliminado ${selected.deletedAt}` : 'Validación canónica activa'}</small></div><div className="ec-records-actions"><Button size="sm" disabled={Boolean(selected?.deletedAt) || loading} onClick={() => void save()}>Guardar</Button>{selected && !selected.deletedAt ? <Button size="sm" variant="ghost" onClick={() => void remove()}>Eliminar</Button> : null}</div></div>
              <div className="ec-record-form">
                {topLevelFields(model).map((field) => <label key={field.id}><span>{field.label}{(field.required ?? !field.nullable) ? ' *' : ''}</span>{field.help ? <small>{field.help}</small> : null}<FieldEditor field={field} value={draft[field.key]} jsonText={jsonTexts[field.key]} disabled={Boolean(selected?.deletedAt)} onValue={(value) => setField(field.key, value)} onJsonText={(value) => setJsonTexts((current) => ({ ...current, [field.key]: value }))} /></label>)}
              </div>
            </>
          ) : <div className="ec-records-empty"><strong>Selecciona un registro.</strong><span>El detalle y el formulario aparecerán aquí.</span></div>}
        </section>
      </div>
      <p className="ec-records-status" role={/No se pudo|inválid|obligatorio|Error/i.test(message) ? 'alert' : 'status'}>{message}</p>
    </div>
  );
}
