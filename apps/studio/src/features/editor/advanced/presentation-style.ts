import type {
  ElectroCraftColor,
  ElectroCraftLayout,
  ElectroCraftLength,
  ElectroCraftStyle,
  ElectroCraftBreakpointId,
} from '@electrocraft/domain';
import { resolveResponsiveStyleDeclaration } from '@electrocraft/domain';
import { parsePuckNodePresentation } from '@electrocraft/editor-puck';
import type { CSSProperties } from 'react';

const tokenLengths: Readonly<Record<string, string>> = Object.freeze({
  'spacing.1': 'var(--ec-space-1)',
  'spacing.2': 'var(--ec-space-2)',
  'spacing.4': 'var(--ec-space-4)',
});

const tokenColors: Readonly<Record<string, string>> = Object.freeze({
  'color.surface': 'var(--background)',
  'color.muted': 'var(--muted)',
  'color.primary': 'var(--primary)',
});

function length(value: ElectroCraftLength | null): string | number | undefined {
  if (!value) return undefined;
  if (value.kind === 'token')
    return tokenLengths[value.token] ?? `var(--ec-project-${value.token.replaceAll('.', '-')})`;
  if (value.unit === 'unitless') return value.value;
  if (value.unit === 'percent') return `${value.value}%`;
  return `${value.value}${value.unit}`;
}

function color(value: ElectroCraftColor | null): string | undefined {
  if (!value) return undefined;
  if (value.kind === 'token')
    return tokenColors[value.token] ?? `var(--ec-project-${value.token.replaceAll('.', '-')})`;
  return `rgba(${value.red}, ${value.green}, ${value.blue}, ${value.alpha})`;
}

function layoutStyle(layout: ElectroCraftLayout): CSSProperties {
  const shared: CSSProperties = {
    gap: length(layout.gap),
    alignItems: layout.align === 'start' ? 'flex-start' : layout.align === 'end' ? 'flex-end' : layout.align,
    justifyContent: layout.justify,
  };
  if (layout.mode === 'stack') return { ...shared, display: 'flex', flexDirection: 'column' };
  if (layout.mode === 'row')
    return { ...shared, display: 'flex', flexDirection: 'row', flexWrap: layout.wrap ? 'wrap' : 'nowrap' };
  if (layout.mode === 'grid')
    return { ...shared, display: 'grid', gridTemplateColumns: `repeat(${layout.columns ?? 1}, minmax(0, 1fr))` };
  if (layout.mode === 'overlay') return { ...shared, position: 'relative' };
  return shared;
}

function declarationStyle(
  style: ElectroCraftStyle,
  breakpointIds: readonly ElectroCraftBreakpointId[],
  breakpointId: ElectroCraftBreakpointId | null,
): CSSProperties {
  const base = resolveResponsiveStyleDeclaration(
    { base: style.base, overrides: style.responsive },
    breakpointIds,
    breakpointId,
  );
  return {
    width: length(base.width),
    height: length(base.height),
    minWidth: length(base.minWidth),
    maxWidth: length(base.maxWidth),
    gap: length(base.gap),
    padding: length(base.padding),
    margin: length(base.margin),
    fontSize: length(base.fontSize),
    fontWeight: base.fontWeight ?? undefined,
    textAlign: base.textAlign ?? undefined,
    color: color(base.foreground),
    background: color(base.background),
    opacity: base.opacity ?? undefined,
  };
}

export function resolveStudioPresentationStyle(
  props: Readonly<Record<string, unknown>>,
  fallbackLayout: ElectroCraftLayout,
  fallbackStyle: ElectroCraftStyle,
  breakpointIds: readonly ElectroCraftBreakpointId[] = [],
  breakpointId: ElectroCraftBreakpointId | null = null,
): CSSProperties {
  const presentation = parsePuckNodePresentation(props);
  return {
    ...layoutStyle(presentation.layout ?? fallbackLayout),
    ...declarationStyle(presentation.style ?? fallbackStyle, breakpointIds, breakpointId),
  };
}
