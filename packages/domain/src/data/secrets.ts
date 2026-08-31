import * as z from 'zod';
import { electroCraftMetadataSchema } from '../contracts/json-value';
import { electroCraftObjectIdSchema } from '../contracts/object-id';
import type { ElectroCraftDataSourceEnvironment } from './source-definition';

export const electroCraftSecretEnvironmentSchema = z.enum(['development', 'production']);
export type ElectroCraftSecretEnvironment = z.infer<typeof electroCraftSecretEnvironmentSchema>;

const secretHeaderNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/, 'secret header name must be a valid HTTP token')
  .refine((name) => !/^(?:cookie|set-cookie|proxy-authorization)$/i.test(name), 'cookie-style secret headers are forbidden');

export const electroCraftSecretBindingSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('bearer'),
    headerName: z.literal('Authorization').default('Authorization'),
    scheme: z.string().trim().min(1).max(32).default('Bearer'),
  }),
  z.strictObject({
    kind: z.literal('header'),
    headerName: secretHeaderNameSchema,
    prefix: z.string().max(64).default(''),
  }),
  z.strictObject({
    kind: z.literal('query'),
    queryName: z.string().trim().min(1).max(120).regex(/^[A-Za-z][A-Za-z0-9_.-]*$/),
  }),
]);
export type ElectroCraftSecretBinding = z.infer<typeof electroCraftSecretBindingSchema>;

export const electroCraftSecretRefSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: z.string().trim().regex(/^[A-Z][A-Z0-9_]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    environmentScope: z.array(electroCraftSecretEnvironmentSchema).min(1).max(2),
    binding: electroCraftSecretBindingSchema,
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((ref, context) => {
    if (new Set(ref.environmentScope).size !== ref.environmentScope.length) {
      context.addIssue({ code: 'custom', path: ['environmentScope'], message: 'secret environment scope must be unique' });
    }
  });
export type ElectroCraftSecretRef = z.infer<typeof electroCraftSecretRefSchema>;

export function resolveSecretEnvironment(environment: ElectroCraftDataSourceEnvironment): ElectroCraftSecretEnvironment {
  return environment === 'production' ? 'production' : 'development';
}

export function secretEnvironmentVariableName(
  ref: Pick<ElectroCraftSecretRef, 'key'>,
  environment: ElectroCraftSecretEnvironment,
) {
  return `ELECTROCRAFT_SECRET_${ref.key}_${environment.toUpperCase()}`;
}
