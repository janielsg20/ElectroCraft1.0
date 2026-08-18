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
      model: resolveRuntimeModel("Código"),
      input: "Return POC_INTERACTIONS_CODE_OK and then one JavaScript line: const electrocraft = true;",
      store: false,
    });
    return {
      status: interaction.status,
      outputText: interaction.output_text ?? "",
      interactionIdPresent: interaction.id.length > 0,
    };
  }
}
