import { Button } from './components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { getStudioIcon } from './icons/studio-icon-registry';
import { useTheme, type ThemePreference } from './foundation';

export interface DesignSystemGalleryCopy {
  readonly kicker: string;
  readonly title: string;
  readonly summary: string;
  readonly themeLabel: string;
  readonly themeSystem: string;
  readonly themeLight: string;
  readonly themeDark: string;
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly outlineAction: string;
  readonly ghostAction: string;
  readonly destructiveAction: string;
  readonly disabledAction: string;
  readonly tooltipLabel: string;
  readonly tooltipContent: string;
  readonly dropdownLabel: string;
  readonly keyboardFocusTechnicalLabel: string;
  readonly duplicateAction: string;
  readonly renameAction: string;
  readonly deleteAction: string;
  readonly sheetOpen: string;
  readonly sheetTitle: string;
  readonly sheetDescription: string;
  readonly fieldName: string;
  readonly fieldPlaceholder: string;
  readonly closeAction: string;
  readonly statesLabel: string;
  readonly typedStatesTechnicalLabel: string;
  readonly tokensLabel: string;
  readonly densityLabel: string;
  readonly densityHigh: string;
  readonly interactionHint: string;
  readonly navigationVocabulary: string;
  readonly i18nKeysTechnicalLabel: string;
  readonly helpTitle: string;
  readonly routeLabel: string;
  readonly internalNotice: string;
  readonly stateLabels: Readonly<Record<DesignSystemGalleryState, string>>;
}

