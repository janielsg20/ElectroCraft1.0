import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/data-core',
  responsibility: 'Data Sources e Internal Data contracts',
  dependencies: [dep0.name, dep1.name] as const,
});

export type DataCorePackageDescriptor = typeof packageDescriptor;
