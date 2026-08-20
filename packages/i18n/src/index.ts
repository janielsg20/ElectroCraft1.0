import i18next, { type i18n, type TOptions } from 'i18next';
import { createElement, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import {
  electroCraftNamespaces,
  resourcesEs,
  type ElectroCraftNamespace,
  type ElectroCraftResourceKey,
} from './resources';

export { electroCraftNamespaces, resourcesEs } from './resources';
export type { ElectroCraftNamespace, ElectroCraftResourceKey } from './resources';

export const DEFAULT_LOCALE = 'es' as const;
export const FALLBACK_LOCALE = 'es' as const;
export const supportedLocales = Object.freeze(['es'] as const);

export const electroCraftI18n = i18next.createInstance();
let initialization: Promise<i18n> | null = null;

export function initializeElectroCraftI18n(): Promise<i18n> {
  if (electroCraftI18n.isInitialized) return Promise.resolve(electroCraftI18n);
  if (initialization) return initialization;

  initialization = electroCraftI18n
    .use(initReactI18next)
    .init({
      lng: DEFAULT_LOCALE,
      fallbackLng: FALLBACK_LOCALE,
      supportedLngs: [...supportedLocales],
      ns: [...electroCraftNamespaces],
      defaultNS: 'common',
      resources: { es: resourcesEs },
      keySeparator: false,
      returnNull: false,
      interpolation: { escapeValue: false },
      initImmediate: false,
    })
    .then(() => electroCraftI18n);

  return initialization;
}

export class MissingTranslationError extends Error {
  readonly code = 'I18N_MISSING_KEY';

  constructor(readonly namespace: ElectroCraftNamespace, readonly translationKey: string) {
    super(`I18N_MISSING_KEY:${namespace}:${translationKey}`);
    this.name = 'MissingTranslationError';
  }
}

export function translateStrict<Namespace extends ElectroCraftNamespace>(
  namespace: Namespace,
  key: ElectroCraftResourceKey<Namespace>,
  options?: TOptions,
): string {
  const resource = resourcesEs[namespace] as Readonly<Record<string, string>>;
  if (!(key in resource)) throw new MissingTranslationError(namespace, key);
  if (!electroCraftI18n.isInitialized) return resource[key] ?? '';
  return String(electroCraftI18n.t(key, { ...options, ns: namespace }));
}

export function useElectroCraftTranslation<Namespace extends ElectroCraftNamespace>(namespace: Namespace) {
  return useTranslation(namespace, { i18n: electroCraftI18n });
}

export function ElectroCraftI18nProvider({ children }: { readonly children: ReactNode }) {
  return createElement(I18nextProvider, { i18n: electroCraftI18n }, children);
}

export function formatNumberEs(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('es', options).format(value);
}

export function formatDateEs(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es', options).format(value);
}

export function formatCurrencyEs(value: number, currency: string): string {
  return new Intl.NumberFormat('es', { style: 'currency', currency }).format(value);
}

export const studioErrorMessagesEs = Object.freeze({
  I18N_MISSING_KEY: 'Falta una traducción requerida del Studio.',
  I18N_LOAD_FAILED: 'No se pudo cargar el idioma del Studio.',
  UNKNOWN: 'Ocurrió un error inesperado.',
} as const);

export type StudioErrorCode = keyof typeof studioErrorMessagesEs;

export function formatStudioErrorEs(code: StudioErrorCode): string {
  return studioErrorMessagesEs[code];
}
