import { electroCraftPuckIframeConfig, structuralPuckConfig, structuralPuckData } from '@electrocraft/editor-puck';
import { describe, expect, it } from 'vitest';

describe('M05.2 Puck composition policy', () => {
  it('isolates Preview from host styles while preserving Puck iframe styles', () => {
    expect(electroCraftPuckIframeConfig).toEqual({
      enabled: true,
      waitForStyles: true,
      syncHostStyles: false,
    });
  });

  it('keeps the structural empty state valid without inventing permanent demo content', () => {
    expect(structuralPuckConfig.components).toEqual({});
    expect(structuralPuckData.content).toEqual([]);
    expect(structuralPuckData.root).toEqual({ props: {} });
  });
});
