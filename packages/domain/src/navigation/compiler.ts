import * as z from 'zod';
import { electroCraftObjectIdSchema } from '../contracts/object-id';

export const electroCraftNavigationCompilerTargetSchema = z.enum([
  'react-router',
  'expo-router',
  'lamp-slim',
  'wordpress',
  'capacitor',
  'static-web',
]);
export type ElectroCraftNavigationCompilerTarget = z.infer<typeof electroCraftNavigationCompilerTargetSchema>;

export const electroCraftNavigationCompilerDiagnosticSchema = z.strictObject({
  code: z.enum([
    'UNSUPPORTED_NAVIGATOR_OPTION',
    'RUNTIME_ROUTE_NOT_STATIC',
    'MISSING_DEEP_LINK',
    'TARGET_GUARD_ADAPTER_REQUIRED',
  ]),
  severity: z.enum(['warning', 'error']),
  target: electroCraftNavigationCompilerTargetSchema,
  ownerRef: electroCraftObjectIdSchema,
  feature: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(500),
});
export type ElectroCraftNavigationCompilerDiagnostic = z.infer<
  typeof electroCraftNavigationCompilerDiagnosticSchema
>;
