import { GoogleGenAI } from "@google/genai";
import { resolveRuntimeModel } from "../shared/model-resolver.js";
import { AIProviderUnavailableError } from "./gateway.js";

export class GeminiNativeCapabilityAdapter {
  private readonly ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey.trim()) throw new AIProviderUnavailableError();
    this.ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1" } });
  }

  async probeStableInteractions() {
    const interaction = await this.ai.interactions.create({
      model: resolveRuntimeModel("Rápido"),
      input: "Reply with POC_INTERACTIONS_OK only.",
      store: false,
    });
    return {
      status: interaction.status,
      outputText: interaction.output_text ?? "",
      interactionIdPresent: interaction.id.length > 0,
    };
  }
}
