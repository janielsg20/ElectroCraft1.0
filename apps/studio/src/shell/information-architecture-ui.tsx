import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  EmptyState,
  getStudioIcon,
} from '@electrocraft/design-system';
import type { ReactNode } from 'react';
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
    />
  );
}

export function StudioContentListDetailRoute() {
  return (
    <section className="ec-ia-route" aria-labelledby="content-route-title" data-ia-route="content-list-detail">
      <header className="ec-ia-route-header">
        <div>
          <p className="ec-ia-route-kicker">
            {iaT('studio.ia.listDetail.listLabel')} / {iaT('studio.ia.listDetail.detailLabel')}
          </p>
          <h1 id="content-route-title">{iaT('studio.ia.content.title')}</h1>
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

  return (
    <section className="ec-ia-route" aria-labelledby="module-empty-title" data-ia-route="module-empty-state">
      <header className="ec-ia-route-header">
        <h1 id="module-empty-title">{navigationItem.label}</h1>
      </header>
      <div className="ec-ia-module-empty" data-information-level="primary">
        <EmptyState
          icon={<EmptyIcon aria-hidden="true" />}
          title={iaT(descriptor.titleKey)}
          description={iaT(descriptor.descriptionKey)}
        />
      </div>
    </section>
  );
}