export interface DesignSystemGalleryHelp {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export interface DesignSystemGalleryProps {
  readonly copy: DesignSystemGalleryCopy;
  readonly navigationLabels: readonly string[];
  readonly help: DesignSystemGalleryHelp;
}

const designSystemGalleryStates = [
  'initial',
  'loading',
  'ready',
  'empty',
  'error',
  'disabled',
  'saving',
  'saved',
  'blocked',
] as const;

type DesignSystemGalleryState = (typeof designSystemGalleryStates)[number];

const themeCycle: readonly ThemePreference[] = ['system', 'light', 'dark'];

const ThemeIcon = getStudioIcon('studio.theme');
const ChevronDownIcon = getStudioIcon('navigation.chevron-down');
const CloseIcon = getStudioIcon('window.close');
const LoadingIcon = getStudioIcon('status.loading');
const ErrorIcon = getStudioIcon('status.error');

const semanticTokens = [
  'background',
  'foreground',
  'surface',
  'border',
  'muted',
  'primary',
  'destructive',
  'ring',
] as const;

export function DesignSystemGallery({ copy, navigationLabels, help }: DesignSystemGalleryProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themeText = theme === 'system' ? copy.themeSystem : theme === 'light' ? copy.themeLight : copy.themeDark;

  const rotateTheme = () => {
    const index = themeCycle.indexOf(theme);
    setTheme(themeCycle[(index + 1) % themeCycle.length]);
  };

  return (
    <main
      className="ec-design-system ec-gallery"
      data-ec-density="high"
      data-help-id={help.id}
      data-resolved-theme={resolvedTheme}
    >
      <header className="ec-gallery-header">
        <div>
          <p className="ec-gallery-kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p>{copy.summary}</p>
        </div>
        <Button variant="outline" onClick={rotateTheme} aria-label={`${copy.themeLabel}: ${themeText}`}>
          <ThemeIcon aria-hidden="true" />
          {copy.themeLabel}: {themeText}
        </Button>
      </header>

      <section className="ec-gallery-grid" aria-label={copy.title}>
        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>Button</span>
            <code>Radix Slot + CVA</code>
          </div>
          <Separator />
          <div className="ec-gallery-row">
            <Button variant="theme">{copy.primaryAction}</Button>
            <Button variant="secondary">{copy.secondaryAction}</Button>
            <Button variant="outline">{copy.outlineAction}</Button>
            <Button variant="ghost">{copy.ghostAction}</Button>
            <Button variant="destructive">{copy.destructiveAction}</Button>
            <Button disabled>{copy.disabledAction}</Button>
            <Button size="icon" variant="outline" aria-label={copy.themeLabel}>
              <ThemeIcon aria-hidden="true" />
            </Button>
          </div>
        </article>

        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>Tooltip + DropdownMenu</span>
            <code>Radix · {copy.keyboardFocusTechnicalLabel}</code>
          </div>
          <Separator />
          <TooltipProvider>
            <div className="ec-gallery-row">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">{copy.tooltipLabel}</Button>
                </TooltipTrigger>
                <TooltipContent>{copy.tooltipContent}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label={copy.dropdownLabel}>
                    {copy.dropdownLabel}
                    <ChevronDownIcon aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>{copy.duplicateAction}</DropdownMenuItem>
                  <DropdownMenuItem>{copy.renameAction}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>{copy.deleteAction}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        </article>

        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>Sheet + Input</span>
            <code>Radix Dialog</code>
          </div>
          <Separator />
          <div className="ec-gallery-row">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">{copy.sheetOpen}</Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex items-start justify-between gap-3">
                  <SheetHeader>
                    <SheetTitle>{copy.sheetTitle}</SheetTitle>
                    <SheetDescription>{copy.sheetDescription}</SheetDescription>
                  </SheetHeader>
                  <SheetClose asChild>
                    <Button size="icon" variant="ghost" aria-label={copy.closeAction}>
                      <CloseIcon aria-hidden="true" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="mt-4 ec-gallery-stack">
                  <label className="ec-gallery-field">
                    {copy.fieldName}
                    <Input name="component-name" placeholder={copy.fieldPlaceholder} autoComplete="off" />
                  </label>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </article>

        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>{copy.tokensLabel}</span>
            <code>
              {copy.densityLabel}: {copy.densityHigh}
            </code>
          </div>
          <Separator />
          <div className="ec-gallery-token-grid" aria-label={copy.tokensLabel}>
            {semanticTokens.map((token) => (
              <div className="ec-gallery-token" key={token}>
                <span
                  className="ec-gallery-token-swatch"
                  style={{ background: `var(--${token})` }}
                  aria-hidden="true"
                />
                <code>{token}</code>
              </div>
            ))}
          </div>
          <p className="ec-gallery-interaction-hint">{copy.interactionHint}</p>
        </article>

        <article className="ec-gallery-card" data-state="error">
          <div className="ec-gallery-card-heading">
            <span>{copy.statesLabel}</span>
            <code>{copy.typedStatesTechnicalLabel}</code>
          </div>
          <Separator />
          <ScrollArea label={copy.statesLabel} className="mt-3 h-52">
            <ul className="ec-gallery-list">
              {designSystemGalleryStates.map((state) => {
                const label = copy.stateLabels[state];

                return (
                  <li key={state} data-state={state}>
                    <span>{label}</span>
                    {state === 'loading' || state === 'saving' ? (
                      <LoadingIcon className="animate-spin" role="img" aria-label={label} />
                    ) : state === 'error' || state === 'blocked' ? (
                      <ErrorIcon role="img" aria-label={label} />
                    ) : (
                      <code>{state}</code>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </article>

        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>{copy.navigationVocabulary}</span>
            <code>{copy.i18nKeysTechnicalLabel}</code>
          </div>
          <Separator />
          <div className="ec-gallery-navigation">
            {navigationLabels.map((label) => (
              <span className="ec-gallery-chip" key={label}>
                {label}
              </span>
            ))}
          </div>
        </article>

        <article className="ec-gallery-card">
          <div className="ec-gallery-card-heading">
            <span>{copy.helpTitle}</span>
            <code>{help.id}</code>
          </div>
          <Separator />
          <aside className="ec-gallery-help mt-3" aria-labelledby="ec-gallery-help-title">
            <h2 id="ec-gallery-help-title">{help.title}</h2>
            <p>{help.summary}</p>
            {help.details.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </aside>
        </article>
      </section>

      <footer className="ec-gallery-footer">
        <span>
          {copy.routeLabel}: <code>/__design-system</code>
        </span>
        <span>{copy.internalNotice}</span>
      </footer>
    </main>
  );
}
