import { migrate, walkTree, type ComponentData, type Config, type Data } from '@puckeditor/core';
import {
  electroCraftDocumentNodeSchema,
  electroCraftDocumentSchema,
  type ElectroCraftDocument,
  type ElectroCraftDocumentNode,
  type JsonValue,
} from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_PROPS_PROP,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP,
} from './puck-adapter-contract';

export type PuckEditorData = Data;
export type PuckDocumentDiagnosticCode =
  'unknown-component' | 'unsupported-children' | 'reserved-prop' | 'unknown-puck-component';

type CanonicalDiagnosticCode = Exclude<PuckDocumentDiagnosticCode, 'unknown-puck-component'>;

export interface PuckDocumentDiagnostic {
  readonly code: PuckDocumentDiagnosticCode;
  readonly nodeId: string;
  readonly componentRef: string;
  readonly message: string;
}

export interface PuckDocumentProjection {
  readonly data: PuckEditorData;
  readonly diagnostics: readonly PuckDocumentDiagnostic[];
}

export interface PuckDocumentReconstruction {
  readonly document: ElectroCraftDocument;
  readonly diagnostics: readonly PuckDocumentDiagnostic[];
}

export interface PuckDocumentAdapterOptions {
  readonly knownComponentRefs: readonly string[];
  readonly slotByComponentRef?: Readonly<Record<string, string>>;
  readonly migrationConfig?: Config;
}

export interface PuckDocumentAdapter {
  toPuck(document: ElectroCraftDocument): PuckDocumentProjection;
  fromPuck(data: PuckEditorData, baseDocument: ElectroCraftDocument): PuckDocumentReconstruction;
}

const defaultSlots: Readonly<Record<string, string>> = Object.freeze({
  Container: ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  Section: ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  Tabs: ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  Accordion: ELECTROCRAFT_PUCK_CHILDREN_SLOT,
});

