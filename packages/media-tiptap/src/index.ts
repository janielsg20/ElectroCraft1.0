import { packageDescriptor as dep0 } from '@electrocraft/domain';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/media-tiptap',
  responsibility: 'adapter de rich text Tiptap',
  dependencies: [dep0.name] as const,
});

export type MediaTiptapPackageDescriptor = typeof packageDescriptor;
