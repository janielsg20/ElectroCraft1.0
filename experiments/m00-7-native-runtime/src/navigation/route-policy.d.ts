export function normalizeElectroCraftDeepLink(input: string): string;
export function resolveNativeRoute(input: { path: string; authenticated: boolean }): { state: "blocked" | "redirect" | "ready"; href: string };
