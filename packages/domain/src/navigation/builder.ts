import * as z from 'zod';
import { type JsonValue } from '../contracts/json-value';
import { type ElectroCraftNavigationNode, type ElectroCraftNavigatorKind } from './index';

export const electroCraftNavigationHeaderBehaviorSchema = z.strictObject({
  visible: z.boolean(),
  title: z.string().trim().min(1).max(160).nullable(),
  backBehavior: z.enum(['auto', 'hidden', 'parent']),
});

export const electroCraftNavigationItemPresentationSchema = z.strictObject({
  icon: z.string().trim().min(1).max(120).nullable(),
  visible: z.boolean(),
});

export const electroCraftTabsPresentationSchema = z.strictObject({
  placement: z.enum(['top', 'bottom']),
  showLabels: z.boolean(),
});

export const electroCraftDrawerPresentationSchema = z.strictObject({
  side: z.enum(['left', 'right']),
  width: z.number().int().min(220).max(520),
});

export const electroCraftModalPresentationSchema = z.strictObject({
  presentation: z.enum(['dialog', 'sheet', 'fullscreen']),
});

export const electroCraftNavigationBuilderPresentationSchema = z.strictObject({
  schemaVersion: z.literal(1),
  item: electroCraftNavigationItemPresentationSchema,
  header: electroCraftNavigationHeaderBehaviorSchema,
  tabs: electroCraftTabsPresentationSchema.nullable(),
  drawer: electroCraftDrawerPresentationSchema.nullable(),
  modal: electroCraftModalPresentationSchema.nullable(),
});
export type ElectroCraftNavigationBuilderPresentation = z.infer<typeof electroCraftNavigationBuilderPresentationSchema>;

export function createDefaultNavigationBuilderPresentation(
  kind: ElectroCraftNavigationNode['kind'],
): ElectroCraftNavigationBuilderPresentation {
  return electroCraftNavigationBuilderPresentationSchema.parse({
    schemaVersion: 1,
    item: { icon: null, visible: true },
    header: { visible: kind !== 'tabs', title: null, backBehavior: kind === 'modal' ? 'parent' : 'auto' },
    tabs: kind === 'tabs' ? { placement: 'bottom', showLabels: true } : null,
    drawer: kind === 'drawer' ? { side: 'left', width: 300 } : null,
    modal: kind === 'modal' ? { presentation: 'dialog' } : null,
  });
}

export function readNavigationBuilderPresentation(
  node: ElectroCraftNavigationNode,
): ElectroCraftNavigationBuilderPresentation {
  const stored = node.metadata.navigationBuilder;
  const parsed = electroCraftNavigationBuilderPresentationSchema.safeParse(stored);
  return parsed.success ? parsed.data : createDefaultNavigationBuilderPresentation(node.kind);
}

export function navigationBuilderMetadata(
  node: ElectroCraftNavigationNode,
  presentationInput: unknown,
): Record<string, JsonValue> {
  const presentation = electroCraftNavigationBuilderPresentationSchema.parse(presentationInput);
  return {
    ...node.metadata,
    navigationBuilder: presentation as unknown as JsonValue,
  };
}

export function navigationBuilderPresentationForKind(
  current: ElectroCraftNavigationBuilderPresentation,
  kind: ElectroCraftNavigatorKind,
): ElectroCraftNavigationBuilderPresentation {
  const defaults = createDefaultNavigationBuilderPresentation(kind);
  return electroCraftNavigationBuilderPresentationSchema.parse({
    ...defaults,
    item: current.item,
    header: current.header,
  });
}
