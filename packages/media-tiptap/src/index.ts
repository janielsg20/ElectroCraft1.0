import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export * from './engine-payload-adapter';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/media-tiptap',
  responsibility: 'adapter de rich text Tiptap',
  dependencies: [dep0.name, dep1.name] as const,
});

export type MediaTiptapPackageDescriptor = typeof packageDescriptor;
