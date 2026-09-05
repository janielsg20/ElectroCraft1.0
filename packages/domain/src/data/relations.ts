import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema } from '../contracts/json-value';
import { electroCraftObjectIdSchema } from '../contracts/object-id';

export const electroRelationCardinalitySchema = z.enum(['one-to-one', 'one-to-many', 'many-to-many']);
export type ElectroRelationCardinality = z.infer<typeof electroRelationCardinalitySchema>;

export const electroRelationDeleteBehaviorSchema = z.enum(['restrict', 'detach', 'cascade']);
export type ElectroRelationDeleteBehavior = z.infer<typeof electroRelationDeleteBehaviorSchema>;

export const electroRelationPermissionsSchema = z.strictObject({
  read: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  write: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
});
export type ElectroRelationPermissions = z.infer<typeof electroRelationPermissionsSchema>;

export const electroRelationInverseSchema = z.strictObject({
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  label: z.string().trim().min(1).max(160),
});
export type ElectroRelationInverse = z.infer<typeof electroRelationInverseSchema>;

export const electroRelationSchema = z
  .strictObject({
    id: electroCraftObjectIdSchema,
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    sourceModelRef: electroCraftObjectIdSchema,
    targetModelRef: electroCraftObjectIdSchema,
    cardinality: electroRelationCardinalitySchema,
    deleteBehavior: electroRelationDeleteBehaviorSchema,
    inverse: electroRelationInverseSchema.optional(),
    permissions: electroRelationPermissionsSchema.optional(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((relation, context) => {
    if (relation.inverse?.key === relation.key) {
      context.addIssue({
        code: 'custom',
        path: ['inverse', 'key'],
        message: 'inverse relation key must differ from relation key',
      });
    }
  });
export type ElectroRelation = z.infer<typeof electroRelationSchema>;

export const electroRelationEdgeSchema = z.strictObject({
  id: z.string().trim().min(1).max(200),
  relationRef: electroCraftObjectIdSchema,
  fromModelRef: electroCraftObjectIdSchema,
  fromRecordRef: z.string().trim().min(1).max(200),
  toModelRef: electroCraftObjectIdSchema,
  toRecordRef: z.string().trim().min(1).max(200),
  payload: jsonValueSchema,
  createdAt: z.string().datetime(),
});
export type ElectroRelationEdge = z.infer<typeof electroRelationEdgeSchema>;

export function relationResourceId(relationId: string) {
  return `relation:${relationId}` as const;
}

export function parseRelationResourceId(resourceId: string): string | null {
  if (!resourceId.startsWith('relation:')) return null;
  const relationId = resourceId.slice('relation:'.length).trim();
  return relationId || null;
}
