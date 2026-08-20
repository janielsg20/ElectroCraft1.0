import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  getStudioIcon,
} from '@electrocraft/design-system';
import { translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';
import { useState, useSyncExternalStore } from 'react';
import {
  getStudioHelpDescriptor,
  searchStudioHelp,
  type HelpDescriptor,
  type StudioHelpId,
} from './help-registry';

const HelpIcon = getStudioIcon('studio.help');
const CloseIcon = getStudioIcon('window.close');
const MOBILE_HELP_QUERY = '(max-width: 767px)';
const HELP_METRICS_ENABLED = false;
const HELP_METRICS_KEY = 'electrocraft.studio.help.metrics.v1';

type HelpMessageKey = ElectroCraftResourceKey<'help'>;
const helpT = (key: HelpMessageKey) => translateStrict('help', key);

function subscribeHelpViewport(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const query = window.matchMedia(MOBILE_HELP_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

function isMobileHelpViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_HELP_QUERY).matches;
}

function recordHelpMetric(helpId: StudioHelpId) {
  if (!HELP_METRICS_ENABLED || typeof window === 'undefined') return;
  const current = JSON.parse(window.localStorage.getItem(HELP_METRICS_KEY) ?? '{}') as Record<string, number>;
  current[helpId] = (current[helpId] ?? 0) + 1;
  window.localStorage.setItem(HELP_METRICS_KEY, JSON.stringify(current));
}

function HelpArticle({
  descriptor,
  onSelectRelated,
}: {
  readonly descriptor: HelpDescriptor;
  readonly onSelectRelated?: (helpId: StudioHelpId) => void;
}) {
  const [longDescription, example] = descriptor.details;

  return (
    <article className="grid gap-3" data-help-article={descriptor.id}>
      <div className="grid gap-1">
        <p className="text-sm font-medium text-foreground">{descriptor.summary}</p>
        <p className="text-sm leading-6 text-muted-foreground">{longDescription}</p>
      </div>

      {example ? (
        <section className="grid gap-1" aria-label={helpT('help.example')}>
          <strong className="text-xs uppercase tracking-wide text-muted-foreground">{helpT('help.example')}</strong>
          <p className="text-sm text-foreground">{example}</p>
        </section>
      ) : null}

      {descriptor.relatedIds.length > 0 ? (
        <section className="grid gap-2" aria-label={helpT('help.related')}>
          <strong className="text-xs uppercase tracking-wide text-muted-foreground">{helpT('help.related')}</strong>
          <div className="flex flex-wrap gap-1.5">
            {descriptor.relatedIds.map((relatedId) => {
              const related = getStudioHelpDescriptor(relatedId);
              return onSelectRelated ? (
                <Button key={relatedId} variant="outline" size="sm" onClick={() => onSelectRelated(relatedId)}>
                  {related.title}
                </Button>
              ) : (
                <span key={relatedId} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  {related.title}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}

      {descriptor.learnMoreRef ? (
        <p className="text-xs text-muted-foreground">
          <strong>{helpT('help.moreInfo')}:</strong> <code>{descriptor.learnMoreRef}</code>
        </p>
      ) : null}
    </article>
  );
}

export interface HelpTriggerProps {
  readonly helpId: StudioHelpId;
  readonly labelKey?: HelpMessageKey;
  readonly showLabel?: boolean;
  readonly className?: string;
  readonly 'data-language-help-trigger'?: boolean;
}

export function HelpTrigger({
  helpId,
  labelKey = 'help.moreInfo',
  showLabel = false,
  className,
  'data-language-help-trigger': languageHelpTrigger,
}: HelpTriggerProps) {
  const mobile = useSyncExternalStore(subscribeHelpViewport, isMobileHelpViewport, () => false);
  const descriptor = getStudioHelpDescriptor(helpId);
  const label = helpT(labelKey);
  const trigger = (
    <Button
      variant="ghost"
      size={showLabel ? 'sm' : 'icon'}
      className={className}
      aria-label={label}
      data-help-trigger={helpId}
      data-language-help-trigger={languageHelpTrigger || undefined}
      onClick={() => recordHelpMetric(helpId)}
    >
      <HelpIcon aria-hidden="true" />
      {showLabel ? <span>{label}</span> : null}
    </Button>
  );

  if (mobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="max-h-[82dvh] overflow-y-auto" data-help-mobile-sheet={helpId}>
          <SheetHeader>
            <SheetTitle>{descriptor.title}</SheetTitle>
            <SheetDescription>{descriptor.summary}</SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0">
            <HelpArticle descriptor={descriptor} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{descriptor.summary}</TooltipContent>
          <PopoverContent align="start" data-help-desktop-popover={helpId}>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <strong className="text-sm font-semibold">{descriptor.title}</strong>
                <p className="text-xs text-muted-foreground">{descriptor.section}</p>
              </div>
              <HelpArticle descriptor={descriptor} />
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
}

export function HelpDrawerTrigger({
  initialHelpId = 'help.studio.shell',
  label,
  className,
}: {
  readonly initialHelpId?: StudioHelpId;
  readonly label: string;
  readonly className?: string;
}) {
  const [selectedId, setSelectedId] = useState<StudioHelpId>(initialHelpId);
  const [query, setQuery] = useState('');
  const selected = getStudioHelpDescriptor(selectedId);
  const results = searchStudioHelp(query);

  const selectHelp = (helpId: StudioHelpId) => {
    setSelectedId(helpId);
    setQuery('');
    recordHelpMetric(helpId);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={className}
          variant="ghost"
          size="sm"
          aria-label={label}
          data-topbar-help-trigger
          onClick={() => recordHelpMetric(initialHelpId)}
        >
          <HelpIcon aria-hidden="true" />
          <span className="ec-topbar-action-label">{label}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="ec-topbar-sheet" data-topbar-help-sheet data-help-drawer>
        <SheetHeader>
          <SheetTitle>{selected.title}</SheetTitle>
          <SheetDescription>{selected.summary}</SheetDescription>
        </SheetHeader>
        <div className="ec-topbar-sheet-body" id="studio-shell-help">
          <label className="grid gap-1 text-xs font-medium" htmlFor="studio-help-search">
            {helpT('help.drawer.search')}
            <Input
              id="studio-help-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={helpT('help.drawer.search')}
              autoComplete="off"
            />
          </label>

          {query ? (
            <section className="grid gap-2" aria-label={helpT('help.drawer.results')} data-help-search-results>
              <strong className="text-xs uppercase tracking-wide text-muted-foreground">
                {helpT('help.drawer.results')}
              </strong>
              {results.length > 0 ? (
                <div className="grid gap-1">
                  {results.map((descriptor) => (
                    <Button
                      key={descriptor.id}
                      variant="ghost"
                      size="sm"
                      className="h-auto justify-start py-2 text-left"
                      onClick={() => selectHelp(descriptor.id)}
                    >
                      <span className="grid gap-0.5">
                        <strong>{descriptor.title}</strong>
                        <span className="text-xs text-muted-foreground">{descriptor.section}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground" role="status">
                  {helpT('help.drawer.empty')}
                </p>
              )}
            </section>
          ) : (
            <HelpArticle descriptor={selected} onSelectRelated={selectHelp} />
          )}

          <SheetClose asChild>
            <Button variant="outline" size="sm" aria-label={helpT('help.close')}>
              <CloseIcon aria-hidden="true" />
              {helpT('help.close')}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const studioHelpMetricsEnabled = HELP_METRICS_ENABLED;
