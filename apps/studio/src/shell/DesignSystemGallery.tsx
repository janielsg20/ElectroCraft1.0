import * as React from 'react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  getElectroCraftIcon,
  useStudioTheme,
  type ElectroCraftIconId,
  type ElectroCraftStudioDensity,
  type ElectroCraftStudioThemeMode,
} from '@electrocraft/design-system';
import type { StudioBootstrapHealth } from '../bootstrap-health';
import { getStudioHelpDescriptor } from '../help/studio-shell-help';
import { tStudio, type StudioMessageKey } from '../i18n/es';

const navigationExamples = [
  ['nav.editor', 'editor'],
  ['nav.screens', 'screens'],
  ['nav.templates', 'templates'],
  ['nav.components', 'components'],
  ['nav.aiGenerate', 'aiGenerate'],
  ['nav.content', 'content'],
  ['nav.models', 'models'],
  ['nav.queries', 'queries'],
  ['nav.forms', 'forms'],
  ['nav.automations', 'automations'],
  ['nav.administration', 'administration'],
  ['nav.roles', 'roles'],
  ['nav.media', 'media'],
  ['nav.extensions', 'extensions'],
  ['nav.themes', 'themes'],
  ['nav.preview', 'preview'],
  ['nav.compatibility', 'compatibility'],
  ['nav.export', 'export'],
  ['nav.deploy', 'deploy'],
  ['nav.help', 'help'],
  ['nav.settings', 'settings'],
] as const satisfies ReadonlyArray<readonly [StudioMessageKey, ElectroCraftIconId]>;

const themeOptions = [
  ['light', 'gallery.themeLight', 'themeLight'],
  ['dark', 'gallery.themeDark', 'themeDark'],
  ['system', 'gallery.themeSystem', 'themeSystem'],
] as const satisfies ReadonlyArray<readonly [ElectroCraftStudioThemeMode, StudioMessageKey, ElectroCraftIconId]>;

const densityOptions = [
  ['compact', 'gallery.compact'],
  ['comfortable', 'gallery.comfortable'],
] as const satisfies ReadonlyArray<readonly [ElectroCraftStudioDensity, StudioMessageKey]>;

