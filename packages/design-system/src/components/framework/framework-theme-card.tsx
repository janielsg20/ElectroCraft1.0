import { Switch as ArkSwitch } from '@ark-ui/react/switch';
import { Button as BaseButton } from '@base-ui/react/button';
import { Button as HeadlessButton } from '@headlessui/react';
import { Button as HeroButton } from '@heroui/react/button';
import { Button } from '../ui/button';
import { AceternitySpotlight } from './aceternity-spotlight';
import { MagicAnimatedGrid } from './magic-animated-grid';

export type FrameworkThemeId = 'electrocraft' | 'aceternity-magic' | 'daisyui' | 'headlessui' | 'ark-base' | 'heroui';

export interface FrameworkThemeCardProps {
  readonly framework: FrameworkThemeId;
  readonly label: string;
  readonly description: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

function ThemeCardBody({ label, description }: Pick<FrameworkThemeCardProps, 'label' | 'description'>) {
  return (
    <span className="ec-framework-theme-copy">
      <strong>{label}</strong>
      <small>{description}</small>
    </span>
  );
}

export function FrameworkThemeCard({ framework, label, description, selected, onSelect }: FrameworkThemeCardProps) {
  const state = selected ? 'selected' : 'idle';
  const ariaLabel = `Previsualizar tema ${label}`;

  return (
    <article
      className={`ec-framework-theme-card${framework === 'daisyui' ? ' ec-daisy-scope' : ''}`}
      data-framework-theme={framework}
      data-state={state}
    >
      {framework === 'aceternity-magic' ? (
        <>
          <AceternitySpotlight />
          <MagicAnimatedGrid />
        </>
      ) : null}
      <div className="ec-framework-theme-visual" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <ThemeCardBody label={label} description={description} />

      {framework === 'daisyui' ? (
        <button type="button" className="d-btn d-btn-xs ec-framework-apply" aria-label={ariaLabel} onClick={onSelect}>
          Vista previa
        </button>
      ) : framework === 'headlessui' ? (
        <HeadlessButton className="ec-framework-apply" aria-label={ariaLabel} onClick={onSelect}>
          Vista previa
        </HeadlessButton>
      ) : framework === 'ark-base' ? (
        <div className="ec-framework-ark-actions">
          <ArkSwitch.Root checked={selected} disabled aria-label={`Estado del tema ${label}`}>
            <ArkSwitch.HiddenInput />
            <ArkSwitch.Control className="ec-framework-ark-switch">
              <ArkSwitch.Thumb />
            </ArkSwitch.Control>
          </ArkSwitch.Root>
          <BaseButton className="ec-framework-apply" aria-label={ariaLabel} onClick={onSelect}>
            Vista previa
          </BaseButton>
        </div>
      ) : framework === 'heroui' ? (
        <HeroButton size="sm" variant={selected ? 'primary' : 'secondary'} aria-label={ariaLabel} onPress={onSelect}>
          Vista previa
        </HeroButton>
      ) : (
        <Button size="sm" variant={selected ? 'secondary' : 'outline'} aria-label={ariaLabel} onClick={onSelect}>
          Vista previa
        </Button>
      )}
    </article>
  );
}
