const KNOWN_PATHS = new Set(["/", "/guarded", "/signin", "/(tabs)", "/(tabs)/create"]);

export function normalizeElectroCraftDeepLink(input) {
  const url = new URL(input);
  if (url.protocol !== "electrocraft:") throw new Error("Unsupported deep-link scheme");
  const host = url.hostname ? `/${url.hostname}` : "";
  const path = `${host}${url.pathname}`.replace(/\/+/g, "/") || "/";
  return path === "//" ? "/" : path.replace(/\/$/, "") || "/";
}

export function resolveNativeRoute({ path, authenticated }) {
  if (!KNOWN_PATHS.has(path)) return { state: "blocked", href: "/" };
  if (path === "/guarded" && !authenticated) return { state: "redirect", href: "/signin" };
  return { state: "ready", href: path };
}
