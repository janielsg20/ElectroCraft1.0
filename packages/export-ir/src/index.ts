import { packageDescriptor as dep0 } from '@electrocraft/domain';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/export-ir',
  responsibility: 'contrato ExportIR neutral a targets',
  dependencies: [dep0.name] as const,
});

export type ExportIrPackageDescriptor = typeof packageDescriptor;
