import { packageDescriptor as dep0 } from '@electrocraft/domain';

export * from './app-behavior-service';
export * from './blueprint-installer';
export * from './component-definition-service';
export * from './connector-registry';
export * from './ownership-registry-service';
export * from './project-document-service';
export * from './project-import-service';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/application',
  responsibility: 'casos de uso y ports de aplicación',
  dependencies: [dep0.name] as const,
});

export type ApplicationPackageDescriptor = typeof packageDescriptor;
