import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
  getStudioIcon,
} from '@electrocraft/design-system';
import type { ReactNode } from 'react';
import { HelpTrigger } from '../help/help-ui';
import { getHelpIdForNavigationItem, type StudioHelpId } from '../help/help-registry';
import { iaT } from '../i18n/information-architecture.es';
import {
  getEmptyState,
  resolveModuleEmptyState,
  type EmptyStateDescriptor,
  type InformationLevel,
} from './information-architecture';
import { getStudioSidebarNavigationItem, resolveSidebarActiveItem } from './sidebar-navigation';

const DisclosureIcon = getStudioIcon('navigation.chevron-down');
const EmptyIcon = getStudioIcon('studio.help');
const RecordsIcon = getStudioIcon('studio.sidebar.records');

const emptyStateHelpIds: Readonly<Record<EmptyStateDescriptor['id'], StudioHelpId>> = Object.freeze({
  'project-home': 'help.studio.shell',
  canvas: 'help.section.editor',
  outline: 'help.section.editor',
  inspector: 'help.section.editor',
  content: 'help.section.records',
  'content-detail': 'help.section.records',
  queries: 'help.section.queries',
  forms: 'help.section.forms',
  administration: 'help.section.admin',
  media: 'help.section.media',
  export: 'help.section.export',
});

export interface ProgressiveDisclosureProps {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly level?: Extract<InformationLevel, 'advanced' | 'diagnostic'>;
  readonly badge?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function ProgressiveDisclosure({
  id,
  title,
  summary,
  level = 'advanced',
  badge,
  defaultOpen = false,
  children,
}: ProgressiveDisclosureProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} data-information-level={level} data-progressive-disclosure={id}>
      <CollapsibleTrigger asChild>
        <Button className="ec-ia-disclosure-trigger" variant="ghost" size="sm" aria-describedby={`${id}-summary`}>
          <span className="ec-ia-disclosure-label">{title}</span>
          {badge ? <span className="ec-ia-disclosure-badge">{badge}</span> : null}
          <DisclosureIcon className="ec-ia-disclosure-chevron" aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <p className="ec-ia-disclosure-summary" id={`${id}-summary`}>
        {summary}
      </p>
      <CollapsibleContent className="ec-ia-disclosure-content">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function StudioEmptyState({
  id,
  className,
}: {
  readonly id: EmptyStateDescriptor['id'];
  readonly className?: string;
}) {
  const descriptor = getEmptyState(id);
  return (
    <EmptyState
      className={className}
      icon={<EmptyIcon aria-hidden="true" />}
      title={iaT(descriptor.titleKey)}
      description={iaT(descriptor.descriptionKey)}
      action={<HelpTrigger helpId={emptyStateHelpIds[id]} labelKey="help.whatCanIDo" showLabel className="px-0" />}
    />
  );
}

export function StudioContentListDetailRoute() {
  return (
    <section className="ec-ia-route" aria-labelledby="content-route-title" data-ia-route="content-list-detail">
      <header className="ec-ia-route-header">
        <span className="ec-ia-route-icon" aria-hidden="true">
          <RecordsIcon />
        </span>
        <div className="ec-ia-route-heading-copy">
          <p className="ec-ia-route-kicker">
            {iaT('studio.ia.listDetail.listLabel')} / {iaT('studio.ia.listDetail.detailLabel')}
          </p>
          <div className="flex items-center gap-2">
            <h1 id="content-route-title">{iaT('studio.ia.content.title')}</h1>
            <HelpTrigger helpId="help.section.records" />
          </div>
        </div>
      </header>
      <div className="ec-ia-list-detail" data-list-detail-pattern>
        <section className="ec-ia-list-region" aria-labelledby="content-list-title" data-information-level="primary">
          <h2 id="content-list-title">{iaT('studio.ia.content.listTitle')}</h2>
          <StudioEmptyState id="content" />
        </section>
        <section
          className="ec-ia-detail-region"
          aria-label={iaT('studio.ia.listDetail.detailLabel')}
          data-information-level="contextual"
        >
          <StudioEmptyState id="content-detail" />
        </section>
      </div>
    </section>
  );
}

export function StudioModuleEmptyStateRoute({ pathname }: { readonly pathname: string }) {
  const descriptor = resolveModuleEmptyState(pathname);
  if (!descriptor) return null;

  const activeItemId = resolveSidebarActiveItem(pathname);
  if (!activeItemId) return null;
  const navigationItem = getStudioSidebarNavigationItem(activeItemId);
  const helpId = getHelpIdForNavigationItem(activeItemId);
  const ModuleIcon = getStudioIcon(navigationItem.iconId);

  return (
    <section className="ec-ia-route" aria-labelledby="module-empty-title" data-ia-route="module-empty-state">
      <header className="ec-ia-route-header">
        <span className="ec-ia-route-icon" aria-hidden="true">
          <ModuleIcon />
        </span>
        <div className="ec-ia-route-heading-copy flex items-center gap-2">
          <h1 id="module-empty-title">{navigationItem.label}</h1>
          <HelpTrigger helpId={helpId} />
        </div>
      </header>
      <div className="ec-ia-module-empty" data-information-level="primary">
        <StudioEmptyState id={descriptor.id} />
      </div>
    </section>
  );
}
