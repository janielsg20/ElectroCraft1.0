import * as z from 'zod';
import { electroCraftMetadataSchema } from '../contracts/json-value';
import { electroCraftObjectIdSchema } from '../contracts/object-id';

export const electroTaxonomyTermSchema = z
  .strictObject({
    id: electroCraftObjectIdSchema,
    taxonomyRef: electroCraftObjectIdSchema,
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(120),
    name: z.string().trim().min(1).max(160),
    parentId: electroCraftObjectIdSchema.nullable(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((term, context) => {
    if (term.parentId === term.id) {
      context.addIssue({ code: 'custom', path: ['parentId'], message: 'taxonomy term cannot be its own parent' });
    }
  });

export type ElectroTaxonomyTerm = z.infer<typeof electroTaxonomyTermSchema>;

export function taxonomyResourceId(taxonomyId: string) {
  return `taxonomy:${taxonomyId}` as const;
}

export function parseTaxonomyResourceId(resourceId: string): string | null {
  if (!resourceId.startsWith('taxonomy:')) return null;
  const taxonomyId = resourceId.slice('taxonomy:'.length).trim();
  return taxonomyId || null;
}
