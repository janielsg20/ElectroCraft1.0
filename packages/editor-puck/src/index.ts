import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export * from './puck-component-adapter';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/editor-puck',
  responsibility: 'adapter propietario del engine Puck',
  dependencies: [dep0.name, dep1.name] as const,
});

export type EditorPuckPackageDescriptor = typeof packageDescriptor;
