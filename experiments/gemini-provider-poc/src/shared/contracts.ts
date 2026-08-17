import { z } from "zod";

export const logicalAIProfileSchema = z.enum(["Automático", "Rápido", "Calidad", "Imagen"]);
export type LogicalAIProfile = z.infer<typeof logicalAIProfileSchema>;

export const generationPlanSchema = z.object({
  artifactType: z.enum(["screen", "component", "theme"]),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  steps: z.array(
    z.object({
      id: z.string().min(1).max(64),
      action: z.enum(["inspect", "draft", "validate"]),
      description: z.string().min(1).max(300),
    }),
  ).min(1).max(8),
  requestedTools: z.array(
    z.enum(["get_app_summary", "get_current_screen", "draft_create_screen", "validate_draft"]),
  ).max(4),
});

export type GenerationPlanPoc = z.infer<typeof generationPlanSchema>;

export const gatewayRequestSchema = z.object({
  operation: z.enum(["structured-plan", "tool-loop", "stream", "image"]),
  profile: logicalAIProfileSchema,
  prompt: z.string().min(1).max(4000),
});
export type GatewayRequest = z.infer<typeof gatewayRequestSchema>;

export const sanitizedImageResponseSchema = z.object({
  status: z.literal("PASS_IMAGE_RESPONSE"),
  mediaType: z.string().regex(/^image\//),
  byteLength: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  logicalProfile: z.literal("Imagen"),
  resolvedModel: z.string().min(1),
});
