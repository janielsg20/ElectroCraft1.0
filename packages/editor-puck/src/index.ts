import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export * from './puck-action-sync';
export * from './puck-adapter-contract';
export * from './puck-canvas-guide-overlay';
export * from './puck-canvas-guides';
export * from './puck-command-controls';
export * from './puck-component-adapter';
export * from './puck-document-adapter';
export * from './puck-editor-composition';
export * from './puck-history-controls';
export * from './puck-history-policy';
export * from './puck-layout-style';
export * from './puck-platform-capabilities';
export * from './puck-platform-controls';
export * from './puck-responsive-viewports';
export * from './puck-responsive-controls';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/editor-puck',
  responsibility: 'adapter propietario del engine Puck',
  dependencies: [dep0.name, dep1.name] as const,
});

export type EditorPuckPackageDescriptor = typeof packageDescriptor;
