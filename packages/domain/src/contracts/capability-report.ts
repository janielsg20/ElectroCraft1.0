import * as z from 'zod';
import { electroCraftObjectIdSchema } from './object-id';
import { electroCraftCapabilityIdSchema, electroCraftCapabilitySupportModeSchema } from './theme-blueprint';

export const electroCraftCapabilityAnalysisEntrySchema = z.strictObject({
  capabilityId: electroCraftCapabilityIdSchema,
  target: z.string().regex(/^[a-z][a-z0-9-]{0,79}$/),
  mode: electroCraftCapabilitySupportModeSchema,
  source: z.enum(['registry', 'project-override', 'missing']),
  adapter: z.string().trim().min(1).max(160).nullable(),
  reason: z.string().trim().min(1).max(500).nullable(),
});
export type ElectroCraftCapabilityAnalysisEntry = z.infer<typeof electroCraftCapabilityAnalysisEntrySchema>;

export const electroCraftCapabilityAnalysisReportSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    registryVersion: z.number().int().positive(),
    projectId: electroCraftObjectIdSchema,
    entries: z.array(electroCraftCapabilityAnalysisEntrySchema).max(10_000),
    blocked: z.boolean(),
  })
  .superRefine((report, context) => {
    const derivedBlocked = report.entries.some(({ mode }) => mode === 'blocked');
    if (derivedBlocked !== report.blocked) {
      context.addIssue({ code: 'custom', path: ['blocked'], message: 'blocked must reflect report entries' });
    }
  });
export type ElectroCraftCapabilityAnalysisReport = z.infer<typeof electroCraftCapabilityAnalysisReportSchema>;
