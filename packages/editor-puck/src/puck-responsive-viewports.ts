import {
  electroCraftResponsiveConfigurationSchema,
  type ElectroCraftResponsiveConfiguration,
} from '@electrocraft/domain';
import type { Viewports } from '@puckeditor/core';

export const ELECTROCRAFT_PUCK_RESPONSIVE_CONFIG_PROP = '__electrocraftResponsiveConfiguration';

/**
 * Projects canonical preview definitions onto Puck's public `viewports` prop.
 * Breakpoint ids remain canonical metadata and are deliberately not inferred
 * back from Puck's transient viewport selection.
 */
export function projectResponsiveConfigurationToPuckViewports(input: ElectroCraftResponsiveConfiguration): Viewports {
  const configuration = electroCraftResponsiveConfigurationSchema.parse(input);
  return configuration.breakpoints.map((breakpoint) => ({
    width: breakpoint.width,
    height: breakpoint.height ?? 'auto',
    label: breakpoint.label,
    icon: breakpoint.width < 600 ? 'Smartphone' : breakpoint.width < 1100 ? 'Tablet' : 'Monitor',
  }));
}
