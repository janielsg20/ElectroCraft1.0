import { describe, expect, it } from 'vitest';
import {
  getHelpIdForNavigationItem,
  getStudioHelpDescriptor,
  searchStudioHelp,
  studioHelpDescriptors,
} from '../../../apps/studio/src/help/help-registry';
import { studioSidebarNavigation } from '../../../apps/studio/src/shell/sidebar-navigation';

const studioScopedHelpIds = [
  'help.studio.shell',
  'help.studio.appearance',
  'help.studio.language',
  'help.projects',
] as const;

describe('M03.11 typed HelpRegistry', () => {
  it('owns one descriptor for every canonical top-level destination plus Studio-level concepts', () => {
    const navigationItems = studioSidebarNavigation.flatMap((group) => group.items);
    expect(navigationItems).toHaveLength(24);
    expect(studioHelpDescriptors).toHaveLength(navigationItems.length + studioScopedHelpIds.length);

    for (const helpId of studioScopedHelpIds) {
      expect(() => getStudioHelpDescriptor(helpId)).not.toThrow();
    }

    for (const item of navigationItems) {
      const descriptor = getStudioHelpDescriptor(getHelpIdForNavigationItem(item.id));
      expect(descriptor.title).toBe(item.label);
      expect(descriptor.summary.length).toBeGreaterThan(10);
      expect(descriptor.details.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('searches by title, description, keyword and canonical section', () => {
    expect(searchStudioHelp('exportar').some((entry) => entry.id === 'help.section.export')).toBe(true);
    expect(searchStudioHelp('Puck').some((entry) => entry.id === 'help.section.components')).toBe(true);
    expect(searchStudioHelp('List/Detail').some((entry) => entry.id === 'help.section.records')).toBe(true);
    expect(searchStudioHelp('Construir').some((entry) => entry.id === 'help.section.editor')).toBe(true);
  });

  it('keeps related concepts inside the same registry', () => {
    for (const descriptor of studioHelpDescriptors) {
      for (const relatedId of descriptor.relatedIds) {
        expect(() => getStudioHelpDescriptor(relatedId)).not.toThrow();
      }
    }
  });

  it('fails closed for an unknown help id', () => {
    expect(() => getStudioHelpDescriptor('help.section.unknown' as never)).toThrow(/Unknown Studio help descriptor/);
  });
});
