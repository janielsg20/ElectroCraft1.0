import type { ComponentConfig, Config, Field } from '@puckeditor/core';
import type { ElectroCraftComponentDefinition, ElectroCraftComponentField } from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT,
} from './puck-adapter-contract';

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

export interface PuckSlotMapping {
  readonly field?: string;
  readonly label?: string;
  readonly allow?: readonly string[];
  readonly disallow?: readonly string[];
}

export interface PuckConfigOptions {
  readonly slots?: Readonly<Record<string, PuckSlotMapping>>;
  readonly diagnosticRenderer?: PuckCanonicalRenderer;
  readonly diagnosticLabel?: string;
}

export const electroCraftCorePuckSlots = Object.freeze({
  Container: Object.freeze({ field: ELECTROCRAFT_PUCK_CHILDREN_SLOT, label: 'Contenido' }),
} satisfies Readonly<Record<string, PuckSlotMapping>>);

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

function toSlotField(slot: PuckSlotMapping): Field {
  return {
    type: 'slot',
    label: slot.label ?? 'Contenido',
    ...(slot.allow ? { allow: [...slot.allow] } : {}),
    ...(slot.disallow ? { disallow: [...slot.disallow] } : {}),
  };
}

export function createPuckComponentConfig(
  definition: ElectroCraftComponentDefinition,
  renderer: PuckCanonicalRenderer,
  labels: PuckLabelResolver = fallbackPuckLabelResolver,
  slot?: PuckSlotMapping,
): PuckCanonicalComponentConfig {
  const fields: Record<string, Field> = {};
  for (const field of definition.fields) {
    fields[field.key] = toPuckField(definition, field, labels);
  }

  const slotField = slot?.field ?? ELECTROCRAFT_PUCK_CHILDREN_SLOT;
  if (slot) {
    if (fields[slotField]) {
      throw new TypeError(`Puck slot collides with canonical field: ${definition.key}.${slotField}`);
    }
    fields[slotField] = toSlotField(slot);
  }

  return {
    label: labels.component(definition),
    fields,
    defaultProps: slot ? { ...definition.defaultProps, [slotField]: [] } : definition.defaultProps,
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
  options: PuckConfigOptions = {},
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

    components[definition.key] = createPuckComponentConfig(
      definition,
      renderer,
      labels,
      options.slots?.[definition.key],
    );
  }

  if (options.diagnosticRenderer) {
    components[ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT] = {
      label: options.diagnosticLabel ?? 'Componente no disponible',
      fields: {
        [ELECTROCRAFT_PUCK_CHILDREN_SLOT]: {
          type: 'slot',
          label: 'Contenido recuperable',
        },
      },
      defaultProps: { [ELECTROCRAFT_PUCK_CHILDREN_SLOT]: [] },
      metadata: { electrocraftDiagnostic: true },
      render: options.diagnosticRenderer,
    };
  }

  return { components };
}
