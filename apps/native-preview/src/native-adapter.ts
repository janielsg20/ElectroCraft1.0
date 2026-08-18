import { packageDescriptor as runtimeNative } from '@electrocraft/runtime-native';
import { packageDescriptor as exportIr } from '@electrocraft/export-ir';

export interface NativePreviewPlan {
  readonly engineOwner: 'expo';
  readonly runtimePackage: string;
  readonly exportContractPackage: string;
  readonly platforms: readonly ['android', 'ios'];
  readonly configArtifact: 'app.json';
  readonly buildArtifact: 'eas.json';
}

export function createNativePreviewPlan(): NativePreviewPlan {
  return Object.freeze({
    engineOwner: 'expo',
    runtimePackage: runtimeNative.name,
    exportContractPackage: exportIr.name,
    platforms: ['android', 'ios'] as const,
    configArtifact: 'app.json',
    buildArtifact: 'eas.json',
  });
}
