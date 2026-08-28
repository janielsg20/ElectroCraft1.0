import { describe, expect, it } from 'vitest';
import { createDefaultElectroCraftStyle, electroCraftLayoutSchema, electroCraftStyleSchema } from '@electrocraft/domain';
import { resolveStudioPresentationStyle } from '../../../apps/studio/src/features/editor/advanced/presentation-style';

const rowLayout = electroCraftLayoutSchema.parse({
  mode: 'row',
  gap: null,
  align: 'stretch',
  justify: 'start',
  wrap: false,
  columns: null,
});

describe('M06.1 Studio presentation style', () => {
  it('preserves layout display while the canonical visibility is not hidden', () => {
    const style = resolveStudioPresentationStyle({}, rowLayout, createDefaultElectroCraftStyle());

    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('row');
  });

  it('lets canonical hidden visibility override the layout display', () => {
    const baseStyle = createDefaultElectroCraftStyle();
    const hiddenStyle = electroCraftStyleSchema.parse({
      ...baseStyle,
      base: { ...baseStyle.base, visibility: 'hidden' },
    });
    const style = resolveStudioPresentationStyle({}, rowLayout, hiddenStyle);

    expect(style.display).toBe('none');
  });
});