function IconLabel({ iconId, label }: { iconId: ElectroCraftIconId; label: string }) {
  const Icon = getElectroCraftIcon(iconId);
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function ThemeControls() {
  const { appearance, resolvedTheme, setTheme, setDensity } = useStudioTheme();
  const resolvedLabel = appearance.theme === 'light' ? 'gallery.themeLight' : 'gallery.themeDark';
  return (
    <section
      className="grid gap-3 rounded-lg border bg-card p-3 shadow-[var(--ec-shadow-panel)]"
      aria-labelledby="appearance-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="appearance-title" className="text-sm font-semibold text-card-foreground">
            {tStudio('gallery.theme')}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {appearance.theme === 'system'
              ? `${tStudio('gallery.themeSystem')} · ${resolvedTheme}`
              : tStudio(resolvedLabel)}
          </p>
        </div>
        <Badge variant="outline">{appearance.density}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label={tStudio('gallery.theme')}>
        {themeOptions.map(([mode, labelKey, iconId]) => {
          const Icon = getElectroCraftIcon(iconId);
          return (
            <Button
              key={mode}
              size="sm"
              variant={appearance.theme === mode ? 'secondary' : 'ghost'}
              aria-pressed={appearance.theme === mode}
              onClick={() => setTheme(mode)}
            >
              <Icon aria-hidden="true" />
              {tStudio(labelKey)}
            </Button>
          );
        })}
      </div>
      <Separator />
      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{tStudio('gallery.density')}</span>
        <div className="flex flex-wrap gap-1.5">
          {densityOptions.map(([density, labelKey]) => (
            <Button
              key={density}
              size="sm"
              variant={appearance.density === density ? 'secondary' : 'ghost'}
              aria-pressed={appearance.density === density}
              onClick={() => setDensity(density)}
            >
              {tStudio(labelKey)}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrimitiveStates() {
  const SettingsIcon = getElectroCraftIcon('settings');
  const MoreIcon = getElectroCraftIcon('blocks');
  return (
    <section
      className="grid gap-3 rounded-lg border bg-card p-3 shadow-[var(--ec-shadow-panel)]"
      aria-labelledby="states-title"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="states-title" className="text-sm font-semibold text-card-foreground">
          {tStudio('gallery.actions')}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon-sm" variant="ghost" aria-label={tStudio('gallery.moreActions')}>
              <MoreIcon aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tStudio('gallery.keyboardHint')}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">{tStudio('common.save')}</Button>
        <Button size="sm" variant="outline">
          {tStudio('common.cancel')}
        </Button>
        <Button size="sm" variant="destructive">
          {tStudio('gallery.error')}
        </Button>
        <Button size="sm" variant="secondary" disabled>
          {tStudio('gallery.disabled')}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Estados">
        <Badge variant="success">{tStudio('gallery.ready')}</Badge>
        <Badge variant="warning">{tStudio('gallery.loading')}</Badge>
        <Badge variant="destructive">{tStudio('gallery.error')}</Badge>
      </div>
      <div className="grid gap-2" aria-label={tStudio('gallery.loading')} aria-busy="true">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <SettingsIcon aria-hidden="true" />
              {tStudio('gallery.openMenu')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{tStudio('nav.settings')}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>{tStudio('nav.themes')}</DropdownMenuItem>
              <DropdownMenuItem>{tStudio('nav.compatibility')}</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {tStudio('nav.help')}
              <DropdownMenuShortcut>?</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              {tStudio('gallery.openTools')}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{tStudio('gallery.shellPreview')}</SheetTitle>
              <SheetDescription>{tStudio('gallery.keyboardHint')}</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4 text-sm text-muted-foreground">{tStudio('gallery.noDemoData')}</div>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}

function NavigationPrimitiveList() {
  return (
    <section
      className="min-h-0 rounded-lg border bg-card shadow-[var(--ec-shadow-panel)]"
      aria-labelledby="navigation-primitives-title"
    >
      <div className="border-b px-3 py-2.5">
        <h2 id="navigation-primitives-title" className="text-sm font-semibold text-card-foreground">
          {tStudio('gallery.shellPreview')}
        </h2>
      </div>
      <ScrollArea className="h-[min(42vh,25rem)]">
        <div className="grid grid-cols-1 gap-0.5 p-1.5 sm:grid-cols-2 xl:grid-cols-1">
          {navigationExamples.map(([labelKey, iconId]) => (
            <Button key={labelKey} variant="ghost" size="sm" className="justify-start font-normal">
              <IconLabel iconId={iconId} label={tStudio(labelKey)} />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

export function DesignSystemGallery({ health }: { health: StudioBootstrapHealth }) {
  const help = getStudioHelpDescriptor('help.studio.shell');
  const HelpIcon = getElectroCraftIcon('help');
  return (
    <main className="min-h-screen bg-background text-foreground" data-help-id={help.id}>
      <div className="mx-auto grid w-full max-w-[92rem] gap-3 p-3 md:p-4 xl:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
        <NavigationPrimitiveList />
        <div className="grid min-w-0 content-start gap-3">
          <header className="rounded-lg border bg-card p-4 shadow-[var(--ec-shadow-panel)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {tStudio('gallery.kicker')}
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-card-foreground md:text-2xl">
                  {tStudio('gallery.title')}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{tStudio('gallery.summary')}</p>
              </div>
              <div className="flex max-w-sm items-start gap-2" role="status" aria-live="polite">
                <Badge variant={health.state === 'ready' ? 'success' : 'warning'}>{health.label}</Badge>
                <span className="text-xs leading-5 text-muted-foreground">{health.detail}</span>
              </div>
            </div>
          </header>
          <div className="grid gap-3 lg:grid-cols-2">
            <ThemeControls />
            <PrimitiveStates />
          </div>
          <aside className="rounded-lg border bg-surface-sunken p-3" aria-labelledby="help-title">
            <div className="flex items-start gap-2">
              <HelpIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <h2 id="help-title" className="text-sm font-semibold">
                  {help.title}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{help.summary}</p>
                <p className="mt-1 text-[0.7rem] font-mono text-muted-foreground">{help.id}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
