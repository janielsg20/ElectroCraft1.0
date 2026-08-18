import * as z from 'zod';

export const jsonValueSchema = z.json();
export type JsonValue = z.infer<typeof jsonValueSchema>;

export const electroCraftMetadataSchema = z.record(
  z.string().min(1),
  jsonValueSchema,
);

export type ElectroCraftMetadata = z.infer<typeof electroCraftMetadataSchema>;
