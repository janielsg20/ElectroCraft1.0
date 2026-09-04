import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import type {
  ElectroCraftDataModel,
  ElectroCraftObjectId,
  ElectroTaxonomy,
  ElectroTaxonomyTerm,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState } from 'react';
import { dataModelWorkspaceRuntime } from './data-model-runtime';

interface TaxonomyEditorProps {
  readonly model: ElectroCraftDataModel;
  readonly models: readonly ElectroCraftDataModel[];
  readonly taxonomies: readonly ElectroTaxonomy[];
}

interface TaxonomyDraft {
  readonly label: string;
  readonly key: string;
  readonly singularLabel: string;
  readonly pluralLabel: string;
  readonly description: string;
  readonly hierarchical: boolean;
  readonly modelRefs: readonly ElectroCraftObjectId[];
}

function normalizeSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function taxonomyDraft(taxonomy: ElectroTaxonomy): TaxonomyDraft {
  return {
    label: taxonomy.label,
    key: taxonomy.key,
    singularLabel: taxonomy.singularLabel,
    pluralLabel: taxonomy.pluralLabel,
    description: taxonomy.description ?? '',
    hierarchical: taxonomy.hierarchical,
    modelRefs: taxonomy.modelRefs,
  };
}

export function TaxonomyEditor({ model, models, taxonomies }: TaxonomyEditorProps) {
  const attachedTaxonomies = useMemo(
    () => taxonomies.filter(({ modelRefs }) => modelRefs.includes(model.id)),
    [model.id, taxonomies],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = attachedTaxonomies.find(({ id }) => id === selectedId) ?? attachedTaxonomies[0] ?? null;
  const [draft, setDraft] = useState<TaxonomyDraft | null>(null);
  const [terms, setTerms] = useState<readonly ElectroTaxonomyTerm[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const selectedTerm = terms.find(({ id }) => id === selectedTermId) ?? null;
  const [termName, setTermName] = useState('');
  const [termSlug, setTermSlug] = useState('');
  const [parentId, setParentId] = useState<string>('root');
  const [message, setMessage] = useState('Selecciona una taxonomía para administrar sus términos.');

  useEffect(() => {
    setSelectedId((current) =>
      attachedTaxonomies.some(({ id }) => id === current) ? current : (attachedTaxonomies[0]?.id ?? null),
    );
  }, [attachedTaxonomies]);

  useEffect(() => {
    setDraft(selected ? taxonomyDraft(selected) : null);
    setSelectedTermId(null);
    if (!selected) {
      setTerms([]);
      return;
    }
    let active = true;
    setMessage('Cargando términos…');
    void dataModelWorkspaceRuntime
      .listTaxonomyTerms(selected.id)
      .then((next) => {
        if (!active) return;
        setTerms(next);
        setMessage(next.length ? `${next.length} término(s) cargado(s).` : 'Todavía no hay términos.');
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los términos.');
      });
    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    if (!selectedTerm) return;
    setTermName(selectedTerm.name);
    setTermSlug(selectedTerm.slug);
    setParentId(selectedTerm.parentId ?? 'root');
  }, [selectedTerm]);

  async function refreshTerms(taxonomyId: string) {
    const next = await dataModelWorkspaceRuntime.listTaxonomyTerms(taxonomyId);
    setTerms(next);
    return next;
  }

  async function saveTaxonomy() {
    if (!selected || !draft) return;
    setMessage('Guardando definición…');
    try {
      await dataModelWorkspaceRuntime.updateTaxonomy(selected.id, {
        ...draft,
        modelRefs: [...draft.modelRefs],
        label: draft.label.trim(),
        key: draft.key.trim(),
        singularLabel: draft.singularLabel.trim(),
        pluralLabel: draft.pluralLabel.trim(),
        description: draft.description.trim(),
      });
      setMessage('Definición de taxonomía guardada.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la taxonomía.');
    }
  }

  async function saveTerm() {
    if (!selected) return;
    const name = termName.trim();
    const slug = normalizeSlug(termSlug || name);
    if (!name || !slug) {
      setMessage('Nombre y slug son obligatorios.');
      return;
    }
    setMessage(selectedTerm ? 'Guardando término…' : 'Creando término…');
    try {
      if (selectedTerm) {
        await dataModelWorkspaceRuntime.updateTaxonomyTerm(selected.id, {
          ...selectedTerm,
          name,
          slug,
          parentId: selected.hierarchical && parentId !== 'root' ? parentId : null,
        });
      } else {
        await dataModelWorkspaceRuntime.createTaxonomyTerm(selected.id, {
          name,
          slug,
          parentId: selected.hierarchical && parentId !== 'root' ? parentId : null,
        });
      }
      const next = await refreshTerms(selected.id);
      setSelectedTermId(selectedTerm?.id ?? null);
      setTermName('');
      setTermSlug('');
      setParentId('root');
      setMessage(`${next.length} término(s) guardado(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el término.');
    }
  }

  return (
    <div className="ec-taxonomy-layout">
      <section className="ec-model-panel ec-taxonomy-list-panel">
        <div className="ec-model-panel-heading">
          <div>
            <h3>Taxonomías</h3>
            <p>Clasificaciones portables asociadas por referencia.</p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              void dataModelWorkspaceRuntime
                .createTaxonomy(model.id)
                .then((created) => {
                  setSelectedId(created.id);
                  setMessage('Taxonomía creada.');
                })
                .catch((error: unknown) =>
                  setMessage(error instanceof Error ? error.message : 'No se pudo crear la taxonomía.'),
                )
            }
          >
            Nueva
          </Button>
        </div>
        {attachedTaxonomies.length ? (
          <div className="ec-taxonomy-list" role="list">
            {attachedTaxonomies.map((taxonomy) => (
              <button
                key={taxonomy.id}
                type="button"
                role="listitem"
                className="ec-model-item"
                aria-current={taxonomy.id === selected?.id ? 'true' : undefined}
                onClick={() => setSelectedId(taxonomy.id)}
              >
                <span>{taxonomy.label}</span>
                <small>
                  {taxonomy.hierarchical ? 'Jerárquica' : 'Plana'} · {taxonomy.key}
                </small>
              </button>
            ))}
          </div>
        ) : (
          <div className="ec-models-empty">
            <strong>Este modelo no tiene taxonomías.</strong>
            <p>Crea una definición y después administra sus términos en el gestor contextual.</p>
          </div>
        )}
      </section>

      <div className="ec-taxonomy-detail">
        {selected && draft ? (
          <>
            <section className="ec-model-panel">
              <div className="ec-model-panel-heading">
                <div>
                  <h3>Definición</h3>
                  <p>Identidad, jerarquía, modelos, campos y plantillas.</p>
                </div>
                <Button size="sm" onClick={() => void saveTaxonomy()}>
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
                  Singular
                  <Input
                    value={draft.singularLabel}
                    onChange={(event) => setDraft({ ...draft, singularLabel: event.target.value })}
                  />
                </label>
                <label>
                  Plural
                  <Input
                    value={draft.pluralLabel}
                    onChange={(event) => setDraft({ ...draft, pluralLabel: event.target.value })}
                  />
                </label>
                <label className="ec-model-form-wide">
                  Descripción
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  />
                </label>
              </div>
              <div className="ec-taxonomy-options">
                <label className="ec-model-check">
                  <Checkbox
                    checked={draft.hierarchical}
                    onCheckedChange={(checked) => setDraft({ ...draft, hierarchical: checked === true })}
                  />
                  Jerarquía padre/hijo
                </label>
                <div>
                  <strong>Modelos</strong>
                  {models.map((candidate) => {
                    const checked = draft.modelRefs.includes(candidate.id);
                    return (
                      <label key={candidate.id} className="ec-model-check">
                        <Checkbox
                          checked={checked}
                          disabled={checked && draft.modelRefs.length === 1}
                          onCheckedChange={(next) =>
                            setDraft({
                              ...draft,
                              modelRefs:
                                next === true
                                  ? [...draft.modelRefs, candidate.id]
                                  : draft.modelRefs.filter((id) => id !== candidate.id),
                            })
                          }
                        />
                        {candidate.label}
                      </label>
                    );
                  })}
                </div>
                <div>
                  <strong>Campos</strong>
                  <p>
                    {
                      models
                        .filter(({ id }) => draft.modelRefs.includes(id))
                        .flatMap(({ fields }) => fields)
                        .filter(({ taxonomyRef }) => taxonomyRef === selected.id).length
                    }{' '}
                    campo(s) enlazado(s).
                  </p>
                </div>
                <div>
                  <strong>Plantillas</strong>
                  <p>{selected.templateRefs?.length ?? 0} referencia(s) portable(s).</p>
                </div>
              </div>
            </section>

            <section className="ec-model-panel" id="taxonomy-terms">
              <div className="ec-model-panel-heading">
                <div>
                  <h3>Gestor de términos</h3>
                  <p>Contenido persistido en taxonomy_terms, separado de la definición.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTermId(null);
                    setTermName('');
                    setTermSlug('');
                    setParentId('root');
                  }}
                >
                  Nuevo término
                </Button>
              </div>
              <div className="ec-term-manager">
                <div className="ec-term-list" role="list" aria-label="Términos de la taxonomía">
                  {terms.map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      role="listitem"
                      className="ec-field-row"
                      aria-current={term.id === selectedTerm?.id ? 'true' : undefined}
                      onClick={() => setSelectedTermId(term.id)}
                    >
                      <span>
                        <strong>{term.name}</strong>
                        <small>{term.slug}</small>
                      </span>
                      <small>{term.parentId ? 'Hijo' : 'Raíz'}</small>
                    </button>
                  ))}
                  {!terms.length ? <p className="ec-advanced-hint">No hay términos guardados.</p> : null}
                </div>
                <div className="ec-term-form">
                  <label>
                    Nombre
                    <Input
                      value={termName}
                      onChange={(event) => {
                        setTermName(event.target.value);
                        if (!selectedTerm) setTermSlug(normalizeSlug(event.target.value));
                      }}
                    />
                  </label>
                  <label>
                    Slug
                    <Input value={termSlug} onChange={(event) => setTermSlug(normalizeSlug(event.target.value))} />
                  </label>
                  {selected.hierarchical ? (
                    <label>
                      Padre
                      <Select value={parentId} onValueChange={setParentId}>
                        <SelectTrigger aria-label="Término padre">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">Sin padre</SelectItem>
                          {terms
                            .filter(({ id }) => id !== selectedTerm?.id)
                            .map((term) => (
                              <SelectItem key={term.id} value={term.id}>
                                {term.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </label>
                  ) : null}
                  <div className="ec-model-actions">
                    <Button size="sm" onClick={() => void saveTerm()}>
                      {selectedTerm ? 'Guardar término' : 'Crear término'}
                    </Button>
                    {selectedTerm ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void dataModelWorkspaceRuntime
                            .deleteTaxonomyTerm(selected.id, selectedTerm.id)
                            .then(() => refreshTerms(selected.id))
                            .then(() => {
                              setSelectedTermId(null);
                              setTermName('');
                              setTermSlug('');
                              setMessage('Término eliminado.');
                            })
                            .catch((error: unknown) =>
                              setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el término.'),
                            )
                        }
                      >
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                </div>
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
