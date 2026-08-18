declare module '@scalar/openapi-parser' {
  export type ParserIssue = { message?: string };
  export function validate(input: string): Promise<{ valid: boolean; errors?: ParserIssue[] }>;
  export function dereference(input: string): Promise<{ schema: Record<string, unknown>; errors?: ParserIssue[] }>;
}
