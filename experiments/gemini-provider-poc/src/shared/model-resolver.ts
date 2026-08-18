import type { LogicalAIProfile } from "./contracts.js";

// Runtime/session-only mapping reverified 2026-08-17. Never persist these IDs in
// ElectroCraft canonical project data; persist only the logical profile.
export const CURRENT_RUNTIME_MODELS = Object.freeze({
  "Automático": "gemini-3.6-flash",
  "Rápido": "gemini-3.5-flash-lite",
  "Calidad": "gemini-3.6-flash",
  "Código": "gemini-3.6-flash",
} satisfies Record<LogicalAIProfile, string>);

export function resolveRuntimeModel(profile: LogicalAIProfile): string {
  return CURRENT_RUNTIME_MODELS[profile];
}

export function serializeCanonicalAISelection(profile: LogicalAIProfile) {
  return { profile } as const;
}
