import 'i18next';
import type { resourcesEs } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof resourcesEs;
    strictKeyChecks: true;
  }
}
