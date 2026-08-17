import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage, generateText, Output, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { generationPlanSchema, type LogicalAIProfile } from "../shared/contracts.js";
import { resolveRuntimeModel } from "../shared/model-resolver.js";
import { assertToolAllowed } from "../shared/tool-policy.js";

export class AIProviderUnavailableError extends Error {
  constructor() {
    super("Proveedor de IA no configurado");
    this.name = "AIProviderUnavailableError";
  }
}

export type GeminiGatewayConfig = {
  apiKey: string;
};

function assertApiKey(apiKey: string) {
  if (!apiKey.trim()) throw new AIProviderUnavailableError();
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Generación cancelada", "AbortError");
}

export function createGeminiGateway(config: GeminiGatewayConfig) {
  assertApiKey(config.apiKey);
  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });

  const languageModel = (profile: Exclude<LogicalAIProfile, "Imagen">) => google(resolveRuntimeModel(profile));

  return {
    async generatePlan(input: { prompt: string; profile?: Exclude<LogicalAIProfile, "Imagen">; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      const result = await generateText({
        model: languageModel(input.profile ?? "Automático"),
        output: Output.object({
          name: "GenerationPlanPoc",
          description: "Plan técnico ElectroCraft que solo propone Draft y validación.",
          schema: generationPlanSchema,
        }),
        prompt: input.prompt,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
      return result.output;
    },

    async runToolLoop(input: { prompt: string; profile?: Exclude<LogicalAIProfile, "Imagen">; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      assertToolAllowed("get_app_summary");
      const tools = {
        get_app_summary: tool({
          description: "Devuelve un resumen sanitizado del proyecto POC sin secretos.",
          inputSchema: z.object({ scope: z.literal("selected") }),
          execute: async () => ({ screens: 2, theme: "default", sanitized: true }),
        }),
      };

      const result = await generateText({
        model: languageModel(input.profile ?? "Rápido"),
        prompt: input.prompt,
        tools,
        stopWhen: stepCountIs(3),
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        prepareStep: ({ stepNumber }) =>
          stepNumber === 0
            ? {
                activeTools: ["get_app_summary"],
                toolChoice: { type: "tool", toolName: "get_app_summary" },
              }
            : { activeTools: [], toolChoice: "none" },
        maxRetries: 1,
      });

      return {
        text: result.text,
        stepCount: result.steps.length,
        toolCalls: result.steps.flatMap((step) => step.toolCalls.map((call) => call.toolName)),
      };
    },

    streamDraft(input: { prompt: string; profile?: Exclude<LogicalAIProfile, "Imagen">; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      return streamText({
        model: languageModel(input.profile ?? "Rápido"),
        prompt: input.prompt,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
    },

    async generateDraftImage(input: { prompt: string; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      const result = await generateImage({
        model: google.image(resolveRuntimeModel("Imagen")),
        prompt: input.prompt,
        aspectRatio: "1:1",
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
      return {
        mediaType: result.image.mediaType,
        bytes: result.image.uint8Array,
        resolvedModel: resolveRuntimeModel("Imagen"),
      };
    },
  };
}
