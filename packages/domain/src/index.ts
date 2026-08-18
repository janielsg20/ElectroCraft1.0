export * from './contracts/app-behavior';
export * from './contracts/component-definition';
export * from './contracts/data-definition';
export * from './contracts/document';
export * from './contracts/json-value';
export * from './contracts/object-id';
export * from './contracts/project-definition';
export * from './contracts/query-definition';
export * from './contracts/serialization';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/domain',
  responsibility: 'modelo canónico y contratos puros',
  dependencies: [] as const,
});

export type DomainPackageDescriptor = typeof packageDescriptor;
