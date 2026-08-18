import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/workflow-rete',
  responsibility: 'adapter de workflows Rete',
  dependencies: [dep0.name, dep1.name] as const,
});

export type WorkflowRetePackageDescriptor = typeof packageDescriptor;
