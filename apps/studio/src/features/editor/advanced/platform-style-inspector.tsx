import {
  Button,
  Input,
  PlatformBadge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import {
  electroCraftRegistryDefinitionSchema,
  electroPlatformCapabilityDefinitionSchema,
  resetPlatformStyleOverride,
  resolveDeclaredPlatformCapabilities,
  resolvePlatformStyleProperty,
  resolveResponsiveStyleDeclaration,
  setPlatformStyleOverride,
  summarizeDeclaredPlatformCapabilities,
  type ElectroCraftDeclaredPlatformCapability,
  type ElectroCraftEditorPlatform,
  type ElectroCraftLength,
  type ElectroCraftPlatformValueSource,
  type ElectroCraftStyle,
  type ElectroCraftStyleDeclaration,
} from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_CAPABILITY_DEFINITIONS_METADATA,
  ELECTROCRAFT_PUCK_REGISTRY_DEFINITION_METADATA,
  puckPlatformControls,
  puckResponsiveControls,
  usePuckEditorConfig,
} from '@electrocraft/editor-puck';
import { useSyncExternalStore } from 'react';

const platformLabels: Readonly<Record<ElectroCraftEditorPlatform, string>> = Object.freeze({
  web: 'Web',
  android: 'Android',
  ios: 'iOS',
});
const platforms = Object.freeze(['web', 'android', 'ios'] as const);
const spacingOptions = Object.freeze([
  { value: 'none', label: 'Sin espacio' },
  { value: 'spacing.1', label: 'Espacio 1' },
  { value: 'spacing.2', label: 'Espacio 2' },
  { value: 'spacing.4', label: 'Espacio 4' },
]);

type PlatformProperty = 'width' | 'padding' | 'opacity';

function tokenLength(value: string): ElectroCraftLength | null {
  return value === 'none' ? null : { kind: 'token', token: value };
}

function lengthValue(value: ElectroCraftLength | null): string {
  return value?.kind === 'token' ? value.token : 'none';
}

