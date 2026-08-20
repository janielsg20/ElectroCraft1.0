import type { ComponentConfig, Config, Field } from '@puckeditor/core';
import type { ElectroCraftComponentDefinition, ElectroCraftComponentField } from '@electrocraft/domain';

export type PuckCanonicalProps = Record<string, unknown>;
export type PuckCanonicalComponentConfig = ComponentConfig<PuckCanonicalProps>;
export type PuckCanonicalRenderer = PuckCanonicalComponentConfig['render'];
export type PuckRendererRegistry = Readonly<Record<string, PuckCanonicalRenderer>>;
export type PuckCanonicalConfig = Config;

export interface PuckLabelResolver {
  readonly component: (definition: ElectroCraftComponentDefinition) => string;
  readonly field: (definition: ElectroCraftComponentDefinition, field: ElectroCraftComponentField) => string;
  readonly booleanOption: (value: boolean) => string;
}

const fallbackPuckLabelResolver: PuckLabelResolver = Object.freeze({
  component: (definition: ElectroCraftComponentDefinition) => definition.label,
  field: (_definition: ElectroCraftComponentDefinition, field: ElectroCraftComponentField) => field.label,
  booleanOption: (value: boolean) => (value ? 'Sí' : 'No'),
});

function toPuckField(
  definition: ElectroCraftComponentDefinition,
  field: ElectroCraftComponentField,
  labels: PuckLabelResolver,
): Field {
  const base = {
    label: labels.field(definition, field),
    metadata: {
      electrocraftRequired: field.required,
    },
  };

  switch (field.kind) {
    case 'text':
      return { ...base, type: 'text' };
    case 'number':
      return { ...base, type: 'number' };
    case 'boolean':
      return {
        ...base,
        type: 'radio',
        options: [
          { label: labels.booleanOption(true), value: true },
          { label: labels.booleanOption(false), value: false },
        ],
      };
    case 'select':
      return {
        ...base,
        type: 'select',
        options: field.options,
      };
  }
}

export function createPuckComponentConfig(
  definition: ElectroCraftComponentDefinition,
  renderer: PuckCanonicalRenderer,
  labels: PuckLabelResolver = fallbackPuckLabelResolver,
): PuckCanonicalComponentConfig {
  const fields: Record<string, Field> = {};
  for (const field of definition.fields) {
    fields[field.key] = toPuckField(definition, field, labels);
  }

  return {
    label: labels.component(definition),
    fields,
    defaultProps: definition.defaultProps,
    metadata: {
      electrocraftComponentId: definition.id,
      electrocraftVersion: definition.version,
      electrocraftLayout: definition.layout,
      electrocraftStyle: definition.style,
    },
    render: renderer,
  };
}

export function createPuckConfig(
  definitions: readonly ElectroCraftComponentDefinition[],
  renderers: PuckRendererRegistry,
  labels: PuckLabelResolver = fallbackPuckLabelResolver,
): PuckCanonicalConfig {
  const components: PuckCanonicalConfig['components'] = {};
  const seen = new Set<string>();

  for (const definition of definitions) {
    if (seen.has(definition.key)) {
      throw new TypeError(`duplicate component key: ${definition.key}`);
    }
    seen.add(definition.key);

    const renderer = renderers[definition.key];
    if (!renderer) {
      throw new TypeError(`missing Puck renderer for component key: ${definition.key}`);
    }

    components[definition.key] = createPuckComponentConfig(definition, renderer, labels);
  }

  return { components };
}
