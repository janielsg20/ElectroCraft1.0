import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export * from './puck-action-sync';
export * from './puck-adapter-contract';
export * from './puck-component-adapter';
export * from './puck-document-adapter';
export * from './puck-editor-composition';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/editor-puck',
  responsibility: 'adapter propietario del engine Puck',
  dependencies: [dep0.name, dep1.name] as const,
});

export type EditorPuckPackageDescriptor = typeof packageDescriptor;
