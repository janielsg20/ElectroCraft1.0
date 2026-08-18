import { packageDescriptor as domain } from '@electrocraft/domain';
import { packageDescriptor as application } from '@electrocraft/application';
import { packageDescriptor as runtimeWeb } from '@electrocraft/runtime-web';
import { packageDescriptor as exporters } from '@electrocraft/exporters';

export const studioWorkspaceDescriptor = Object.freeze({
  id: 'studio',
  kind: 'app',
  uiStatus: 'vite-pwa-development-bootstrap',
  helpId: 'help.architecture.repository',
  dependencies: [domain.name, application.name, runtimeWeb.name, exporters.name] as const,
});