function readCapabilityRegistry(config: ReturnType<typeof usePuckEditorConfig>, componentType: string) {
  const metadata = config.components[componentType]?.metadata;
  const record = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
  const registry = electroCraftRegistryDefinitionSchema.safeParse(record[ELECTROCRAFT_PUCK_REGISTRY_DEFINITION_METADATA]);
  const rawCapabilities = record[ELECTROCRAFT_PUCK_CAPABILITY_DEFINITIONS_METADATA];
  const capabilities = Array.isArray(rawCapabilities)
    ? rawCapabilities.flatMap((value) => {
        const parsed = electroPlatformCapabilityDefinitionSchema.safeParse(value);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
  return { registry: registry.success ? registry.data : null, capabilities };
}

function capabilityTone(capabilities: readonly ElectroCraftDeclaredPlatformCapability[]) {
  return summarizeDeclaredPlatformCapabilities(capabilities) ?? 'neutral';
}

function sourceLabel(source: ElectroCraftPlatformValueSource, platform: ElectroCraftEditorPlatform) {
  if (source.kind === 'platform') return `Anulado en ${platformLabels[platform]}`;
  if (source.kind === 'native') return 'Heredado de Nativo';
  return 'Heredado de Responsive';
}

function PropertyBadges({
  property,
  style,
  responsiveDeclaration,
  capabilitiesFor,
}: {
  readonly property: PlatformProperty;
  readonly style: ElectroCraftStyle;
  readonly responsiveDeclaration: ElectroCraftStyleDeclaration;
  readonly capabilitiesFor: (platform: ElectroCraftEditorPlatform) => readonly ElectroCraftDeclaredPlatformCapability[];
}) {
  return (
    <div className="ec-platform-property-badges" aria-label={`Soporte por plataforma para ${property}`}>
      {platforms.map((platform) => {
        const source = resolvePlatformStyleProperty(style, responsiveDeclaration, platform, property).source;
        const tone = source.kind === 'platform' ? 'override' : capabilityTone(capabilitiesFor(platform));
        return (
          <PlatformBadge
            key={platform}
            label={platformLabels[platform]}
            tone={tone}
            title={`${platformLabels[platform]} · ${sourceLabel(source, platform)}`}
          />
        );
      })}
    </div>
  );
}

export function PlatformStyleInspector({
  componentType,
  style,
  onChange,
}: {
  readonly componentType: string;
  readonly style: ElectroCraftStyle;
  readonly onChange: (style: ElectroCraftStyle) => void;
}) {
  const config = usePuckEditorConfig();
  const platform = useSyncExternalStore(
    puckPlatformControls.subscribe,
    puckPlatformControls.getSnapshot,
    puckPlatformControls.getSnapshot,
  );
  const responsive = useSyncExternalStore(
    puckResponsiveControls.subscribe,
    puckResponsiveControls.getSnapshot,
    puckResponsiveControls.getSnapshot,
  );
  const registry = readCapabilityRegistry(config, componentType);
  const breakpointIds = responsive.breakpoints.map((breakpoint) => breakpoint.id);
  const responsiveDeclaration = resolveResponsiveStyleDeclaration(
    { base: style.base, overrides: style.responsive },
    breakpointIds,
    responsive.currentId,
  );
  const capabilitiesFor = (targetPlatform: ElectroCraftEditorPlatform) =>
    resolveDeclaredPlatformCapabilities(registry.registry, registry.capabilities, targetPlatform);
  const currentCapabilities = capabilitiesFor(platform.current);
  const currentCapabilityTone = capabilityTone(currentCapabilities);

  const updateProperty = <K extends PlatformProperty>(property: K, value: ElectroCraftStyleDeclaration[K]) =>
    onChange(setPlatformStyleOverride(style, platform.current, property, value));
  const resetProperty = (property: PlatformProperty) =>
    onChange(resetPlatformStyleOverride(style, platform.current, property));

  const width = resolvePlatformStyleProperty(style, responsiveDeclaration, platform.current, 'width');
  const padding = resolvePlatformStyleProperty(style, responsiveDeclaration, platform.current, 'padding');
  const opacity = resolvePlatformStyleProperty(style, responsiveDeclaration, platform.current, 'opacity');

  return (
    <section className="ec-presentation-group" aria-labelledby="ec-platform-heading" data-platform-inspector>
      <div className="ec-presentation-group-heading">
        <div>
          <h4 id="ec-platform-heading">Plataforma</h4>
          <span>Override portable para {platformLabels[platform.current]}</span>
        </div>
        <PlatformBadge label={platformLabels[platform.current]} tone={currentCapabilityTone} />
      </div>

      {currentCapabilities.length === 0 ? (
        <div className="ec-platform-diagnostic" role="status" data-platform-diagnostic="empty">
          Este componente no declara capacidades de plataforma en el registry activo.
        </div>
      ) : (
        <div
          className="ec-platform-diagnostic"
          role={currentCapabilityTone === 'blocked' ? 'alert' : 'status'}
          data-platform-diagnostic={currentCapabilityTone}
        >
          {currentCapabilities.map((capability) => (
            <div key={capability.capabilityId}>
              <strong>
                {capability.label} · v{capability.version ?? '?'}
              </strong>
              <span>
                {capability.mode === 'supported'
                  ? 'Soporte directo.'
                  : capability.mode === 'adapted'
                    ? `Adaptado${capability.adapter ? ` mediante ${capability.adapter}` : ''}.`
                    : 'No soportado en este target.'}
              </span>
              {capability.reason ? <span>{capability.reason}</span> : null}
            </div>
          ))}
        </div>
      )}

      <div className="ec-platform-property" data-platform-property="width">
        <div className="ec-platform-property-heading">
          <div>
            <strong>Ancho</strong>
            <span>{sourceLabel(width.source, platform.current)}</span>
          </div>
          <PropertyBadges
            property="width"
            style={style}
            responsiveDeclaration={responsiveDeclaration}
            capabilitiesFor={capabilitiesFor}
          />
        </div>
        <label className="ec-presentation-field">
          <span>Ancho en píxeles</span>
          <Input
            type="number"
            min={0}
            value={width.value?.kind === 'value' && width.value.unit === 'px' ? width.value.value : ''}
            placeholder="Automático"
            onChange={(event) =>
              updateProperty(
                'width',
                event.currentTarget.value === ''
                  ? null
                  : { kind: 'value', value: event.currentTarget.valueAsNumber, unit: 'px' },
              )
            }
          />
        </label>
        <div className="ec-platform-property-actions">
          {width.source.kind !== 'platform' ? (
            <Button variant="outline" size="sm" onClick={() => updateProperty('width', width.value)}>
              Anular
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => resetProperty('width')}>
              Restablecer
            </Button>
          )}
        </div>
      </div>

      <div className="ec-platform-property" data-platform-property="padding">
        <div className="ec-platform-property-heading">
          <div>
            <strong>Relleno</strong>
            <span>{sourceLabel(padding.source, platform.current)}</span>
          </div>
          <PropertyBadges
            property="padding"
            style={style}
            responsiveDeclaration={responsiveDeclaration}
            capabilitiesFor={capabilitiesFor}
          />
        </div>
        <label className="ec-presentation-field">
          <span>Token de relleno</span>
          <Select
            value={lengthValue(padding.value)}
            onValueChange={(value) => updateProperty('padding', tokenLength(value))}
          >
            <SelectTrigger aria-label={`Relleno para ${platformLabels[platform.current]}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {spacingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="ec-platform-property-actions">
          {padding.source.kind !== 'platform' ? (
            <Button variant="outline" size="sm" onClick={() => updateProperty('padding', padding.value)}>
              Anular
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => resetProperty('padding')}>
              Restablecer
            </Button>
          )}
        </div>
      </div>

      <div className="ec-platform-property" data-platform-property="opacity">
        <div className="ec-platform-property-heading">
          <div>
            <strong>Opacidad</strong>
            <span>{sourceLabel(opacity.source, platform.current)}</span>
          </div>
          <PropertyBadges
            property="opacity"
            style={style}
            responsiveDeclaration={responsiveDeclaration}
            capabilitiesFor={capabilitiesFor}
          />
        </div>
        <label className="ec-presentation-field">
          <span>Opacidad</span>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={opacity.value ?? 1}
            onChange={(event) =>
              updateProperty('opacity', Math.min(1, Math.max(0, event.currentTarget.valueAsNumber || 0)))
            }
          />
        </label>
        <div className="ec-platform-property-actions">
          {opacity.source.kind !== 'platform' ? (
            <Button variant="outline" size="sm" onClick={() => updateProperty('opacity', opacity.value)}>
              Anular
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => resetProperty('opacity')}>
              Restablecer
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
