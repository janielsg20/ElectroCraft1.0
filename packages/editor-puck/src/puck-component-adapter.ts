import type { ComponentConfig, Config, Field } from '@puckeditor/core';
import type { ElectroCraftComponentDefinition, ElectroCraftComponentField } from '@electrocraft/domain';
import { ELECTROCRAFT_PUCK_CHILDREN_SLOT, ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT } from './puck-adapter-contract';

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

export type PuckInlineFieldMode = 'text' | 'richtext';

export interface PuckInlineEditingMapping {
  readonly mode: PuckInlineFieldMode;
  readonly fieldKeys?: readonly string[];
}

export type PuckInlineEditingRegistry = Readonly<Record<string, PuckInlineEditingMapping>>;

/**
 * Owner-neutral editor policy translated at the Puck boundary. The canonical
 * model does not persist Puck permissions; callers may supply lock/editability
 * policy when that capability exists in their owner.
 */
export interface ElectroCraftEditorPolicy {
  readonly locked?: boolean;
  readonly editable?: boolean;
  readonly insertable?: boolean;
}

export interface PuckConfigOptions {
  readonly slots?: Readonly<Record<string, PuckSlotMapping>>;
  readonly inlineEditing?: PuckInlineEditingRegistry;
  readonly editorPolicies?: Readonly<Record<string, ElectroCraftEditorPolicy>>;
  readonly diagnosticRenderer?: PuckCanonicalRenderer;
  readonly diagnosticLabel?: string;
}

const childrenSlot = (label: string): PuckSlotMapping =>
  Object.freeze({ field: ELECTROCRAFT_PUCK_CHILDREN_SLOT, label });

/**
 * Stable single-child-collection mappings for canonical recursive nodes.
 * Presets such as Section may resolve to Container before reaching this map;
 * explicit keys remain available for registries that own those definitions.
 */
export const electroCraftCorePuckSlots = Object.freeze({
  Container: childrenSlot('Contenido'),
  Section: childrenSlot('Contenido de la sección'),
  Tabs: childrenSlot('Contenido de las pestañas'),
  Accordion: childrenSlot('Contenido del acordeón'),
} satisfies Readonly<Record<string, PuckSlotMapping>>);

/**
 * Puck owns inline authoring. ElectroCraft only declares which canonical
 * component projections should opt into the public Puck field transforms.
 * Heading/paragraph presets resolve through Text and inherit this capability.
 */
export const electroCraftCorePuckInlineEditing = Object.freeze({
  Text: Object.freeze({ mode: 'text' as const }),
  RichText: Object.freeze({ mode: 'richtext' as const }),
} satisfies PuckInlineEditingRegistry);

const fallbackPuckLabelResolver: PuckLabelResolver = Object.freeze({
  component: (definition: ElectroCraftComponentDefinition) => definition.label,
  field: (_definition: ElectroCraftComponentDefinition, field: ElectroCraftComponentField) => field.label,
  booleanOption: (value: boolean) => (value ? 'Sí' : 'No'),
});

function resolveInlineFieldMode(
  field: ElectroCraftComponentField,
  inlineEditing?: PuckInlineEditingMapping,
): PuckInlineFieldMode | undefined {
  if (!inlineEditing || field.kind !== 'text') return undefined;
  if (inlineEditing.fieldKeys && !inlineEditing.fieldKeys.includes(field.key)) return undefined;
  return inlineEditing.mode;
}

function toPuckField(
  definition: ElectroCraftComponentDefinition,
  field: ElectroCraftComponentField,
  labels: PuckLabelResolver,
  inlineMode?: PuckInlineFieldMode,
): Field {
  const base = {
    label: labels.field(definition, field),
    metadata: {
      electrocraftRequired: field.required,
    },
  };

  switch (field.kind) {
    case 'text':
      if (inlineMode === 'richtext') {
        return { ...base, type: 'richtext', contentEditable: true };
      }
      return { ...base, type: 'text', ...(inlineMode === 'text' ? { contentEditable: true } : {}) };
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

function toPuckPermissions(policy?: ElectroCraftEditorPolicy) {
  if (!policy) return undefined;
  const permissions = {
    ...(policy.locked === true ? { drag: false, delete: false, duplicate: false, edit: false } : {}),
    ...(policy.locked !== true && policy.editable === false ? { edit: false } : {}),
    ...(policy.insertable === false ? { insert: false } : {}),
  };
  return Object.keys(permissions).length > 0 ? permissions : undefined;
}

function validateInlineEditingMapping(
  definition: ElectroCraftComponentDefinition,
  inlineEditing?: PuckInlineEditingMapping,
) {
  if (!inlineEditing?.fieldKeys) return;
  const fieldKeys = new Set(definition.fields.map((field) => field.key));
  for (const fieldKey of inlineEditing.fieldKeys) {
    if (!fieldKeys.has(fieldKey)) {
      throw new TypeError(`Puck inline field is not canonical: ${definition.key}.${fieldKey}`);
    }
  }
}

/**
 * Puck.Components owns the draggable component list. ElectroCraft projects the
 * canonical category label into Puck's public categories API instead of
 * rebuilding category semantics in a second component registry.
 */
export function createPuckCategories(
  definitions: readonly ElectroCraftComponentDefinition[],
  includeDiagnosticCategory = false,
): NonNullable<PuckCanonicalConfig['categories']> {
  const categories: Record<string, { title: string; components: string[]; visible?: boolean }> = {};

  for (const definition of definitions) {
    const category = categories[definition.category];
    if (category) {
      category.components.push(definition.key);
      continue;
    }
    categories[definition.category] = {
      title: definition.category,
      components: [definition.key],
    };
  }

  if (includeDiagnosticCategory) {
    categories.__electrocraftDiagnostics = {
      title: 'Diagnósticos',
      components: [ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT],
      visible: false,
    };
  }

  return categories;
}

export function createPuckComponentConfig(
  definition: ElectroCraftComponentDefinition,
  renderer: PuckCanonicalRenderer,
  labels: PuckLabelResolver = fallbackPuckLabelResolver,
  slot?: PuckSlotMapping,
  editorPolicy?: ElectroCraftEditorPolicy,
  inlineEditing?: PuckInlineEditingMapping,
): PuckCanonicalComponentConfig {
  validateInlineEditingMapping(definition, inlineEditing);
  const fields: Record<string, Field> = {};
  for (const field of definition.fields) {
    fields[field.key] = toPuckField(definition, field, labels, resolveInlineFieldMode(field, inlineEditing));
  }

  const slotField = slot?.field ?? ELECTROCRAFT_PUCK_CHILDREN_SLOT;
  if (slot) {
    if (fields[slotField]) {
      throw new TypeError(`Puck slot collides with canonical field: ${definition.key}.${slotField}`);
    }
    fields[slotField] = toSlotField(slot);
  }

  const permissions = toPuckPermissions(editorPolicy);

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
    ...(permissions ? { permissions } : {}),
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
      options.editorPolicies?.[definition.key],
      options.inlineEditing?.[definition.key],
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
      permissions: { insert: false },
      render: options.diagnosticRenderer,
    };
  }

  return {
    components,
    categories: createPuckCategories(definitions, Boolean(options.diagnosticRenderer)),
  };
}
