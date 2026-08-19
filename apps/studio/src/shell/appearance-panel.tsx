import {
  Button,
  Input,
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
import type {
  EditorAppearanceAccent,
  EditorAppearanceDensity,
  EditorAppearanceTone,
  EditorCanvasDensity,
} from '../theme';
import { useStudioAppearance } from '../theme-provider';
import './appearance.css';

const AppearanceIcon = getStudioIcon('studio.sidebar.themes');
const CloseIcon = getStudioIcon('window.close');

const tones: readonly EditorAppearanceTone[] = ['system', 'light', 'dark'];
const accents: readonly EditorAppearanceAccent[] = ['indigo', 'blue', 'emerald', 'amber', 'rose'];
const densities: readonly EditorAppearanceDensity[] = ['high', 'comfortable'];
const canvasDensities: readonly EditorCanvasDensity[] = ['compact', 'comfortable', 'spacious'];

const toneLabels = Object.freeze({
  system: appearanceT('system'),
  light: appearanceT('light'),
  dark: appearanceT('dark'),
});
const accentLabels = Object.freeze({
  indigo: appearanceT('indigo'),
  blue: appearanceT('blue'),
  emerald: appearanceT('emerald'),
  amber: appearanceT('amber'),
  rose: appearanceT('rose'),
});
const densityLabels = Object.freeze({
  high: appearanceT('high'),
  comfortable: appearanceT('comfortable'),
});
const canvasDensityLabels = Object.freeze({
  compact: appearanceT('compact'),
  comfortable: appearanceT('comfortable'),
  spacious: appearanceT('spacious'),
});

interface AppearanceChoiceGroupProps<Value extends string> {
  readonly label: string;
  readonly values: readonly Value[];
  readonly selected: Value;
  readonly labels: Readonly<Record<Value, string>>;
  readonly onSelect: (value: Value) => void;
  readonly dataGroup: string;
}

function AppearanceChoiceGroup<Value extends string>({
  label,
  values,
  selected,
  labels,
  onSelect,
  dataGroup,
}: AppearanceChoiceGroupProps<Value>) {
  return (
    <fieldset className="ec-appearance-fieldset" data-appearance-group={dataGroup}>
      <legend>{label}</legend>
      <div className="ec-appearance-choice-grid">
        {values.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={selected === value ? 'secondary' : 'outline'}
            aria-pressed={selected === value}
            data-appearance-value={value}
            onClick={() => onSelect(value)}
          >
            {labels[value]}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export interface AppearancePanelTriggerProps {
  readonly presentation?: 'topbar' | 'mobile';
}

export function AppearancePanelTrigger({ presentation = 'topbar' }: AppearancePanelTriggerProps) {
  const { appliedProfile, previewProfile, resolvedProfile, preview, apply, revert, reset } = useStudioAppearance();
  const isMobile = presentation === 'mobile';
  const hasPreview = previewProfile !== null;

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
        <SheetHeader>
          <SheetTitle>{appearanceT('title')}</SheetTitle>
          <SheetDescription>{appearanceT('description')}</SheetDescription>
        </SheetHeader>

        <div className="ec-appearance-body">
          <label className="ec-appearance-name-field">
            <span>{appearanceT('profileName')}</span>
            <Input
              value={resolvedProfile.name}
              maxLength={48}
              data-appearance-profile-name
              onChange={(event) => preview({ ...resolvedProfile, name: event.currentTarget.value })}
            />
          </label>

          <AppearanceChoiceGroup
            label={appearanceT('tone')}
            values={tones}
            selected={resolvedProfile.tone}
            labels={toneLabels}
            dataGroup="tone"
            onSelect={(tone) => preview({ ...resolvedProfile, tone })}
          />
          <AppearanceChoiceGroup
            label={appearanceT('accent')}
            values={accents}
            selected={resolvedProfile.accent}
            labels={accentLabels}
            dataGroup="accent"
            onSelect={(accent) => preview({ ...resolvedProfile, accent })}
          />
          <AppearanceChoiceGroup
            label={appearanceT('density')}
            values={densities}
            selected={resolvedProfile.density}
            labels={densityLabels}
            dataGroup="density"
            onSelect={(density) => preview({ ...resolvedProfile, density })}
          />
          <AppearanceChoiceGroup
            label={appearanceT('canvasDensity')}
            values={canvasDensities}
            selected={resolvedProfile.canvasDensity}
            labels={canvasDensityLabels}
            dataGroup="canvas-density"
            onSelect={(canvasDensity) => preview({ ...resolvedProfile, canvasDensity })}
          />

          <p className="ec-appearance-preview-hint" role="status" data-appearance-preview-active={hasPreview || undefined}>
            {hasPreview ? appearanceT('previewHint') : appliedProfile.name}
          </p>

          <div className="ec-appearance-actions">
            <Button type="button" size="sm" onClick={() => apply()} disabled={!hasPreview} data-appearance-apply>
              {appearanceT('apply')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={revert} disabled={!hasPreview} data-appearance-revert>
              {appearanceT('revert')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={reset} data-appearance-reset>
              {appearanceT('reset')}
            </Button>
          </div>
        </div>

        <SheetClose asChild>
          <Button className="ec-appearance-close" variant="ghost" size="sm" aria-label={appearanceT('close')}>
            <CloseIcon aria-hidden="true" />
            {appearanceT('close')}
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
