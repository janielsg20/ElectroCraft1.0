import { Button, getStudioIcon } from '@electrocraft/design-system';
import { FrameworkThemeCard } from '@electrocraft/design-system/framework-themes';
import { MARKET_APPEARANCE_DESCRIPTOR_BY_ID } from '../market-appearance-presets';
import type { StudioAppearancePreset } from '../theme';

const EditorIcon = getStudioIcon('studio.sidebar.editor');
const ComponentsIcon = getStudioIcon('studio.sidebar.components');
const SettingsIcon = getStudioIcon('studio.settings');

function MarketStyleCard({
  preset,
  selected,
  onSelect,
}: {
  readonly preset: StudioAppearancePreset;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  const descriptor = MARKET_APPEARANCE_DESCRIPTOR_BY_ID.get(preset.id);
  if (!descriptor) return null;

  return (
    <article
      className="ec-market-style-card"
      data-market-style={descriptor.layout}
      data-state={selected ? 'selected' : 'idle'}
    >
      <div className="ec-market-style-preview" aria-hidden="true">
        <div className="ec-market-style-mini-sidebar">
          <EditorIcon />
          <ComponentsIcon />
          <SettingsIcon />
        </div>
        <div className="ec-market-style-mini-main">
          <div className="ec-market-style-mini-topbar">
            <span />
            <span />
            <span />
          </div>
          <div className="ec-market-style-mini-workspace">
            <span className="ec-market-style-mini-panel" />
            <span className="ec-market-style-mini-canvas" />
            <span className="ec-market-style-mini-inspector" />
          </div>
        </div>
      </div>

      <div className="ec-market-style-copy">
        <div className="ec-market-style-heading">
          <strong>{preset.label}</strong>
          <span>{descriptor.family}</span>
        </div>
        <small>{descriptor.inspiration}</small>
        <p>{descriptor.signature}</p>
      </div>

      <Button
        type="button"
        size="sm"
        variant={selected ? 'secondary' : 'outline'}
        aria-label={`Previsualizar diseño ${preset.label}`}
        aria-pressed={selected}
        data-market-style-select={preset.id}
        onClick={onSelect}
      >
        {selected ? 'En vista previa' : 'Vista previa'}
      </Button>
    </article>
  );
}

export function AppearanceFrameworkGallery({
  presets,
  resolvedName,
  onSelect,
}: {
  readonly presets: readonly StudioAppearancePreset[];
  readonly resolvedName: string;
  readonly onSelect: (presetId: string) => void;
}) {
  return (
    <div className="ec-appearance-framework-grid" data-theme-framework-gallery>
      {presets.map((preset) => {
        const selected = resolvedName === preset.profile.name;
        return MARKET_APPEARANCE_DESCRIPTOR_BY_ID.has(preset.id) ? (
          <MarketStyleCard key={preset.id} preset={preset} selected={selected} onSelect={() => onSelect(preset.id)} />
        ) : (
          <FrameworkThemeCard
            key={preset.id}
            framework={preset.framework}
            label={preset.label}
            description={preset.description}
            selected={selected}
            onSelect={() => onSelect(preset.id)}
          />
        );
      })}
    </div>
  );
}
