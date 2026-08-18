export const packageDescriptor = Object.freeze({
  name: '@electrocraft/domain',
  responsibility: 'modelo canónico y contratos puros',
  dependencies: [] as const,
});

export type DomainPackageDescriptor = typeof packageDescriptor;
