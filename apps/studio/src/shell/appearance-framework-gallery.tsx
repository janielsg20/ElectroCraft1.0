import { Button, getStudioIcon } from '@electrocraft/design-system';
import { FrameworkThemeCard } from '@electrocraft/design-system/framework-themes';
import { useState } from 'react';
import { MARKET_APPEARANCE_DESCRIPTOR_BY_ID, type MarketAppearanceDescriptor } from '../market-appearance-presets';
import type { StudioAppearancePreset } from '../theme';
import { useStudioAppearance } from '../theme-provider';

const EditorIcon = getStudioIcon('studio.sidebar.editor');
const ComponentsIcon = getStudioIcon('studio.sidebar.components');
const SettingsIcon = getStudioIcon('studio.settings');

type MarketFamilyFilter = 'Todos' | MarketAppearanceDescriptor['family'];

const familyFilters: readonly MarketFamilyFilter[] = ['Todos', 'IDE', 'Builder', 'CMS', 'Admin', 'Data', 'Minimal'];

function MarketStyleCard({
  preset,
  descriptor,
  selected,
  onSelect,
}: {
  readonly preset: StudioAppearancePreset;
  readonly descriptor: MarketAppearanceDescriptor;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <article
      className="ec-market-style-card"
      data-market-style={descriptor.layout}
      data-state={selected ? 'selected' : 'idle'}
      data-market-preset={preset.id}
    >
      <div className="ec-market-style-preview" aria-hidden="true">
        <div className="ec-market-style-mini-sidebar">
          <span className="ec-market-style-mini-brand" />
          <EditorIcon />
          <ComponentsIcon />
          <SettingsIcon />
        </div>
        <div className="ec-market-style-mini-main">
          <div className="ec-market-style-mini-topbar">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="ec-market-style-mini-workspace">
            <span className="ec-market-style-mini-panel" />
            <span className="ec-market-style-mini-canvas">
              <b />
              <b />
            </span>
            <span className="ec-market-style-mini-inspector" />
          </div>
          <div className="ec-market-style-mini-statusbar">
            <span />
            <i />
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
        <div className="ec-market-style-traits" aria-label={`Rasgos de ${preset.label}`}>
          {descriptor.traits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <p className="ec-market-style-recommended">
          <strong>Ideal para:</strong> {descriptor.recommendedFor}
        </p>
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
        {selected ? 'Diseño base activo' : 'Probar diseño'}
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
  const { resolvedProfile } = useStudioAppearance();
  const resolvedProductDesign = resolvedProfile.productDesign ?? 'custom';
  const [family, setFamily] = useState<MarketFamilyFilter>('Todos');
  const marketPresets = presets.flatMap((preset) => {
    const descriptor = MARKET_APPEARANCE_DESCRIPTOR_BY_ID.get(preset.id);
    return descriptor ? [{ preset, descriptor }] : [];
  });
  const frameworkPresets = presets.filter((preset) => !MARKET_APPEARANCE_DESCRIPTOR_BY_ID.has(preset.id));
  const filteredMarketPresets = marketPresets.filter(
    ({ descriptor }) => family === 'Todos' || descriptor.family === family,
  );

  return (
    <div className="ec-appearance-design-gallery" data-theme-framework-gallery>
      <section className="ec-appearance-market-section" aria-labelledby="appearance-product-designs-title">
        <div className="ec-appearance-gallery-heading">
          <div>
            <h4 id="appearance-product-designs-title">Diseños de producto</h4>
            <p>Layouts completos inspirados en IDEs, builders, CMS y herramientas de administración.</p>
          </div>
          <span>{marketPresets.length}</span>
        </div>

        <div className="ec-market-family-filters" aria-label="Filtrar diseños por familia">
          {familyFilters.map((candidate) => (
            <Button
              key={candidate}
              type="button"
              size="sm"
              variant={family === candidate ? 'secondary' : 'ghost'}
              aria-pressed={family === candidate}
              data-market-family-filter={candidate}
              onClick={() => setFamily(candidate)}
            >
              {candidate}
            </Button>
          ))}
        </div>

        <div className="ec-appearance-market-grid" data-market-style-gallery>
          {filteredMarketPresets.map(({ preset, descriptor }) => (
            <MarketStyleCard
              key={preset.id}
              preset={preset}
              descriptor={descriptor}
              selected={resolvedProductDesign === preset.id}
              onSelect={() => onSelect(preset.id)}
            />
          ))}
        </div>
      </section>

      <section className="ec-appearance-framework-section" aria-labelledby="appearance-framework-themes-title">
        <div className="ec-appearance-gallery-heading">
          <div>
            <h4 id="appearance-framework-themes-title">Temas por framework</h4>
            <p>Variantes visuales base para personalizar después color, forma, tipografía y densidad.</p>
          </div>
          <span>{frameworkPresets.length}</span>
        </div>
        <div className="ec-appearance-framework-grid">
          {frameworkPresets.map((preset) => (
            <FrameworkThemeCard
              key={preset.id}
              framework={preset.framework}
              label={preset.label}
              description={preset.description}
              selected={resolvedName === preset.profile.name && resolvedProductDesign === 'custom'}
              onSelect={() => onSelect(preset.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
