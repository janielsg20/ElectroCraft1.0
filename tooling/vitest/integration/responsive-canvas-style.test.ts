import { describe, expect, it } from 'vitest';
import { createDefaultElectroCraftLayout, createDefaultElectroCraftStyle } from '@electrocraft/domain';
import { projectPuckNodePresentation } from '@electrocraft/editor-puck';
import { resolveStudioPresentationStyle } from '../../../apps/studio/src/features/editor/advanced/presentation-style';

describe('M06.2 responsive Canvas style', () => {
  it('renders the effective breakpoint override while Base stays unchanged', () => {
    const style = createDefaultElectroCraftStyle();
    style.base.width = { kind: 'value', value: 960, unit: 'px' };
    style.responsive['tablet-portrait'] = { width: { kind: 'value', value: 100, unit: 'percent' } };
    const props = projectPuckNodePresentation({}, { layout: null, style });

    expect(
      resolveStudioPresentationStyle(
        props,
        createDefaultElectroCraftLayout(),
        createDefaultElectroCraftStyle(),
        ['desktop', 'tablet-portrait', 'mobile-small'],
        'tablet-portrait',
      ).width,
    ).toBe('100%');
    expect(
      resolveStudioPresentationStyle(props, createDefaultElectroCraftLayout(), createDefaultElectroCraftStyle()).width,
    ).toBe('960px');
  });
});
