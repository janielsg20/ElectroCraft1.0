import {
  electroCraftLayoutSchema,
  electroCraftStyleSchema,
  type ElectroCraftLayout,
  type ElectroCraftStyle,
} from '@electrocraft/domain';

export const ELECTROCRAFT_PUCK_LAYOUT_PROP = '__electrocraftLayout';
export const ELECTROCRAFT_PUCK_STYLE_PROP = '__electrocraftStyle';

export interface ElectroCraftNodePresentation {
  readonly layout: ElectroCraftLayout | null;
  readonly style: ElectroCraftStyle | null;
}

export function parsePuckNodePresentation(props: Readonly<Record<string, unknown>>): ElectroCraftNodePresentation {
  const layoutValue = props[ELECTROCRAFT_PUCK_LAYOUT_PROP];
  const styleValue = props[ELECTROCRAFT_PUCK_STYLE_PROP];
  return Object.freeze({
    layout: layoutValue === undefined || layoutValue === null ? null : electroCraftLayoutSchema.parse(layoutValue),
    style: styleValue === undefined || styleValue === null ? null : electroCraftStyleSchema.parse(styleValue),
  });
}

export function projectPuckNodePresentation(
  props: Readonly<Record<string, unknown>>,
  presentation: ElectroCraftNodePresentation,
): Record<string, unknown> {
  const projected: Record<string, unknown> = structuredClone({ ...props });
  if (presentation.layout === null) delete projected[ELECTROCRAFT_PUCK_LAYOUT_PROP];
  else projected[ELECTROCRAFT_PUCK_LAYOUT_PROP] = structuredClone(presentation.layout);
  if (presentation.style === null) delete projected[ELECTROCRAFT_PUCK_STYLE_PROP];
  else projected[ELECTROCRAFT_PUCK_STYLE_PROP] = structuredClone(presentation.style);
  return projected;
}

export function stripPuckNodePresentation(props: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const canonicalProps: Record<string, unknown> = structuredClone({ ...props });
  delete canonicalProps[ELECTROCRAFT_PUCK_LAYOUT_PROP];
  delete canonicalProps[ELECTROCRAFT_PUCK_STYLE_PROP];
  return canonicalProps;
}
