import * as z from 'zod';
import { jsonValueSchema } from '../contracts/json-value';
import { electroCraftDataOperationKindSchema } from './rest';

export const electroCraftDataExplorerParameterLocationSchema = z.enum([
  'path',
  'query',
  'header',
  'variable',
  'body',
  'input',
]);
export type ElectroCraftDataExplorerParameterLocation = z.infer<typeof electroCraftDataExplorerParameterLocationSchema>;

export const electroCraftDataExplorerParameterValueTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'array',
  'json',
]);
export type ElectroCraftDataExplorerParameterValueType = z.infer<
  typeof electroCraftDataExplorerParameterValueTypeSchema
>;

export const electroCraftDataExplorerParameterSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(160),
  location: electroCraftDataExplorerParameterLocationSchema,
  inputPath: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  required: z.boolean(),
  valueType: electroCraftDataExplorerParameterValueTypeSchema,
  defaultValue: jsonValueSchema.optional(),
});
type ElectroCraftDataExplorerParameterValue = z.infer<typeof electroCraftDataExplorerParameterSchema>;
export interface ElectroCraftDataExplorerParameter extends Omit<ElectroCraftDataExplorerParameterValue, 'inputPath'> {
  readonly inputPath: readonly string[];
}

export const electroCraftDataExplorerOperationSchema = z.strictObject({
  id: z.string().trim().min(1).max(160),
  label: z.string().trim().min(1).max(160),
  capability: electroCraftDataOperationKindSchema,
  parameters: z.array(electroCraftDataExplorerParameterSchema).max(100),
  inputSchema: jsonValueSchema.nullable(),
});
type ElectroCraftDataExplorerOperationValue = z.infer<typeof electroCraftDataExplorerOperationSchema>;
export interface ElectroCraftDataExplorerOperation extends Omit<ElectroCraftDataExplorerOperationValue, 'parameters'> {
  readonly parameters: readonly ElectroCraftDataExplorerParameter[];
}
