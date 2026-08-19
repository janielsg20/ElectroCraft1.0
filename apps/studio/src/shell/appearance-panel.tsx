import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  getStudioIcon,
} from '@electrocraft/design-system';
import { useState, type ReactNode } from 'react';
import { appearanceT } from '../i18n/appearance.es';
import type {
  StudioAnimationIntensity,
  StudioAppearanceAccent,
  StudioAppearanceDensity,
  StudioAppearanceTone,
  StudioButtonShape,
  StudioCanvasDensity,
  StudioContrastPreference,
  StudioControlSize,
  StudioElevation,
  StudioFieldShape,
  StudioIconSize,
  StudioIconStyle,
  StudioMenuAppearance,
  StudioRadii,
  StudioSemanticColors,
  StudioSpacingScale,
  StudioTypographyFamily,
  StudioTypographyScale,
} from '../theme';
import { StudioAppearanceProvider, useOptionalStudioAppearance, useStudioAppearance } from '../theme-provider';
import './appearance.css';

const AppearanceIcon = getStudioIcon('studio.sidebar.themes');
const CloseIcon = getStudioIcon('window.close');

const tones: readonly StudioAppearanceTone[] = ['system', 'light', 'dark'];
const accents: readonly StudioAppearanceAccent[] = ['indigo', 'blue', 'emerald', 'amber', 'rose'];
const semanticColors: readonly StudioSemanticColors[] = ['balanced', 'muted', 'vivid'];
const typographyFamilies: readonly StudioTypographyFamily[] = ['system', 'humanist', 'geometric', 'mono'];
const typographyScales: readonly StudioTypographyScale[] = ['compact', 'standard', 'large'];
const iconSizes: readonly StudioIconSize[] = ['compact', 'standard', 'large'];
const iconStyles: readonly StudioIconStyle[] = ['outline', 'strong'];
const radii: readonly StudioRadii[] = ['square', 'subtle', 'rounded'];
const elevations: readonly StudioElevation[] = ['flat', 'subtle', 'raised'];
const densities: readonly StudioAppearanceDensity[] = ['high', 'comfortable'];
const controlSizes: readonly StudioControlSize[] = ['compact', 'standard', 'large'];
const buttonShapes: readonly StudioButtonShape[] = ['square', 'rounded', 'pill'];
const fieldShapes: readonly StudioFieldShape[] = ['square', 'rounded'];
const menuAppearances: readonly StudioMenuAppearance[] = ['solid', 'soft', 'glass'];
const spacingScales: readonly StudioSpacingScale[] = ['compact', 'standard', 'spacious'];
const canvasDensities: readonly StudioCanvasDensity[] = ['compact', 'comfortable', 'spacious'];
const animationIntensities: readonly StudioAnimationIntensity[] = ['none', 'reduced', 'standard', 'high'];
const contrastPreferences: readonly StudioContrastPreference[] = ['standard', 'high'];

const toneLabels = { system: appearanceT('system'), light: appearanceT('light'), dark: appearanceT('dark') } as const;
const accentLabels = {
  indigo: appearanceT('indigo'),
  blue: appearanceT('blue'),
  emerald: appearanceT('emerald'),
  amber: appearanceT('amber'),
  rose: appearanceT('rose'),
} as const;
const semanticColorLabels = {
  balanced: appearanceT('balanced'),
  muted: appearanceT('muted'),
  vivid: appearanceT('vivid'),
} as const;
const typographyFamilyLabels = {
  system: appearanceT('system'),
  humanist: appearanceT('humanist'),
  geometric: appearanceT('geometric'),
  mono: appearanceT('mono'),
} as const;
const scaleLabels = {
  compact: appearanceT('compact'),
  standard: appearanceT('standard'),
  large: appearanceT('large'),
} as const;
const iconStyleLabels = { outline: appearanceT('outline'), strong: appearanceT('strong') } as const;
const radiiLabels = {
  square: appearanceT('square'),
  subtle: appearanceT('subtle'),
  rounded: appearanceT('rounded'),
} as const;
const elevationLabels = {
  flat: appearanceT('flat'),
  subtle: appearanceT('subtle'),
  raised: appearanceT('raised'),
} as const;
const densityLabels = { high: appearanceT('high'), comfortable: appearanceT('comfortable') } as const;
const buttonShapeLabels = {
  square: appearanceT('square'),
  rounded: appearanceT('rounded'),
  pill: appearanceT('pill'),
} as const;
const fieldShapeLabels = { square: appearanceT('square'), rounded: appearanceT('rounded') } as const;
const menuLabels = {
  solid: appearanceT('solid'),
  soft: appearanceT('soft'),
  glass: appearanceT('glass'),
} as const;
const spacingLabels = {
  compact: appearanceT('compact'),
  standard: appearanceT('standard'),
  spacious: appearanceT('spacious'),
} as const;
const canvasLabels = {
  compact: appearanceT('compact'),
  comfortable: appearanceT('comfortable'),
  spacious: appearanceT('spacious'),
} as const;
const animationLabels = {
  none: appearanceT('none'),
  reduced: appearanceT('reduced'),
  standard: appearanceT('standard'),
  high: appearanceT('high'),
} as const;
const contrastLabels = { standard: appearanceT('standard'), high: appearanceT('high') } as const;

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

