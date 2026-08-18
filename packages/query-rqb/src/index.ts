import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';
import { packageDescriptor as dep2 } from '@electrocraft/data-core';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/query-rqb',
  responsibility: 'adapter de autoría de condiciones RQB',
  dependencies: [dep0.name, dep1.name, dep2.name] as const,
});

export type QueryRqbPackageDescriptor = typeof packageDescriptor;
