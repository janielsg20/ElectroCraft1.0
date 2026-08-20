import { describe, expect, it } from 'vitest';
import {
  getHelpIdForNavigationItem,
  getStudioHelpDescriptor,
  searchStudioHelp,
} from '../../../apps/studio/src/help/help-registry';
import { resolveSidebarActiveItem, studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';

function allNavigationItems() {
  return studioSidebarNavigation.flatMap((group) => group.items);
}

describe('M03.11 Help runtime integration', () => {
  it('resolves canonical routes to the same navigation/help identity', () => {
    for (const item of allNavigationItems()) {
      expect(resolveSidebarActiveItem(item.href)).toBe(item.id);
      const help = getStudioHelpDescriptor(getHelpIdForNavigationItem(item.id));
      expect(help.title).toBe(item.label);
    }
  });

  it('keeps Spanish release copy in the runtime registry', () => {
    expect(getStudioHelpDescriptor('help.studio.shell').title).toBe('AppShell del Studio');
    expect(getStudioHelpDescriptor('help.studio.language').summary).toBe(
      'ElectroCraft se entrega en español. La infraestructura de idiomas permite añadir traducciones futuras sin cambiar la lógica de la aplicación.',
    );
    expect(searchStudioHelp('permisos').some((entry) => entry.id === 'help.section.users')).toBe(true);
  });

  it('describes unavailable capabilities without creating extra navigation ids', () => {
    expect(getStudioHelpDescriptor('help.section.ai-generate').summary).toContain(
      'cuando la capacidad esté disponible',
    );
    expect(allNavigationItems().map((item) => item.id)).not.toContain('taxonomies');
    expect(allNavigationItems().map((item) => item.id)).not.toContain('relations');
    expect(allNavigationItems().map((item) => item.id)).not.toContain('roles');
  });
});
