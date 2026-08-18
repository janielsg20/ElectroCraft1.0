const REQUIRED_STUDIO_DEPENDENCIES = [
  '@electrocraft/domain',
  '@electrocraft/application',
  '@electrocraft/runtime-web',
  '@electrocraft/exporters',
] as const;

export type StudioBootstrapState = 'ready' | 'blocked';

export interface StudioBootstrapHealth {
  state: StudioBootstrapState;
  label: 'Operativo' | 'Bloqueado';
  detail: string;
  missingDependencies: readonly string[];
}

export function evaluateStudioBootstrapHealth(dependencies: readonly string[]): StudioBootstrapHealth {
  const available = new Set(dependencies);
  const missingDependencies = REQUIRED_STUDIO_DEPENDENCIES.filter((dependency) => !available.has(dependency));

  if (missingDependencies.length > 0) {
    return Object.freeze({
      state: 'blocked',
      label: 'Bloqueado',
      detail: `Faltan ${missingDependencies.length} dependencias obligatorias del composition root.`,
      missingDependencies,
    });
  }

  return Object.freeze({
    state: 'ready',
    label: 'Operativo',
    detail: 'React, Vite y los límites base del Studio están preparados para desarrollo.',
    missingDependencies: [],
  });
}
