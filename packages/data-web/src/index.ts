import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export * from './advanced-field-storage';
export * from './browser';
export * from './browser-connector-gateway';
export * from './browser-internal-data';
export * from './browser-workspace-preferences';
export * from './connector-catalog';
export * from './data-source-repository';
export * from './internal-data-repository';
export * from './internal-relation-repository';
export * from './migration';
export * from './project-revision-repository';
export * from './repository';
export * from './schema-contract';
export * from './schema';
export * from './storage-health';
export * from './workspace-preferences-repository';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/data-web',
  responsibility: 'persistencia browser del Studio con PGlite/Drizzle detrás de ports',
  dependencies: [dep0.name, dep1.name] as const,
});

export type DataWebPackageDescriptor = typeof packageDescriptor;
