import { FrameworkThemeCard } from '@electrocraft/design-system/framework-themes';
import type { StudioAppearancePreset } from '../theme';

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
      {presets.map((preset) => (
        <FrameworkThemeCard
          key={preset.id}
          framework={preset.framework}
          label={preset.label}
          description={preset.description}
          selected={resolvedName === preset.profile.name}
          onSelect={() => onSelect(preset.id)}
        />
      ))}
    </div>
  );
}
