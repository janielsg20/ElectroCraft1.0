import { Button, Input } from '@electrocraft/design-system';
import type {
  ElectroCraftDataModel,
  ElectroCraftObjectId,
  ElectroRelation,
  ElectroRelationCardinality,
  ElectroRelationDeleteBehavior,
  ElectroRelationEdge,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState } from 'react';
import { dataModelWorkspaceRuntime, type DataRecordOption } from './data-model-runtime';
import './relation-editor.css';

interface RelationEditorProps {
  readonly model: ElectroCraftDataModel;
  readonly models: readonly ElectroCraftDataModel[];
  readonly relations: readonly ElectroRelation[];
}

interface RelationDraft {
  readonly label: string;
  readonly key: string;
  readonly targetModelRef: ElectroCraftObjectId;
  readonly cardinality: ElectroRelationCardinality;
  readonly deleteBehavior: ElectroRelationDeleteBehavior;
  readonly inverseKey: string;
  readonly inverseLabel: string;
  readonly readRoles: string;
  readonly writeRoles: string;
}

function relationDraft(relation: ElectroRelation): RelationDraft {
  return {
    label: relation.label,
    key: relation.key,
    targetModelRef: relation.targetModelRef,
    cardinality: relation.cardinality,
    deleteBehavior: relation.deleteBehavior,
    inverseKey: relation.inverse?.key ?? '',
    inverseLabel: relation.inverse?.label ?? '',
    readRoles: relation.permissions?.read?.join(', ') ?? '',
    writeRoles: relation.permissions?.write?.join(', ') ?? '',
  };
}

function roleList(value: string) {
  const roles = value
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);
  return roles.length ? [...new Set(roles)] : undefined;
}

function cardinalityLabel(value: ElectroRelationCardinality) {
  if (value === 'one-to-one') return '1:1';
  if (value === 'one-to-many') return '1:N';
  return 'N:N';
}

