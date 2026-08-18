import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';
import { packageDescriptor as dep2 } from '@electrocraft/data-core';
import { packageDescriptor as dep3 } from '@electrocraft/query-rqb';
import { packageDescriptor as dep4 } from '@electrocraft/media-tiptap';
import { packageDescriptor as dep5 } from '@electrocraft/state-zustand';
import { packageDescriptor as dep6 } from '@electrocraft/auth-core';
import { packageDescriptor as dep7 } from '@electrocraft/forms';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/runtime-web',
  responsibility: 'runtime Web portable',
  dependencies: [dep0.name, dep1.name, dep2.name, dep3.name, dep4.name, dep5.name, dep6.name, dep7.name] as const,
});

export type RuntimeWebPackageDescriptor = typeof packageDescriptor;