function cloneCanonicalProps(props: Readonly<Record<string, JsonValue>>): Record<string, JsonValue> {
  return structuredClone(props);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringProp(props: Record<string, unknown>, key: string): string | null {
  const value = props[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function diagnosticMessage(code: PuckDocumentDiagnosticCode, componentRef: string) {
  switch (code) {
    case 'unknown-component':
    case 'unknown-puck-component':
      return `Componente no disponible: ${componentRef}`;
    case 'unsupported-children':
      return `El componente ${componentRef} no admite contenido anidado en este mapping.`;
    case 'reserved-prop':
      return `El componente ${componentRef} usa una propiedad reservada por el adapter Puck.`;
  }
}

function hasLegacyZoneContent(data: PuckEditorData) {
  if (!data.zones) return false;
  return Object.values(data.zones).some((zone) => zone.length > 0);
}

/**
 * Uses Puck's public migration and tree utilities rather than maintaining an
 * ElectroCraft copy of the engine's DropZone -> Slot traversal rules.
 */
export function migrateLegacyPuckDataToSlots(data: PuckEditorData, config: Config): PuckEditorData {
  const migrated = migrate(structuredClone(data), config);

  if (hasLegacyZoneContent(migrated)) {
    throw new TypeError('Puck legacy zones remain after Slot migration; migration config does not cover all content');
  }

  // Exercise Puck's slot-aware traversal only after every legacy zone has
  // migrated, so incomplete configs fail closed with an ElectroCraft error
  // instead of leaking an internal walkTree exception.
  walkTree(migrated, config, (content) => {
    if (!Array.isArray(content)) {
      throw new TypeError('Puck migrated slot content must be an array');
    }
    return content;
  });

  return migrated;
}

function currentRootProps(data: PuckEditorData): Record<string, unknown> {
  const root = data.root as unknown;
  if (!isRecord(root) || !isRecord(root.props)) {
    throw new TypeError('Puck root must use the current root.props shape');
  }
  return root.props;
}

function pushDiagnostic(
  diagnostics: PuckDocumentDiagnostic[],
  code: PuckDocumentDiagnosticCode,
  nodeId: string,
  componentRef: string,
) {
  diagnostics.push({
    code,
    nodeId,
    componentRef,
    message: diagnosticMessage(code, componentRef),
  });
}

export function createPuckDocumentAdapter(options: PuckDocumentAdapterOptions): PuckDocumentAdapter {
  const knownComponentRefs = new Set(options.knownComponentRefs);
  const slotByComponentRef: Readonly<Record<string, string>> = Object.freeze({
    ...defaultSlots,
    ...options.slotByComponentRef,
  });

  function diagnosticComponent(
    node: ElectroCraftDocumentNode,
    code: CanonicalDiagnosticCode,
    children: ComponentData[],
  ): ComponentData {
    return {
      type: ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT,
      props: {
        id: node.id,
        [ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP]: code,
        [ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP]: node.componentRef,
        [ELECTROCRAFT_PUCK_DIAGNOSTIC_PROPS_PROP]: cloneCanonicalProps(node.props),
        [ELECTROCRAFT_PUCK_CHILDREN_SLOT]: children,
      },
    };
  }

  function projectNode(
    node: ElectroCraftDocumentNode,
    diagnostics: PuckDocumentDiagnostic[],
    seenIds: Set<string>,
  ): ComponentData {
    if (seenIds.has(node.id)) {
      throw new TypeError(`duplicate ElectroCraft node id: ${node.id}`);
    }
    seenIds.add(node.id);

    const children = node.children.map((child) => projectNode(child, diagnostics, seenIds));
    const slot = slotByComponentRef[node.componentRef];
    let diagnosticCode: CanonicalDiagnosticCode | null = null;

    if (!knownComponentRefs.has(node.componentRef)) {
      diagnosticCode = 'unknown-component';
    } else if (node.children.length > 0 && !slot) {
      diagnosticCode = 'unsupported-children';
    } else if ('id' in node.props || (slot ? slot in node.props : false)) {
      diagnosticCode = 'reserved-prop';
    }

    if (diagnosticCode) {
      pushDiagnostic(diagnostics, diagnosticCode, node.id, node.componentRef);
      return diagnosticComponent(node, diagnosticCode, children);
    }

    const props: ComponentData['props'] = { id: node.id, ...cloneCanonicalProps(node.props) };
    if (slot) props[slot] = children;
    return { type: node.componentRef, props };
  }

  function reconstructDiagnostic(
    props: Record<string, unknown>,
    id: string,
    diagnostics: PuckDocumentDiagnostic[],
    seenIds: Set<string>,
  ): ElectroCraftDocumentNode {
    const componentRef = stringProp(props, ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP);
    const originalProps = props[ELECTROCRAFT_PUCK_DIAGNOSTIC_PROPS_PROP];
    const rawChildren = props[ELECTROCRAFT_PUCK_CHILDREN_SLOT] ?? [];

    if (!componentRef || !isRecord(originalProps) || !Array.isArray(rawChildren)) {
      throw new TypeError(`invalid ElectroCraft diagnostic component: ${id}`);
    }

    const codeValue = props[ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP];
    let code: CanonicalDiagnosticCode = 'unknown-component';
    if (codeValue === 'unsupported-children' || codeValue === 'reserved-prop') {
      code = codeValue;
    }

    pushDiagnostic(diagnostics, code, id, componentRef);
    const children = rawChildren.map((child) => reconstructNode(child as ComponentData, diagnostics, seenIds));

    return electroCraftDocumentNodeSchema.parse({
      id,
      componentRef,
      props: structuredClone(originalProps),
      children,
    });
  }

  function reconstructNode(
    component: ComponentData,
    diagnostics: PuckDocumentDiagnostic[],
    seenIds: Set<string>,
  ): ElectroCraftDocumentNode {
    if (!isRecord(component.props)) {
      throw new TypeError(`Puck component props must be an object: ${String(component.type)}`);
    }

    const props = component.props;
    const id = stringProp(props, 'id');
    if (!id) {
      throw new TypeError(`Puck component is missing a stable id: ${String(component.type)}`);
    }
    if (seenIds.has(id)) {
      throw new TypeError(`duplicate Puck component id: ${id}`);
    }
    seenIds.add(id);

    if (component.type === ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT) {
      return reconstructDiagnostic(props, id, diagnostics, seenIds);
    }

    const componentRef = String(component.type);
    const slot = slotByComponentRef[componentRef];
    let rawChildren: unknown = slot ? props[slot] : undefined;
    const unknownComponent = !knownComponentRefs.has(componentRef);

    if (unknownComponent) {
      const fallbackChildren = props[ELECTROCRAFT_PUCK_CHILDREN_SLOT];
      rawChildren = Array.isArray(fallbackChildren) ? fallbackChildren : [];
      pushDiagnostic(diagnostics, 'unknown-puck-component', id, componentRef);
    }

    if (rawChildren !== undefined && !Array.isArray(rawChildren)) {
      const slotName = slot ?? ELECTROCRAFT_PUCK_CHILDREN_SLOT;
      throw new TypeError(`Puck slot ${componentRef}.${slotName} must be an array`);
    }

    const canonicalProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === 'id') continue;
      if (slot && key === slot) continue;
      if (unknownComponent && key === ELECTROCRAFT_PUCK_CHILDREN_SLOT) continue;
      canonicalProps[key] = structuredClone(value);
    }

    const children = (rawChildren ?? []).map((child) => reconstructNode(child as ComponentData, diagnostics, seenIds));

    return electroCraftDocumentNodeSchema.parse({
      id,
      componentRef,
      props: canonicalProps,
      children,
    });
  }

  return Object.freeze({
    toPuck(document: ElectroCraftDocument): PuckDocumentProjection {
      const canonical = electroCraftDocumentSchema.parse(document);
      const diagnostics: PuckDocumentDiagnostic[] = [];
      const seenIds = new Set<string>([canonical.root.id]);
      const content = canonical.root.children.map((child) => projectNode(child, diagnostics, seenIds));

      return Object.freeze({
        data: { content, root: { props: cloneCanonicalProps(canonical.root.props) } },
        diagnostics: Object.freeze(diagnostics),
      });
    },
    fromPuck(data: PuckEditorData, baseDocument: ElectroCraftDocument): PuckDocumentReconstruction {
      const currentData = hasLegacyZoneContent(data)
        ? options.migrationConfig
          ? migrateLegacyPuckDataToSlots(data, options.migrationConfig)
          : (() => {
              throw new TypeError('Puck legacy zones require a Slot migration config before canonical reconstruction');
            })()
        : data;

      if (!Array.isArray(currentData.content)) {
        throw new TypeError('Puck data content must be an array');
      }

      const base = electroCraftDocumentSchema.parse(baseDocument);
      const diagnostics: PuckDocumentDiagnostic[] = [];
      const seenIds = new Set<string>([base.root.id]);
      const children = currentData.content.map((component) => reconstructNode(component, diagnostics, seenIds));
      const root = electroCraftDocumentNodeSchema.parse({
        ...base.root,
        props: structuredClone(currentRootProps(currentData)),
        children,
      });
      const document = electroCraftDocumentSchema.parse({ ...base, root });

      return Object.freeze({ document, diagnostics: Object.freeze(diagnostics) });
    },
  });
}
