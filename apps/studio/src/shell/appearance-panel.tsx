import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  getStudioIcon,
} from '@electrocraft/design-system';
import { appearanceT } from '../i18n/appearance.es';
import type { StudioTheme } from '../theme';
import { StudioAppearanceProvider, useOptionalStudioAppearance, useStudioAppearance } from '../theme-provider';
import './appearance.css';

const AppearanceIcon = getStudioIcon('studio.sidebar.themes');
const CloseIcon = getStudioIcon('window.close');
const LightIcon = getStudioIcon('studio.theme');
const DarkIcon = getStudioIcon('studio.theme');

const modes: readonly StudioTheme[] = ['light', 'dark'];

export interface AppearancePanelTriggerProps {
  readonly presentation?: 'topbar' | 'mobile';
}

export function AppearancePanelTrigger(props: AppearancePanelTriggerProps) {
  const appearance = useOptionalStudioAppearance();

  if (!appearance) {
    return (
      <StudioAppearanceProvider>
        <AppearancePanelContent {...props} />
      </StudioAppearanceProvider>
    );
  }

  return <AppearancePanelContent {...props} />;
}

function AppearancePanelContent({ presentation = 'topbar' }: AppearancePanelTriggerProps) {
  const { theme, setTheme } = useStudioAppearance();
  const isMobile = presentation === 'mobile';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={isMobile ? 'sm' : 'icon'}
          className={isMobile ? 'ec-editor-mobile-action ec-appearance-mobile-trigger' : 'ec-topbar-appearance-trigger'}
          aria-label={appearanceT('trigger')}
          data-appearance-trigger={presentation}
        >
          <AppearanceIcon aria-hidden="true" />
          {isMobile ? <span>{appearanceT('trigger')}</span> : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={isMobile ? 'ec-appearance-sheet ec-appearance-sheet-mobile' : 'ec-appearance-sheet'}
        data-appearance-sheet={presentation}
      >
        <div className="ec-appearance-heading">
          <SheetHeader>
            <SheetTitle>{appearanceT('title')}</SheetTitle>
            <SheetDescription>{appearanceT('description')}</SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" size="icon" variant="ghost" aria-label={appearanceT('close')}>
              <CloseIcon aria-hidden="true" />
            </Button>
          </SheetClose>
        </div>

        <section className="ec-appearance-body" aria-labelledby="ec-appearance-mode-title">
          <div className="ec-appearance-section-heading">
            <h3 id="ec-appearance-mode-title">{appearanceT('modeGroup')}</h3>
            <p>{appearanceT('modeDescription')}</p>
          </div>

          <div className="ec-appearance-mode-grid" role="radiogroup" aria-label={appearanceT('modeGroup')}>
            {modes.map((mode) => {
              const selected = theme === mode;
              const Icon = mode === 'light' ? LightIcon : DarkIcon;
              return (
                <Button
                  key={mode}
                  type="button"
                  variant={selected ? 'secondary' : 'outline'}
                  className="ec-appearance-mode"
                  role="radio"
                  aria-checked={selected}
                  data-appearance-value={mode}
                  onClick={() => setTheme(mode)}
                >
                  <span className="ec-appearance-mode-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>
                    <strong>{mode === 'light' ? appearanceT('light') : appearanceT('dark')}</strong>
                    <small>{mode === 'light' ? appearanceT('lightDescription') : appearanceT('darkDescription')}</small>
                  </span>
                </Button>
              );
            })}
          </div>

          <aside className="ec-appearance-note">
            <strong>{appearanceT('helpTitle')}</strong>
            <p>{appearanceT('helpBody')}</p>
          </aside>
        </section>
      </SheetContent>
    </Sheet>
  );
}
