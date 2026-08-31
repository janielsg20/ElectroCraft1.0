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
  'help.editor.advanced',
  'help.editor.screens',
  'help.navigation',
  'help.navigation.builder',
  'help.navigation.routes',
  'help.navigation.guards',
  'help.navigation.compiler',
  'help.screens',
  'help.data.sources',
  'help.data.internal',
  'help.data.rest',
  'help.data.graphql',
] as const;

describe('M03.11 typed HelpRegistry', () => {
  it('owns one descriptor for every canonical top-level destination plus Studio-level concepts', () => {
    const navigationItems = studioSidebarNavigation.flatMap((group) => group.items);
    expect(navigationItems).toHaveLength(24);
    expect(studioHelpDescriptors).toHaveLength(navigationItems.length + studioScopedHelpIds.length);
    for (const helpId of studioScopedHelpIds) expect(() => getStudioHelpDescriptor(helpId)).not.toThrow();
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
    expect(searchStudioHelp('screen composer').some((entry) => entry.id === 'help.editor.screens')).toBe(true);
    expect(searchStudioHelp('reordenar').some((entry) => entry.id === 'help.navigation.builder')).toBe(true);
    expect(searchStudioHelp('enlace profundo').some((entry) => entry.id === 'help.navigation.routes')).toBe(true);
    expect(searchStudioHelp('iniciar sesión').some((entry) => entry.id === 'help.navigation.guards')).toBe(true);
    expect(searchStudioHelp('expo router').some((entry) => entry.id === 'help.navigation.compiler')).toBe(true);
    expect(searchStudioHelp('connector registry').some((entry) => entry.id === 'help.data.sources')).toBe(true);
    expect(searchStudioHelp('electrocraft data').some((entry) => entry.id === 'help.data.internal')).toBe(true);
    expect(searchStudioHelp('openapi').some((entry) => entry.id === 'help.data.rest')).toBe(true);
    expect(searchStudioHelp('introspection').some((entry) => entry.id === 'help.data.graphql')).toBe(true);
    expect(searchStudioHelp('mutation').some((entry) => entry.id === 'help.data.graphql')).toBe(true);
  });

  it('maps Fuentes de datos to its M08 contextual descriptors', () => {
    expect(getHelpIdForNavigationItem('data-sources')).toBe('help.data.sources');
    expect(getStudioHelpDescriptor('help.data.sources')).toMatchObject({
      sectionId: 'data-sources-management',
      learnMoreRef: '.ai/microphases/M08_1.md',
    });
    expect(getStudioHelpDescriptor('help.data.internal')).toMatchObject({
      sectionId: 'data-internal',
      learnMoreRef: '.ai/microphases/M08_2.md',
    });
    expect(getStudioHelpDescriptor('help.data.rest')).toMatchObject({
      sectionId: 'data-rest',
      learnMoreRef: '.ai/microphases/M08_3.md',
    });
    expect(getStudioHelpDescriptor('help.data.graphql')).toMatchObject({
      sectionId: 'data-graphql',
      learnMoreRef: '.ai/microphases/M08_4.md',
    });
  });

  it('keeps related concepts inside the same registry', () => {
    for (const descriptor of studioHelpDescriptors) {
      for (const relatedId of descriptor.relatedIds) expect(() => getStudioHelpDescriptor(relatedId)).not.toThrow();
    }
  });

  it('fails closed for an unknown help id', () => {
    expect(() => getStudioHelpDescriptor('help.section.unknown' as never)).toThrow(/Unknown Studio help descriptor/);
  });
});