function AppearanceSection({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="ec-appearance-section" aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

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
  const {
    appliedProfile,
    previewProfile,
    resolvedProfile,
    presets,
    personalPresets,
    accessibilityWarnings,
    systemReducedMotion,
    preview,
    previewPreset,
    apply,
    revert,
    reset,
    restoreAccessibleDefaults,
    savePersonalPreset,
  } = useStudioAppearance();
  const [open, setOpen] = useState(false);
  const [pendingCloseDecision, setPendingCloseDecision] = useState(false);
  const isMobile = presentation === 'mobile';
  const hasPreview = previewProfile !== null;

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && hasPreview) {
      setPendingCloseDecision(true);
      return;
    }
    setPendingCloseDecision(false);
    setOpen(nextOpen);
  };

  const applyAndClose = () => {
    apply();
    setPendingCloseDecision(false);
    setOpen(false);
  };
  const discardAndClose = () => {
    revert();
    setPendingCloseDecision(false);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={requestOpenChange}>
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
          <section className="ec-appearance-presets" aria-label={appearanceT('presets')}>
            <div className="ec-appearance-preset-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-appearance-preset-trigger>
                    {appearanceT('presets')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" data-appearance-preset-menu>
                  {presets.map((preset, index) => (
                    <span key={preset.id}>
                      {index === 3 && personalPresets.length > 0 ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuItem
                        data-appearance-preset={preset.id}
                        data-preset-kind={preset.kind}
                        onSelect={() => previewPreset(preset.id)}
                      >
                        {preset.label}
                      </DropdownMenuItem>
                    </span>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => savePersonalPreset()} data-appearance-save-preset>
                {appearanceT('savePreset')}
              </Button>
            </div>
            <p>{appearanceT('presetDescription')}</p>
          </section>

          <label className="ec-appearance-name-field">
            <span>{appearanceT('profileName')}</span>
            <Input
              value={resolvedProfile.name}
              maxLength={48}
              data-appearance-profile-name
              onChange={(event) => preview({ ...resolvedProfile, name: event.currentTarget.value })}
            />
          </label>

          <AppearanceSection title={appearanceT('modeGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('tone')}
              values={tones}
              selected={resolvedProfile.tone}
              labels={toneLabels}
              dataGroup="tone"
              onSelect={(tone) => preview({ ...resolvedProfile, tone })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('colorsGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('accent')}
              values={accents}
              selected={resolvedProfile.accent}
              labels={accentLabels}
              dataGroup="accent"
              onSelect={(accent) => preview({ ...resolvedProfile, accent })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('semanticColors')}
              values={semanticColors}
              selected={resolvedProfile.semanticColors}
              labels={semanticColorLabels}
              dataGroup="semantic-colors"
              onSelect={(value) => preview({ ...resolvedProfile, semanticColors: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('contrast')}
              values={contrastPreferences}
              selected={resolvedProfile.contrastPreference}
              labels={contrastLabels}
              dataGroup="contrast"
              onSelect={(value) => preview({ ...resolvedProfile, contrastPreference: value })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('typographyGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('typographyFamily')}
              values={typographyFamilies}
              selected={resolvedProfile.typographyFamily}
              labels={typographyFamilyLabels}
              dataGroup="typography-family"
              onSelect={(value) => preview({ ...resolvedProfile, typographyFamily: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('typographyScale')}
              values={typographyScales}
              selected={resolvedProfile.typographyScale}
              labels={scaleLabels}
              dataGroup="typography-scale"
              onSelect={(value) => preview({ ...resolvedProfile, typographyScale: value })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('iconsGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('iconSize')}
              values={iconSizes}
              selected={resolvedProfile.iconSize}
              labels={scaleLabels}
              dataGroup="icon-size"
              onSelect={(value) => preview({ ...resolvedProfile, iconSize: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('iconStyle')}
              values={iconStyles}
              selected={resolvedProfile.iconStyle}
              labels={iconStyleLabels}
              dataGroup="icon-style"
              onSelect={(value) => preview({ ...resolvedProfile, iconStyle: value })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('shapeGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('radii')}
              values={radii}
              selected={resolvedProfile.radii}
              labels={radiiLabels}
              dataGroup="radii"
              onSelect={(value) => preview({ ...resolvedProfile, radii: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('elevation')}
              values={elevations}
              selected={resolvedProfile.elevation}
              labels={elevationLabels}
              dataGroup="elevation"
              onSelect={(value) => preview({ ...resolvedProfile, elevation: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('buttonShape')}
              values={buttonShapes}
              selected={resolvedProfile.buttonShape}
              labels={buttonShapeLabels}
              dataGroup="button-shape"
              onSelect={(value) => preview({ ...resolvedProfile, buttonShape: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('fieldShape')}
              values={fieldShapes}
              selected={resolvedProfile.fieldShape}
              labels={fieldShapeLabels}
              dataGroup="field-shape"
              onSelect={(value) => preview({ ...resolvedProfile, fieldShape: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('menuAppearance')}
              values={menuAppearances}
              selected={resolvedProfile.menuAppearance}
              labels={menuLabels}
              dataGroup="menu-appearance"
              onSelect={(value) => preview({ ...resolvedProfile, menuAppearance: value })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('densityGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('density')}
              values={densities}
              selected={resolvedProfile.density}
              labels={densityLabels}
              dataGroup="density"
              onSelect={(value) => preview({ ...resolvedProfile, density: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('controlSize')}
              values={controlSizes}
              selected={resolvedProfile.controlSize}
              labels={scaleLabels}
              dataGroup="control-size"
              onSelect={(value) => preview({ ...resolvedProfile, controlSize: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('spacingScale')}
              values={spacingScales}
              selected={resolvedProfile.spacingScale}
              labels={spacingLabels}
              dataGroup="spacing-scale"
              onSelect={(value) => preview({ ...resolvedProfile, spacingScale: value })}
            />
            <AppearanceChoiceGroup
              label={appearanceT('canvasDensity')}
              values={canvasDensities}
              selected={resolvedProfile.canvasDensity}
              labels={canvasLabels}
              dataGroup="canvas-density"
              onSelect={(value) => preview({ ...resolvedProfile, canvasDensity: value })}
            />
          </AppearanceSection>

          <AppearanceSection title={appearanceT('motionGroup')}>
            <AppearanceChoiceGroup
              label={appearanceT('animationIntensity')}
              values={animationIntensities}
              selected={resolvedProfile.animationIntensity}
              labels={animationLabels}
              dataGroup="animation-intensity"
              onSelect={(value) => preview({ ...resolvedProfile, animationIntensity: value })}
            />
            {systemReducedMotion ? (
              <p className="ec-appearance-system-note">{appearanceT('reducedMotionSystem')}</p>
            ) : null}
          </AppearanceSection>

          {accessibilityWarnings.length > 0 ? (
            <div className="ec-appearance-warning" role="alert" data-appearance-accessibility-warning>
              <strong>{appearanceT('accessibilityTitle')}</strong>
              <ul>
                {accessibilityWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={restoreAccessibleDefaults}
                data-appearance-restore-accessible
              >
                {appearanceT('restoreAccessible')}
              </Button>
            </div>
          ) : null}

          <div className="ec-appearance-help" data-appearance-help>
            <strong>{appearanceT('helpTitle')}</strong>
            <p>{appearanceT('helpBody')}</p>
          </div>

          <p
            className="ec-appearance-preview-hint"
            role="status"
            data-appearance-preview-active={hasPreview || undefined}
          >
            {hasPreview ? appearanceT('previewHint') : `${appearanceT('appliedHint')}: ${appliedProfile.name}`}
          </p>

          {pendingCloseDecision ? (
            <div
              className="ec-appearance-close-decision"
              role="alertdialog"
              aria-labelledby="appearance-close-title"
              data-appearance-close-decision
            >
              <strong id="appearance-close-title">{appearanceT('closePendingTitle')}</strong>
              <p>{appearanceT('closePendingDescription')}</p>
              <div>
                <Button size="sm" onClick={applyAndClose} data-appearance-apply-close>
                  {appearanceT('applyAndClose')}
                </Button>
                <Button size="sm" variant="outline" onClick={discardAndClose} data-appearance-discard-close>
                  {appearanceT('discardAndClose')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingCloseDecision(false)}>
                  {appearanceT('keepEditing')}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="ec-appearance-actions">
            <Button type="button" size="sm" onClick={() => apply()} disabled={!hasPreview} data-appearance-apply>
              {appearanceT('apply')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={revert}
              disabled={!hasPreview}
              data-appearance-revert
            >
              {appearanceT('revert')}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={reset} data-appearance-reset>
              {appearanceT('reset')}
            </Button>
          </div>
        </div>

        <Button
          className="ec-appearance-close"
          variant="ghost"
          size="sm"
          aria-label={appearanceT('close')}
          onClick={() => requestOpenChange(false)}
        >
          <CloseIcon aria-hidden="true" />
          {appearanceT('close')}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
