export const CAMERA_PACKAGE = "57.0.3";

export function resolveNativeCapabilities(capabilities) {
  const requested = new Set(capabilities);
  const unknown = [...requested].filter((item) => item !== "camera");
  if (unknown.length) throw new Error(`Unsupported native capability: ${unknown.join(",")}`);
  const baseline = { dependencies: {}, plugins: [], sensitivePermissions: [] };
  if (!requested.has("camera")) return baseline;
  return {
    dependencies: { "expo-camera": CAMERA_PACKAGE },
    plugins: [["expo-camera", { cameraPermission: "Permitir que ElectroCraft use la cámara", recordAudioAndroid: false }]],
    sensitivePermissions: ["android.permission.CAMERA"],
  };
}
