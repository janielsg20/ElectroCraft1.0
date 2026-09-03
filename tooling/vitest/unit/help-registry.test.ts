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
  'help.data.secrets',
  'help.data.explorer',
  'help.data.connectors',
  'help.content.models',
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
    expect(searchStudioHelp('secretstore').some((entry) => entry.id === 'help.data.secrets')).toBe(true);
    expect(searchStudioHelp('sin read-back').some((entry) => entry.id === 'help.data.secrets')).toBe(true);
    expect(searchStudioHelp('data explorer').some((entry) => entry.id === 'help.data.explorer')).toBe(true);
    expect(searchStudioHelp('postgresql').some((entry) => entry.id === 'help.data.connectors')).toBe(true);
    expect(searchStudioHelp('connector sdk').some((entry) => entry.id === 'help.data.connectors')).toBe(true);
    expect(searchStudioHelp('field registry').some((entry) => entry.id === 'help.content.models')).toBe(true);
    expect(searchStudioHelp('impacto de datos').some((entry) => entry.id === 'help.content.models')).toBe(true);
  });

  it('maps Fuentes de datos and Modelos to their M08 contextual descriptors', () => {
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
    expect(getStudioHelpDescriptor('help.data.explorer')).toMatchObject({
      sectionId: 'data-explorer',
      learnMoreRef: '.ai/microphases/M08_6.md',
    });
    expect(getStudioHelpDescriptor('help.data.secrets')).toMatchObject({
      sectionId: 'data-secrets',
      learnMoreRef: '.ai/microphases/M08_5.md',
    });
    expect(getStudioHelpDescriptor('help.data.connectors')).toMatchObject({
      sectionId: 'data-connectors',
      learnMoreRef: '.ai/microphases/M08_7.md',
    });
    expect(getHelpIdForNavigationItem('models')).toBe('help.content.models');
    expect(getStudioHelpDescriptor('help.content.models')).toMatchObject({
      sectionId: 'content-models',
      learnMoreRef: '.ai/microphases/M08_8.md',
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
