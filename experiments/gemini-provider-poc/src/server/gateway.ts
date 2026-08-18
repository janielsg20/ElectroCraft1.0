import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import {
  codeArtifactSchema,
  generationPlanSchema,
  type CodeArtifactPoc,
  type LogicalAIProfile,
} from "../shared/contracts.js";
import { resolveRuntimeModel } from "../shared/model-resolver.js";
import { assertToolAllowed } from "../shared/tool-policy.js";

export class AIProviderUnavailableError extends Error {
  constructor() {
    super("Proveedor de IA no configurado");
    this.name = "AIProviderUnavailableError";
  }
}

export class UnsafeGeneratedCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeGeneratedCodeError";
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

export function validateGeneratedCodeArtifact(artifact: CodeArtifactPoc): CodeArtifactPoc {
  if (artifact.draftOnly !== true) {
    throw new UnsafeGeneratedCodeError("El artifact generado debe permanecer Draft-only");
  }

  const paths = new Set<string>();
  for (const file of artifact.files) {
    const segments = file.path.split("/");
    if (file.path.startsWith("/") || file.path.includes("\\") || segments.includes("..") || file.path.includes("\0")) {
      throw new UnsafeGeneratedCodeError(`Ruta de borrador no permitida: ${file.path}`);
    }
    if (paths.has(file.path)) throw new UnsafeGeneratedCodeError(`Ruta duplicada: ${file.path}`);
    paths.add(file.path);
    for (const forbidden of ["GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "process.env.GEMINI", "process.env.GOOGLE_GENERATIVE_AI"]) {
      if (file.content.includes(forbidden)) throw new UnsafeGeneratedCodeError("El borrador intentó referenciar credenciales");
    }
  }
  if (!paths.has(artifact.entryFile)) throw new UnsafeGeneratedCodeError("entryFile no existe dentro del artifact");
  return artifact;
}

export function createGeminiGateway(config: GeminiGatewayConfig) {
  assertApiKey(config.apiKey);
  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
  const languageModel = (profile: LogicalAIProfile) => google(resolveRuntimeModel(profile));

  return {
    async generatePlan(input: { prompt: string; profile?: LogicalAIProfile; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      const result = await generateText({
        model: languageModel(input.profile ?? "Automático"),
        output: Output.object({
          name: "GenerationPlanPoc",
          description: "Plan técnico ElectroCraft para generar componentes, plugins o secciones como Draft validable.",
          schema: generationPlanSchema,
        }),
        prompt: input.prompt,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
      return result.output;
    },

    async generateCodeArtifact(input: { prompt: string; profile?: LogicalAIProfile; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      const result = await generateText({
        model: languageModel(input.profile ?? "Código"),
        output: Output.object({
          name: "ElectroCraftCodeArtifactPoc",
          description: "Borrador multiarchivo de código para component, plugin o section. Nunca aplica cambios por sí mismo.",
          schema: codeArtifactSchema,
        }),
        system: "Genera únicamente un Draft de código para ElectroCraft. Usa rutas relativas, no escribas archivos, no instales paquetes, no uses secretos y no apliques cambios al proyecto. Devuelve draftOnly=true. El artifact debe ser autocontenido, revisable y validable antes de cualquier Apply posterior por el usuario.",
        prompt: input.prompt,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
      return validateGeneratedCodeArtifact(result.output);
    },

    async runToolLoop(input: { prompt: string; profile?: LogicalAIProfile; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      assertToolAllowed("get_app_summary");
      const tools = {
        get_app_summary: tool({
          description: "Devuelve contexto sanitizado mínimo para preparar código Draft sin secretos.",
          inputSchema: z.object({ scope: z.literal("selected") }),
          execute: async () => ({ screens: 2, theme: "default", framework: "react", sanitized: true }),
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

    streamCodeDraft(input: { prompt: string; profile?: LogicalAIProfile; abortSignal?: AbortSignal }) {
      assertNotAborted(input.abortSignal);
      return streamText({
        model: languageModel(input.profile ?? "Código"),
        system: "Devuelve código Draft para ElectroCraft. No apliques, instales ni escribas nada fuera de la respuesta.",
        prompt: input.prompt,
        ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
        maxRetries: 1,
      });
    },
  };
}
