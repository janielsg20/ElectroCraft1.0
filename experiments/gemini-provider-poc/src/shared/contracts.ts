import { z } from "zod";

export const logicalAIProfileSchema = z.enum(["Automático", "Rápido", "Calidad", "Código"]);
export type LogicalAIProfile = z.infer<typeof logicalAIProfileSchema>;

export const codeArtifactKindSchema = z.enum(["component", "plugin", "section"]);
export type CodeArtifactKind = z.infer<typeof codeArtifactKindSchema>;

const draftToolSchema = z.enum([
  "get_app_summary",
  "get_current_screen",
  "draft_create_component",
  "draft_create_plugin",
  "draft_create_section",
  "validate_code_draft",
]);

export const generationPlanSchema = z.object({
  artifactType: codeArtifactKindSchema,
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  steps: z.array(
    z.object({
      id: z.string().min(1).max(64),
      action: z.enum(["inspect", "draft", "validate"]),
      description: z.string().min(1).max(300),
    }),
  ).min(1).max(8),
  requestedTools: z.array(draftToolSchema).max(6),
});
export type GenerationPlanPoc = z.infer<typeof generationPlanSchema>;

export const codeFileSchema = z.object({
  path: z.string().min(1).max(240),
  language: z.enum(["tsx", "ts", "jsx", "js", "css", "json", "md"]),
  purpose: z.string().min(1).max(240),
  content: z.string().min(1).max(30000),
});

export const codeArtifactSchema = z.object({
  artifactType: codeArtifactKindSchema,
  name: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  entryFile: z.string().min(1).max(240),
  files: z.array(codeFileSchema).min(1).max(12),
  dependencies: z.array(
    z.object({
      name: z.string().min(1).max(120),
      reason: z.string().min(1).max(240),
    }),
  ).max(8),
  validationChecks: z.array(z.enum(["syntax", "types", "imports", "policy"])).min(2).max(4),
  draftOnly: z.boolean(),
});
export type CodeArtifactPoc = z.infer<typeof codeArtifactSchema>;

export const gatewayRequestSchema = z.object({
  operation: z.enum(["structured-plan", "code-artifact", "tool-loop", "stream"]),
  profile: logicalAIProfileSchema,
  prompt: z.string().min(1).max(8000),
});
export type GatewayRequest = z.infer<typeof gatewayRequestSchema>;
