import { electroCraftFieldRegistry, getElectroCraftFieldRegistryEntry } from '@electrocraft/application';
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@electrocraft/design-system';
import type { ElectroCraftDataField, ElectroCraftDataFieldType } from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { AdvancedFieldEditor } from './advanced-field-editor';
import { orderAdvancedFieldsForDisplay } from './advanced-field-model';
import { dataModelWorkspaceRuntime, type DataFieldImpact } from './data-model-runtime';
import './data-models-workspace.css';

interface FieldDraft {
  readonly label: string;
  readonly key: string;
  readonly type: ElectroCraftDataFieldType;
  readonly required: boolean;
  readonly indexed: boolean;
}

function fieldDraft(field: ElectroCraftDataField): FieldDraft {
  return {
    label: field.label,
    key: field.key,
    type: field.type,
    required: field.required ?? !field.nullable,
    indexed: field.indexed,
  };
}

function impactText(impact: DataFieldImpact) {
  if (impact.recordCount === 0) return 'Este modelo todavía no tiene registros.';
  if (impact.populatedCount === 0) return `${impact.recordCount} registro(s); el campo no contiene datos guardados.`;
  return `${impact.populatedCount} de ${impact.recordCount} registro(s) contienen datos en este campo.`;
}

export function DataModelsWorkspace() {
  const snapshot = useSyncExternalStore(
    dataModelWorkspaceRuntime.subscribe,
    dataModelWorkspaceRuntime.getSnapshot,
    dataModelWorkspaceRuntime.getSnapshot,
  );
  const model = useMemo(
    () => snapshot.models.find(({ id }) => id === snapshot.selectedModelId) ?? snapshot.models[0] ?? null,
    [snapshot.models, snapshot.selectedModelId],
  );
  const [identity, setIdentity] = useState({ label: '', singularLabel: '', pluralLabel: '', description: '' });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField = model?.fields.find(({ id }) => id === selectedFieldId) ?? model?.fields[0] ?? null;
  const orderedFields = useMemo(() => (model ? orderAdvancedFieldsForDisplay(model) : []), [model]);
  const [fieldState, setFieldState] = useState<FieldDraft | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<ElectroCraftDataFieldType>('text');
  const [impact, setImpact] = useState<DataFieldImpact | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'rename' | 'delete' | null>(null);

  useEffect(() => {
    void dataModelWorkspaceRuntime.load();
  }, []);

  useEffect(() => {
    if (!model) {
      setIdentity({ label: '', singularLabel: '', pluralLabel: '', description: '' });
      setSelectedFieldId(null);
      return;
    }
    setIdentity({
      label: model.label,
      singularLabel: model.singularLabel ?? model.label,
      pluralLabel: model.pluralLabel ?? `${model.label}s`,
      description: model.description ?? '',
    });
    setSelectedFieldId((current) =>
      model.fields.some(({ id }) => id === current) ? current : (model.fields[0]?.id ?? null),
    );
  }, [model]);

  useEffect(() => {
    setFieldState(selectedField ? fieldDraft(selectedField) : null);
    setImpact(null);
    setConfirmAction(null);
  }, [selectedField]);

  async function saveField(confirm = false) {
    if (!model || !selectedField || !fieldState) return;
    setActionMessage('Guardando campo…');
    try {
      const descriptor = getElectroCraftFieldRegistryEntry(fieldState.type);
      await dataModelWorkspaceRuntime.updateField(
        model.id,
        selectedField.id,
        {
          label: fieldState.label.trim(),
          key: fieldState.key.trim(),
          type: fieldState.type,
          nullable: !fieldState.required,
          required: fieldState.required,
          indexed: descriptor.supportsIndexing ? fieldState.indexed : false,
          faceted: selectedField.faceted && descriptor.supportsIndexing && fieldState.indexed,
          relationModelRef: fieldState.type === 'relation' ? (selectedField.relationModelRef ?? model.id) : null,
          metadata: {
            ...selectedField.metadata,
            storageHint: descriptor.storageHint,
            fieldFamily: descriptor.family,
            ...(descriptor.advancedOwner ? { advancedOwner: descriptor.advancedOwner } : {}),
          },
        },
        confirm,
      );
      setConfirmAction(null);
      setActionMessage('Campo guardado.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el campo.';
      if (message.startsWith('FIELD_RENAME_IMPACT:')) {
        const nextImpact = await dataModelWorkspaceRuntime.fieldImpact(model.id, selectedField.id);
        setImpact(nextImpact);
        setConfirmAction('rename');
        setActionMessage('Cambiar la clave puede dejar datos existentes sin binding. Revisa el impacto y confirma.');
      } else {
        setActionMessage(message);
      }
    }
  }

  async function deleteField(confirm = false) {
    if (!model || !selectedField) return;
    setActionMessage('Revisando impacto…');
    try {
      const nextImpact = await dataModelWorkspaceRuntime.deleteField(model.id, selectedField.id, confirm);
      setImpact(nextImpact);
      setConfirmAction(null);
      setActionMessage('Campo eliminado del modelo. Los registros físicos no se reescriben automáticamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el campo.';
      if (message.startsWith('FIELD_DELETE_IMPACT:')) {
        const nextImpact = await dataModelWorkspaceRuntime.fieldImpact(model.id, selectedField.id);
        setImpact(nextImpact);
        setConfirmAction('delete');
        setActionMessage('El campo contiene datos. Confirma solo si aceptas que esos valores queden fuera del schema.');
      } else {
        setActionMessage(message);
      }
    }
  }

  return (
    <div className="ec-models-workspace" data-state={snapshot.state}>
      <aside className="ec-models-list" aria-label="Modelos de datos">
        <div className="ec-models-list-heading">
          <div>
            <p>Datos</p>
            <div className="ec-models-title-row">
              <h1>Modelos</h1>
              <HelpTrigger helpId="help.content.models" />
            </div>
          </div>
          <Button
            size="sm"
            disabled={!snapshot.source || snapshot.state === 'saving'}
            onClick={() => void dataModelWorkspaceRuntime.createModel()}
          >
            Nuevo modelo
          </Button>
        </div>

        {!snapshot.source ? (
          <div className="ec-models-empty">
            <strong>ElectroCraft Data no está configurada.</strong>
            <p>Crea la fuente interna desde Datos &gt; Fuentes de datos para habilitar modelos locales.</p>
            <Button asChild size="sm" variant="outline">
              <a href="/data-sources">Ir a Fuentes de datos</a>
            </Button>
          </div>
        ) : snapshot.models.length === 0 ? (
          <div className="ec-models-empty">
            <strong>No hay modelos todavía.</strong>
            <p>Crea el primero. Se guardará como schema canónico sobre el store PGlite existente.</p>
          </div>
        ) : (
          <div className="ec-model-items" role="list">
            {snapshot.models.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="listitem"
                className="ec-model-item"
                aria-current={candidate.id === model?.id ? 'true' : undefined}
                onClick={() => dataModelWorkspaceRuntime.selectModel(candidate.id)}
              >
                <span>{candidate.label}</span>
                <small>
                  {candidate.fields.length} campo(s) · {candidate.visibility === 'public' ? 'Público' : 'Interno'}
                </small>
              </button>
            ))}
          </div>
        )}
        <p className="ec-models-status" role={snapshot.state === 'error' ? 'alert' : 'status'}>
          {snapshot.message}
        </p>
      </aside>

      <main className="ec-model-detail">
        {!model ? (
          <div className="ec-model-detail-empty">
            <h2>Modelos de datos</h2>
            <p>Selecciona o crea un modelo para editar su identidad, campos y almacenamiento.</p>
          </div>
        ) : (
          <Tabs defaultValue="identity" className="ec-model-tabs">
            <div className="ec-model-detail-header">
              <div>
                <p>Modelo · {model.key}</p>
                <h2>{model.label}</h2>
              </div>
              <span>{model.singleton ? 'Singleton' : 'Colección'}</span>
            </div>
            <TabsList className="ec-model-tabs-list" aria-label="Secciones del modelo">
              <TabsTrigger value="identity">Identidad</TabsTrigger>
              <TabsTrigger value="fields">Campos</TabsTrigger>
              <TabsTrigger value="validation">Validación</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <div className="ec-model-panel-heading">
                  <div>
                    <h3>Identidad</h3>
                    <p>Nombre, visibilidad y presentación del modelo.</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={snapshot.state === 'saving'}
                    onClick={() =>
                      void dataModelWorkspaceRuntime.updateModelIdentity(model.id, {
                        label: identity.label.trim(),
                        singularLabel: identity.singularLabel.trim(),
                        pluralLabel: identity.pluralLabel.trim(),
                        description: identity.description.trim(),
                      })
                    }
                  >
                    Guardar identidad
                  </Button>
                </div>
                <div className="ec-model-form-grid">
                  <label>
                    Nombre del modelo
                    <Input
                      value={identity.label}
                      onChange={(event) => setIdentity({ ...identity, label: event.target.value })}
                    />
                  </label>
                  <label>
                    Nombre singular
                    <Input
                      value={identity.singularLabel}
                      onChange={(event) => setIdentity({ ...identity, singularLabel: event.target.value })}
                    />
                  </label>
                  <label>
                    Nombre plural
                    <Input
                      value={identity.pluralLabel}
                      onChange={(event) => setIdentity({ ...identity, pluralLabel: event.target.value })}
                    />
                  </label>
                  <label className="ec-model-form-wide">
                    Descripción
                    <textarea
                      value={identity.description}
                      onChange={(event) => setIdentity({ ...identity, description: event.target.value })}
                    />
                  </label>
                </div>
                <div className="ec-model-flags">
                  <label>
                    <input
                      type="checkbox"
                      checked={model.visibility === 'public'}
                      onChange={(event) =>
                        void dataModelWorkspaceRuntime.updateModelIdentity(model.id, {
                          visibility: event.target.checked ? 'public' : 'internal',
                        })
                      }
                    />{' '}
                    Público
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={model.singleton ?? false}
                      onChange={(event) =>
                        void dataModelWorkspaceRuntime.updateModelIdentity(model.id, {
                          singleton: event.target.checked,
                        })
                      }
                    />{' '}
                    Singleton
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={model.menuVisible ?? true}
                      onChange={(event) =>
                        void dataModelWorkspaceRuntime.updateModelIdentity(model.id, {
                          menuVisible: event.target.checked,
                        })
                      }
                    />{' '}
                    Visible en menú
                  </label>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="fields" className="ec-model-tab-content">
              <div className="ec-fields-layout">
                <section className="ec-model-panel ec-fields-list-panel">
                  <div className="ec-model-panel-heading">
                    <div>
                      <h3>Campos</h3>
                      <p>Filas compactas; selecciona una para editar.</p>
                    </div>
                  </div>
                  <div className="ec-field-add-row">
                    <Input
                      aria-label="Nombre del nuevo campo"
                      placeholder="Nombre del campo"
                      value={newFieldLabel}
                      onChange={(event) => setNewFieldLabel(event.target.value)}
                    />
                    <select
                      aria-label="Tipo del nuevo campo"
                      value={newFieldType}
                      onChange={(event) => setNewFieldType(event.target.value as ElectroCraftDataFieldType)}
                    >
                      {electroCraftFieldRegistry.map((entry) => (
                        <option key={entry.type} value={entry.type}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={() => {
                        void dataModelWorkspaceRuntime
                          .addField(model.id, {
                            label: newFieldLabel || getElectroCraftFieldRegistryEntry(newFieldType).label,
                            type: newFieldType,
                          })
                          .then((created) => {
                            setSelectedFieldId(created.id);
                            setNewFieldLabel('');
                            setActionMessage('Campo añadido.');
                          })
                          .catch((error: unknown) =>
                            setActionMessage(error instanceof Error ? error.message : 'No se pudo añadir el campo.'),
                          );
                      }}
                    >
                      Añadir
                    </Button>
                  </div>
                  <div className="ec-field-list" role="list">
                    {orderedFields.map(({ field, depth }) => (
                      <button
                        key={field.id}
                        type="button"
                        role="listitem"
                        className="ec-field-row"
                        data-depth={depth}
                        style={{ '--ec-field-depth': depth } as CSSProperties}
                        aria-current={field.id === selectedField?.id ? 'true' : undefined}
                        onClick={() => setSelectedFieldId(field.id)}
                      >
                        <span>
                          <strong>{field.label}</strong>
                          <small>{depth > 0 ? `↳ ${field.key}` : field.key}</small>
                        </span>
                        <span>
                          <small>{getElectroCraftFieldRegistryEntry(field.type).label}</small>
                          <small>{(field.required ?? !field.nullable) ? 'Requerido' : 'Opcional'}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="ec-model-panel ec-field-editor" aria-live="polite">
                  {selectedField && fieldState ? (
                    <>
                      <div className="ec-model-panel-heading">
                        <div>
                          <h3>{selectedField.label}</h3>
                          <p>{getElectroCraftFieldRegistryEntry(selectedField.type).help}</p>
                        </div>
                        <span>{getElectroCraftFieldRegistryEntry(selectedField.type).family}</span>
                      </div>
                      <div className="ec-model-form-grid">
                        <label>
                          Etiqueta
                          <Input
                            value={fieldState.label}
                            onChange={(event) => setFieldState({ ...fieldState, label: event.target.value })}
                          />
                        </label>
                        <label>
                          Clave
                          <Input
                            value={fieldState.key}
                            onChange={(event) => setFieldState({ ...fieldState, key: event.target.value })}
                          />
                        </label>
                        <label>
                          Tipo
                          <select
                            value={fieldState.type}
                            onChange={(event) =>
                              setFieldState({ ...fieldState, type: event.target.value as ElectroCraftDataFieldType })
                            }
                          >
                            {electroCraftFieldRegistry.map((entry) => (
                              <option key={entry.type} value={entry.type}>
                                {entry.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="ec-model-check">
                          <input
                            type="checkbox"
                            checked={fieldState.required}
                            onChange={(event) => setFieldState({ ...fieldState, required: event.target.checked })}
                          />{' '}
                          Requerido
                        </label>
                        <label className="ec-model-check">
                          <input
                            type="checkbox"
                            checked={fieldState.indexed}
                            disabled={!getElectroCraftFieldRegistryEntry(fieldState.type).supportsIndexing}
                            onChange={(event) => setFieldState({ ...fieldState, indexed: event.target.checked })}
                          />{' '}
                          Indexado
                        </label>
                      </div>
                      <div className="ec-field-metadata">
                        <span>Storage hint: {getElectroCraftFieldRegistryEntry(fieldState.type).storageHint}</span>
                        {getElectroCraftFieldRegistryEntry(fieldState.type).advancedOwner ? (
                          <span>
                            Semántica avanzada: {getElectroCraftFieldRegistryEntry(fieldState.type).advancedOwner}
                          </span>
                        ) : null}
                      </div>
                      <AdvancedFieldEditor model={model} field={selectedField} onMessage={setActionMessage} />
                      <div className="ec-model-actions">
                        <Button size="sm" onClick={() => void saveField(false)}>
                          Guardar cambios
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void dataModelWorkspaceRuntime.fieldImpact(model.id, selectedField.id).then((next) => {
                              setImpact(next);
                              setActionMessage(impactText(next));
                            })
                          }
                        >
                          Analizar impacto
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void deleteField(false)}>
                          Eliminar campo
                        </Button>
                      </div>
                      {impact ? (
                        <div className="ec-impact-box">
                          <strong>Impacto de datos</strong>
                          <p>{impactText(impact)}</p>
                        </div>
                      ) : null}
                      {confirmAction ? (
                        <div className="ec-impact-confirm">
                          <strong>Confirmación necesaria</strong>
                          <p>{actionMessage}</p>
                          <Button
                            size="sm"
                            onClick={() => void (confirmAction === 'rename' ? saveField(true) : deleteField(true))}
                          >
                            Confirmar {confirmAction === 'rename' ? 'cambio de clave' : 'eliminación'}
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p>Selecciona un campo.</p>
                  )}
                </section>
              </div>
              {actionMessage && !confirmAction ? (
                <p className="ec-models-action-status" role="status">
                  {actionMessage}
                </p>
              ) : null}
            </TabsContent>

            <TabsContent value="validation" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <h3>Validación</h3>
                <p>Las reglas viven en el schema canónico del campo y viajan con el proyecto.</p>
                <div className="ec-model-metrics">
                  <span>
                    <strong>{model.fields.filter((field) => field.required ?? !field.nullable).length}</strong>{' '}
                    requeridos
                  </span>
                  <span>
                    <strong>{model.fields.filter((field) => field.indexed).length}</strong> indexados
                  </span>
                  <span>
                    <strong>{model.fields.filter((field) => field.validation).length}</strong> con reglas
                  </span>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="templates" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <h3>Plantillas</h3>
                <p>
                  El modelo conserva metadata portable para que los targets y futuras plantillas la consuman sin
                  acoplarla al store físico.
                </p>
                <p>
                  Taxonomías y Relaciones se mantienen como referencias canónicas y sus editores avanzados pertenecen a
                  M08.10/M08.11.
                </p>
              </section>
            </TabsContent>
            <TabsContent value="workflow" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <h3>Workflow</h3>
                <p>
                  Estados y capability refs se expresan como metadata del modelo; el motor de workflows permanece
                  separado.
                </p>
                <div className="ec-model-metrics">
                  <span>
                    <strong>{model.visibility ?? 'internal'}</strong> visibilidad
                  </span>
                  <span>
                    <strong>{model.singleton ? 'Sí' : 'No'}</strong> singleton
                  </span>
                  <span>
                    <strong>{model.capabilityRefs?.length ?? 0}</strong> capabilities
                  </span>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="storage" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <h3>Almacenamiento</h3>
                <p>PGlite + Drizzle usan `content_records` como store genérico. No existe DDL dinámico por modelo.</p>
                <div className="ec-storage-list">
                  {model.fields.map((field) => (
                    <span key={field.id}>
                      {field.label}
                      <small>
                        {String(
                          field.metadata.storageHint ?? getElectroCraftFieldRegistryEntry(field.type).storageHint,
                        )}
                      </small>
                    </span>
                  ))}
                </div>
              </section>
            </TabsContent>
            <TabsContent value="advanced" className="ec-model-tab-content">
              <section className="ec-model-panel">
                <h3>Avanzado</h3>
                <dl className="ec-model-dl">
                  <div>
                    <dt>Model ID</dt>
                    <dd>{model.id}</dd>
                  </div>
                  <div>
                    <dt>Schema ID</dt>
                    <dd>{snapshot.schema?.id ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Source ref</dt>
                    <dd>{snapshot.source?.id ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Schema version</dt>
                    <dd>{snapshot.schema?.version ?? '—'}</dd>
                  </div>
                </dl>
              </section>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
