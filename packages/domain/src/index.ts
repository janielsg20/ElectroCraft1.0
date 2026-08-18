export * from './contracts/app-behavior';
export * from './contracts/canonical-json';
export * from './contracts/capability-report';
export * from './contracts/component-definition';
export * from './contracts/data-definition';
export * from './contracts/document';
export * from './contracts/engine-payload';
export * from './contracts/export-ir';
export * from './contracts/json-value';
export * from './contracts/migration-registry';
export * from './contracts/model-ownership';
export * from './contracts/object-id';
export * from './contracts/project-definition';
export * from './contracts/project-snapshot';
export * from './contracts/query-definition';
export * from './contracts/serialization';
export * from './contracts/theme-blueprint';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/domain',
  responsibility: 'modelo canónico y contratos puros',
  dependencies: [] as const,
});

export type DomainPackageDescriptor = typeof packageDescriptor;