export function RelationEditor({ model, models, relations }: RelationEditorProps) {
  const attached = useMemo(
    () => relations.filter(({ sourceModelRef }) => sourceModelRef === model.id),
    [model.id, relations],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = attached.find(({ id }) => id === selectedId) ?? attached[0] ?? null;
  const [draft, setDraft] = useState<RelationDraft | null>(null);
  const [edges, setEdges] = useState<readonly ElectroRelationEdge[]>([]);
  const [sourceOptions, setSourceOptions] = useState<readonly DataRecordOption[]>([]);
  const [targetOptions, setTargetOptions] = useState<readonly DataRecordOption[]>([]);
  const [fromRecordId, setFromRecordId] = useState('');
  const [toRecordId, setToRecordId] = useState('');
  const [message, setMessage] = useState('Selecciona una relación para editar su definición e integridad.');

  useEffect(() => {
    setSelectedId((current) => (attached.some(({ id }) => id === current) ? current : (attached[0]?.id ?? null)));
  }, [attached]);

  useEffect(() => {
    setDraft(selected ? relationDraft(selected) : null);
    setEdges([]);
    setSourceOptions([]);
    setTargetOptions([]);
    setFromRecordId('');
    setToRecordId('');
    if (!selected) return;
    let active = true;
    setMessage('Cargando relación…');
    void Promise.all([
      dataModelWorkspaceRuntime.listRelationEdges(selected.id),
      dataModelWorkspaceRuntime.listRecordOptions(selected.sourceModelRef),
      dataModelWorkspaceRuntime.listRecordOptions(selected.targetModelRef),
    ])
      .then(([nextEdges, nextSources, nextTargets]) => {
        if (!active) return;
        setEdges(nextEdges);
        setSourceOptions(nextSources);
        setTargetOptions(nextTargets);
        setFromRecordId(nextSources[0]?.id ?? '');
        setToRecordId(nextTargets[0]?.id ?? '');
        setMessage(`${nextEdges.length} vínculo(s) cargado(s).`);
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : 'No se pudo cargar la relación.');
      });
    return () => {
      active = false;
    };
  }, [selected]);

  async function refreshEdges(relationId: string) {
    const next = await dataModelWorkspaceRuntime.listRelationEdges(relationId);
    setEdges(next);
    return next;
  }

  async function saveDefinition() {
    if (!selected || !draft) return;
    setMessage('Guardando relación…');
    try {
      const readRoles = roleList(draft.readRoles);
      const writeRoles = roleList(draft.writeRoles);
      await dataModelWorkspaceRuntime.updateRelation(selected.id, {
        label: draft.label.trim(),
        key: draft.key.trim(),
        targetModelRef: draft.targetModelRef,
        cardinality: draft.cardinality,
        deleteBehavior: draft.deleteBehavior,
        inverse:
          draft.inverseKey.trim() && draft.inverseLabel.trim()
            ? { key: draft.inverseKey.trim(), label: draft.inverseLabel.trim() }
            : undefined,
        permissions: {
          ...(readRoles ? { read: readRoles } : {}),
          ...(writeRoles ? { write: writeRoles } : {}),
        },
      });
      setMessage('Definición de relación guardada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la relación.');
    }
  }

  async function createEdge() {
    if (!selected || !fromRecordId || !toRecordId) {
      setMessage('Selecciona un registro de origen y otro de destino.');
      return;
    }
    setMessage('Creando vínculo…');
    try {
      await dataModelWorkspaceRuntime.createRelationEdge(selected.id, fromRecordId, toRecordId);
      const next = await refreshEdges(selected.id);
      setMessage(`${next.length} vínculo(s) guardado(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear el vínculo.');
    }
  }

  return (
    <div className="ec-relation-layout">
      <section className="ec-model-panel ec-relation-list-panel">
        <div className="ec-model-panel-heading">
          <div>
            <h3>Relaciones</h3>
            <p>Origen · cardinalidad · destino.</p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              void dataModelWorkspaceRuntime
                .createRelation(model.id)
                .then((created) => {
                  setSelectedId(created.id);
                  setMessage('Relación creada.');
                })
                .catch((error: unknown) =>
                  setMessage(error instanceof Error ? error.message : 'No se pudo crear la relación.'),
                )
            }
          >
            Nueva
          </Button>
        </div>
        {attached.length ? (
          <div className="ec-relation-list" role="list">
            {attached.map((relation) => {
              const target = models.find(({ id }) => id === relation.targetModelRef);
              return (
                <button
                  key={relation.id}
                  type="button"
                  role="listitem"
                  className="ec-model-item"
                  aria-current={relation.id === selected?.id ? 'true' : undefined}
                  onClick={() => setSelectedId(relation.id)}
                >
                  <span>{relation.label}</span>
                  <small>
                    {model.label} · {cardinalityLabel(relation.cardinality)} ·{' '}
                    {target?.label ?? relation.targetModelRef}
                  </small>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ec-models-empty">
            <strong>Este modelo no tiene relaciones.</strong>
            <p>Crea una para enlazar registros sin modificar el schema físico de PGlite.</p>
          </div>
        )}
      </section>

      <div className="ec-relation-detail">
        {selected && draft ? (
          <>
            <section className="ec-model-panel">
              <div className="ec-model-panel-heading">
                <div>
                  <h3>Definición</h3>
                  <p>Origen, tipo, destino, inverso, integridad y permisos.</p>
                </div>
                <Button size="sm" onClick={() => void saveDefinition()}>
                  Guardar definición
                </Button>
              </div>
              <div className="ec-model-form-grid">
                <label>
                  Nombre
                  <Input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
                </label>
                <label>
                  Clave
                  <Input value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />
                </label>
                <label>
                  Origen
                  <Input value={model.label} disabled />
                </label>
                <label>
                  Tipo
                  <select
                    aria-label="Tipo de relación"
                    value={draft.cardinality}
                    onChange={(event) =>
                      setDraft({ ...draft, cardinality: event.target.value as ElectroRelationCardinality })
                    }
                  >
                    <option value="one-to-one">1:1</option>
                    <option value="one-to-many">1:N</option>
                    <option value="many-to-many">N:N</option>
                  </select>
                </label>
                <label>
                  Destino
                  <select
                    aria-label="Modelo de destino"
                    value={draft.targetModelRef}
                    onChange={(event) =>
                      setDraft({ ...draft, targetModelRef: event.target.value as ElectroCraftObjectId })
                    }
                  >
                    {models.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Integridad al eliminar
                  <select
                    aria-label="Integridad al eliminar"
                    value={draft.deleteBehavior}
                    onChange={(event) =>
                      setDraft({ ...draft, deleteBehavior: event.target.value as ElectroRelationDeleteBehavior })
                    }
                  >
                    <option value="restrict">Restringir</option>
                    <option value="detach">Desvincular</option>
                    <option value="cascade">Cascada</option>
                  </select>
                </label>
                <label>
                  Clave inversa
                  <Input
                    value={draft.inverseKey}
                    placeholder="productos"
                    onChange={(event) => setDraft({ ...draft, inverseKey: event.target.value })}
                  />
                </label>
                <label>
                  Etiqueta inversa
                  <Input
                    value={draft.inverseLabel}
                    placeholder="Productos"
                    onChange={(event) => setDraft({ ...draft, inverseLabel: event.target.value })}
                  />
                </label>
                <label>
                  Permisos de lectura
                  <Input
                    value={draft.readRoles}
                    placeholder="admin, editor"
                    onChange={(event) => setDraft({ ...draft, readRoles: event.target.value })}
                  />
                </label>
                <label>
                  Permisos de escritura
                  <Input
                    value={draft.writeRoles}
                    placeholder="admin"
                    onChange={(event) => setDraft({ ...draft, writeRoles: event.target.value })}
                  />
                </label>
              </div>
              <div className="ec-model-actions">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void dataModelWorkspaceRuntime
                      .deleteRelation(selected.id)
                      .then(() => {
                        setSelectedId(null);
                        setMessage('Relación eliminada.');
                      })
                      .catch((error: unknown) =>
                        setMessage(error instanceof Error ? error.message : 'No se pudo eliminar la relación.'),
                      )
                  }
                >
                  Eliminar relación
                </Button>
              </div>
            </section>

            <section className="ec-model-panel" id="relation-records">
              <div className="ec-model-panel-heading">
                <div>
                  <h3>Vínculos de registros</h3>
                  <p>Selector de registros; los edges persisten en relation_edges.</p>
                </div>
                <span>{cardinalityLabel(selected.cardinality)}</span>
              </div>
              <div className="ec-relation-selector-grid">
                <label>
                  Registro de origen
                  <select
                    aria-label="Registro de origen"
                    value={fromRecordId}
                    onChange={(event) => setFromRecordId(event.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {sourceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Registro de destino
                  <select
                    aria-label="Registro de destino"
                    value={toRecordId}
                    onChange={(event) => setToRecordId(event.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {targetOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button size="sm" onClick={() => void createEdge()}>
                  Crear vínculo
                </Button>
              </div>
              <div className="ec-relation-edge-list" role="list" aria-label="Vínculos de la relación">
                {edges.map((edge) => (
                  <div key={edge.id} role="listitem" className="ec-field-row">
                    <span>
                      <strong>
                        {sourceOptions.find(({ id }) => id === edge.fromRecordRef)?.label ?? edge.fromRecordRef}
                      </strong>
                      <small>{edge.fromRecordRef}</small>
                    </span>
                    <span className="ec-relation-edge-target">
                      <small>→</small>
                      <strong>
                        {targetOptions.find(({ id }) => id === edge.toRecordRef)?.label ?? edge.toRecordRef}
                      </strong>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void dataModelWorkspaceRuntime
                          .deleteRelationEdge(selected.id, edge.id)
                          .then(() => refreshEdges(selected.id))
                          .then((next) => setMessage(`${next.length} vínculo(s) guardado(s).`))
                          .catch((error: unknown) =>
                            setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el vínculo.'),
                          )
                      }
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                {!edges.length ? <p className="ec-advanced-hint">No hay vínculos guardados.</p> : null}
              </div>
            </section>
          </>
        ) : null}
        <p className="ec-models-action-status" role={message.includes('No se pudo') ? 'alert' : 'status'}>
          {message}
        </p>
      </div>
    </div>
  );
}
