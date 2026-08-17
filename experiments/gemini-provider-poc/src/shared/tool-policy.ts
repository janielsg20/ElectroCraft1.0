export const POC_ALLOWED_TOOLS = Object.freeze([
  "get_app_summary",
  "get_current_screen",
  "draft_create_screen",
  "validate_draft",
] as const);

export type PocAllowedTool = (typeof POC_ALLOWED_TOOLS)[number];

const forbidden = new Set([
  "apply_to_project",
  "write_database",
  "execute_sql",
  "execute_javascript",
  "write_file",
  "install_package",
  "install_extension",
  "deploy",
  "delete_project",
  "access_secret",
  "read_entire_project_unfiltered",
]);

export class ToolNotAllowedError extends Error {
  constructor(readonly toolName: string) {
    super(`Herramienta no permitida: ${toolName}`);
    this.name = "ToolNotAllowedError";
  }
}

export function assertToolAllowed(toolName: string): asserts toolName is PocAllowedTool {
  if (forbidden.has(toolName) || !POC_ALLOWED_TOOLS.includes(toolName as PocAllowedTool)) {
    throw new ToolNotAllowedError(toolName);
  }
}
