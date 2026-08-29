export * from './canonical-snapshot';
export * from './contracts';
export * from './data';
export * from './navigation';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/domain',
  responsibility: 'contratos canónicos, esquemas y reglas de dominio',
  dependencies: [] as const,
});

export type DomainPackageDescriptor = typeof packageDescriptor;
