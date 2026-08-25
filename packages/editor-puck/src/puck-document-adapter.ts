import type { ComponentData, Data } from '@puckeditor/core';
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
  | 'unknown-component'
  | 'unsupported-children'
  | 'reserved-prop'
  | 'unknown-puck-component';

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
}

export interface PuckDocumentAdapter {
  toPuck(document: ElectroCraftDocument): PuckDocumentProjection;
  fromPuck(data: PuckEditorData, baseDocument: ElectroCraftDocument): PuckDocumentReconstruction;
}

const defaultSlots = Object.freeze({ Container: ELECTROCRAFT_PUCK_CHILDREN_SLOT });

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
  return data.zones ? Object.values(data.zones).some((zone) => zone.length > 0) : false;
}

function currentRootProps(data: PuckEditorData): Record<string, unknown> {
  const root = data.root as unknown;
  if (!isRecord(root) || !isRecord(root.props)) {
    throw new TypeError('Puck root must use the current root.props shape');
  }
  return root.props;
}

export function createPuckDocumentAdapter(options: PuckDocumentAdapterOptions): PuckDocumentAdapter {
  const knownComponentRefs = new Set(options.knownComponentRefs);
  const slotByComponentRef = Object.freeze({ ...defaultSlots, ...options.slotByComponentRef });

  function diagnosticComponent(
    node: ElectroCraftDocumentNode,
    code: Exclude<PuckDocumentDiagnosticCode, 'unknown-puck-component'>,
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
    let diagnosticCode: Exclude<PuckDocumentDiagnosticCode, 'unknown-puck-component'> | null = null;

    if (!knownComponentRefs.has(node.componentRef)) {
      diagnosticCode = 'unknown-component';
    } else if (node.children.length > 0 && !slot) {
      diagnosticCode = 'unsupported-children';
    } else if ('id' in node.props || (slot ? slot in node.props : false)) {
      diagnosticCode = 'reserved-prop';
    }

    if (diagnosticCode) {
      diagnostics.push({
        code: diagnosticCode,
        nodeId: node.id,
        componentRef: node.componentRef,
        message: diagnosticMessage(diagnosticCode, node.componentRef),
      });
      return diagnosticComponent(node, diagnosticCode, children);
    }

    const props: Record<string, unknown> = { id: node.id, ...cloneCanonicalProps(node.props) };
    if (slot) props[slot] = children;
    return { type: node.componentRef, props };
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
    if (!id) throw new TypeError(`Puck component is missing a stable id: ${String(component.type)}`);
    if (seenIds.has(id)) throw new TypeError(`duplicate Puck component id: ${id}`);
    seenIds.add(id);

    if (component.type === ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT) {
      const componentRef = stringProp(props, ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP);
      const originalProps = props[ELECTROCRAFT_PUCK_DIAGNOSTIC_PROPS_PROP];
      const rawChildren = props[ELECTROCRAFT_PUCK_CHILDREN_SLOT] ?? [];
      if (!componentRef || !isRecord(originalProps) || !Array.isArray(rawChildren)) {
        throw new TypeError(`invalid ElectroCraft diagnostic component: ${id}`);
      }
      const codeValue = props[ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP];
      const code: PuckDocumentDiagnosticCode =
        codeValue === 'unsupported-children' || codeValue === 'reserved-prop' ? codeValue : 'unknown-component';
      diagnostics.push({ code, nodeId: id, componentRef, message: diagnosticMessage(code, componentRef) });
      return electroCraftDocumentNodeSchema.parse({
        id,
        componentRef,
        props: structuredClone(originalProps),
        children: rawChildren.map((child) => reconstructNode(child as ComponentData, diagnostics, seenIds)),
      });
    }

    const componentRef = String(component.type);
    const slot = slotByComponentRef[componentRef];
    let rawChildren: unknown = slot ? props[slot] : undefined;
    let unknownComponent = false;
    if (!knownComponentRefs.has(componentRef)) {
      unknownComponent = true;
      rawChildren = Array.isArray(props[ELECTROCRAFT_PUCK_CHILDREN_SLOT])
        ? props[ELECTROCRAFT_PUCK_CHILDREN_SLOT]
        : [];
      diagnostics.push({
        code: 'unknown-puck-component',
        nodeId: id,
        componentRef,
        message: diagnosticMessage('unknown-puck-component', componentRef),
      });
    }
    if (rawChildren !== undefined && !Array.isArray(rawChildren)) {
      throw new TypeError(`Puck slot ${componentRef}.${slot ?? ELECTROCRAFT_PUCK_CHILDREN_SLOT} must be an array`);
    }

    const canonicalProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === 'id') continue;
      if (slot && key === slot) continue;
      if (unknownComponent && key === ELECTROCRAFT_PUCK_CHILDREN_SLOT) continue;
      canonicalProps[key] = structuredClone(value);
    }

    return electroCraftDocumentNodeSchema.parse({
      id,
      componentRef,
      props: canonicalProps,
      children: (rawChildren ?? []).map((child) => reconstructNode(child as ComponentData, diagnostics, seenIds)),
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
      if (hasLegacyZoneContent(data)) {
        throw new TypeError('Puck legacy zones with content are not supported by the canonical Slot adapter');
      }
      if (!Array.isArray(data.content)) {
        throw new TypeError('Puck data content must be an array');
      }
      const base = electroCraftDocumentSchema.parse(baseDocument);
      const diagnostics: PuckDocumentDiagnostic[] = [];
      const seenIds = new Set<string>([base.root.id]);
      const children = data.content.map((component) => reconstructNode(component, diagnostics, seenIds));
      const root = electroCraftDocumentNodeSchema.parse({
        ...base.root,
        props: structuredClone(currentRootProps(data)),
        children,
      });
      const document = electroCraftDocumentSchema.parse({ ...base, root });
      return Object.freeze({ document, diagnostics: Object.freeze(diagnostics) });
    },
  });
}
