import type {
  ElectroCraftBreakpointId,
  ElectroCraftColor,
  ElectroCraftEditorPlatform,
  ElectroCraftLayout,
  ElectroCraftLength,
  ElectroCraftStyle,
} from '@electrocraft/domain';
import { resolvePlatformStyleDeclaration, resolveResponsiveStyleDeclaration } from '@electrocraft/domain';
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
  platform: ElectroCraftEditorPlatform,
): CSSProperties {
  const responsive = resolveResponsiveStyleDeclaration(
    { base: style.base, overrides: style.responsive },
    breakpointIds,
    breakpointId,
  );
  const declaration = resolvePlatformStyleDeclaration(style, responsive, platform);
  return {
    width: length(declaration.width),
    height: length(declaration.height),
    minWidth: length(declaration.minWidth),
    maxWidth: length(declaration.maxWidth),
    gap: length(declaration.gap),
    padding: length(declaration.padding),
    margin: length(declaration.margin),
    fontSize: length(declaration.fontSize),
    fontWeight: declaration.fontWeight ?? undefined,
    textAlign: declaration.textAlign ?? undefined,
    color: color(declaration.foreground),
    background: color(declaration.background),
    opacity: declaration.opacity ?? undefined,
  };
}

export function resolveStudioPresentationStyle(
  props: Readonly<Record<string, unknown>>,
  fallbackLayout: ElectroCraftLayout,
  fallbackStyle: ElectroCraftStyle,
  breakpointIds: readonly ElectroCraftBreakpointId[] = [],
  breakpointId: ElectroCraftBreakpointId | null = null,
  platform: ElectroCraftEditorPlatform = 'web',
): CSSProperties {
  const presentation = parsePuckNodePresentation(props);
  return {
    ...layoutStyle(presentation.layout ?? fallbackLayout),
    ...declarationStyle(presentation.style ?? fallbackStyle, breakpointIds, breakpointId, platform),
  };
}
