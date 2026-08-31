import type { SidebarNavigationItemId } from '../shell/sidebar-navigation';
import * as base from './help-registry-base';

export type StudioHelpId = base.StudioHelpId | 'help.data.graphql';

export interface HelpDescriptor extends Omit<base.HelpDescriptor, 'id' | 'relatedIds'> {
  readonly id: StudioHelpId;
  readonly relatedIds: readonly StudioHelpId[];
}

const graphQLHelpDescriptor: HelpDescriptor = Object.freeze({
  id: 'help.data.graphql',
  sectionId: 'data-graphql',
  section: 'Fuentes de datos',
  titleKey: 'help.section.data-sources.title',
  shortKey: 'help.section.data-sources.short',
  longKey: 'help.section.data-sources.long',
  exampleKeys: Object.freeze([]),
  relatedIds: Object.freeze(['help.data.sources', 'help.data.rest', 'help.section.queries'] as const),
  keywords: Object.freeze([
    'graphql',
    'introspection',
    'query',
    'mutation',
    'variables',
    'secretref',
    'connectorgateway',
    'cors',
    'schema',
    'endpoint',
  ]),
  learnMoreRef: '.ai/microphases/M08_4.md',
  title: 'GraphQL',
  summary: 'Conecta endpoints GraphQL mediante introspection, consultas, mutaciones y variables tipadas.',
  details: Object.freeze([
    'ElectroCraft usa GraphQL sobre Fetch detrás del mismo DataSourceAdapter y ConnectorRegistry. Los secretos se conservan solo como SecretRef y pasan por ConnectorGateway cuando la política de seguridad lo exige.',
    'Ejemplo: inspecciona el esquema, selecciona una Query, completa sus variables y prueba la operación antes de guardar la fuente.',
  ]),
});

export const studioHelpDescriptors = Object.freeze([
  ...(base.studioHelpDescriptors as readonly base.HelpDescriptor[]),
  graphQLHelpDescriptor,
]) as readonly HelpDescriptor[];

export const studioHelpRegistry = Object.freeze({
  ...base.studioHelpRegistry,
  'help.data.graphql': graphQLHelpDescriptor,
}) as Readonly<Record<StudioHelpId, HelpDescriptor>>;

export const studioShellHelpDescriptor = base.studioShellHelpDescriptor as HelpDescriptor;
export const studioAppearanceHelpDescriptor = base.studioAppearanceHelpDescriptor as HelpDescriptor;
export const studioLanguageHelpDescriptor = base.studioLanguageHelpDescriptor as HelpDescriptor;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  if (helpId === 'help.data.graphql') return graphQLHelpDescriptor;
  return base.getStudioHelpDescriptor(helpId) as HelpDescriptor;
}

export function getHelpIdForNavigationItem(itemId: SidebarNavigationItemId): StudioHelpId {
  return base.getHelpIdForNavigationItem(itemId);
}

export function searchStudioHelp(query: string): readonly HelpDescriptor[] {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (!normalized) return studioHelpDescriptors;
  return studioHelpDescriptors.filter((descriptor) =>
    [descriptor.title, descriptor.summary, descriptor.section, ...descriptor.details, ...descriptor.keywords]
      .join(' ')
      .toLocaleLowerCase('es')
      .includes(normalized),
  );
}
