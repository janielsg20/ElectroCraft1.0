import * as z from 'zod';
import { jsonValueSchema } from '../contracts/json-value';
import { electroCraftObjectIdSchema } from '../contracts/object-id';
import { electroCraftBindingRefSchema, type ElectroCraftBindingRef } from '../contracts/query-definition';
import { electroCraftRouteParamValueTypeSchema, type ElectroCraftRouteParamDefinition } from './index';

const canonicalParamNameSchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/);

export const electroCraftRouteParamBindingSchema = z.strictObject({
  source: z.literal('route'),
  routeRef: electroCraftObjectIdSchema,
  param: canonicalParamNameSchema,
  valueType: electroCraftRouteParamValueTypeSchema,
});
export type ElectroCraftRouteParamBinding = z.infer<typeof electroCraftRouteParamBindingSchema>;

export function routeParamBindingToBindingRef(bindingInput: unknown): ElectroCraftBindingRef {
  const binding = electroCraftRouteParamBindingSchema.parse(bindingInput);
  return electroCraftBindingRefSchema.parse({
    source: 'route',
    ref: binding.routeRef,
    path: ['params', binding.param],
  });
}

export const electroCraftNavigationParamValueSchema = z.discriminatedUnion('source', [
  z.strictObject({ source: z.literal('literal'), value: jsonValueSchema }),
  z.strictObject({ source: z.literal('binding'), binding: electroCraftBindingRefSchema }),
]);
export type ElectroCraftNavigationParamValue = z.infer<typeof electroCraftNavigationParamValueSchema>;

export const electroCraftNavigationParamMappingSchema = z.strictObject({
  param: canonicalParamNameSchema,
  value: electroCraftNavigationParamValueSchema,
});
export type ElectroCraftNavigationParamMapping = z.infer<typeof electroCraftNavigationParamMappingSchema>;

export const electroCraftNavigationDestinationSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('route'), routeRef: electroCraftObjectIdSchema }),
  z.strictObject({ kind: z.literal('screen'), screenRef: electroCraftObjectIdSchema }),
]);
export type ElectroCraftNavigationDestination = z.infer<typeof electroCraftNavigationDestinationSchema>;

export const electroCraftNavigateActionConfigSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    action: z.literal('navigate'),
    mode: z.enum(['push', 'replace', 'back']),
    destination: electroCraftNavigationDestinationSchema.nullable(),
    params: z.array(electroCraftNavigationParamMappingSchema).max(100),
  })
  .superRefine((config, context) => {
    if (config.mode === 'back') {
      if (config.destination !== null) {
        context.addIssue({ code: 'custom', path: ['destination'], message: 'back navigation cannot define a destination' });
      }
      if (config.params.length > 0) {
        context.addIssue({ code: 'custom', path: ['params'], message: 'back navigation cannot define params' });
      }
      return;
    }
    if (config.destination === null) {
      context.addIssue({ code: 'custom', path: ['destination'], message: 'push/replace navigation requires a destination' });
    }
    const seen = new Set<string>();
    for (const [index, mapping] of config.params.entries()) {
      if (seen.has(mapping.param)) {
        context.addIssue({ code: 'custom', path: ['params', index, 'param'], message: `duplicate navigation param: ${mapping.param}` });
      }
      seen.add(mapping.param);
    }
  });
export type ElectroCraftNavigateActionConfig = z.infer<typeof electroCraftNavigateActionConfigSchema>;

export const electroCraftExternalUrlActionConfigSchema = z.strictObject({
  schemaVersion: z.literal(1),
  action: z.literal('external-url'),
  url: z
    .url()
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'https:' || protocol === 'http:';
    }, 'external URL must use http or https'),
  mode: z.enum(['same-context', 'new-context']),
});
export type ElectroCraftExternalUrlActionConfig = z.infer<typeof electroCraftExternalUrlActionConfigSchema>;

export function routeParamAcceptsLiteral(param: ElectroCraftRouteParamDefinition, value: unknown): boolean {
  if (param.valueType === 'string') return typeof value === 'string';
  if (param.valueType === 'number') return typeof value === 'number';
  return typeof value === 'boolean';
}
