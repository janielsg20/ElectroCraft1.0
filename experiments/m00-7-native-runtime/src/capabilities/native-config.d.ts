export const CAMERA_PACKAGE: string;
export function resolveNativeCapabilities(capabilities: string[]): {
  dependencies: Record<string, string>;
  plugins: Array<[string, Record<string, string | boolean>]>;
  sensitivePermissions: string[];
};
