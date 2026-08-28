import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@electrocraft/design-system';
import {
  resetResponsiveStyleOverride,
  resolveResponsiveStyleProperty,
  setResponsiveStyleOverride,
  type ElectroCraftLayout,
  type ElectroCraftLength,
  type ElectroCraftStyle,
} from '@electrocraft/domain';
import { puckResponsiveControls, usePuckEditorPresentation } from '@electrocraft/editor-puck';
import { useSyncExternalStore } from 'react';
import { getStudioHelpDescriptor } from '../../../help/help-registry';
import './layout-style-inspector.css';
import { PlatformStyleInspector } from './platform-style-inspector';

const help = getStudioHelpDescriptor('help.editor.advanced');

const spacingOptions = Object.freeze([
  { value: 'none', label: 'Sin espacio' },
  { value: 'spacing.1', label: 'Espacio 1' },
  { value: 'spacing.2', label: 'Espacio 2' },
  { value: 'spacing.4', label: 'Espacio 4' },
]);

function tokenLength(value: string): ElectroCraftLength | null {
  return value === 'none' ? null : { kind: 'token', token: value };
}

function lengthValue(value: ElectroCraftLength | null): string {
  return value?.kind === 'token' ? value.token : 'none';
}

function LayoutControls({
  layout,
  inherited,
  onChange,
  onReset,
}: {
  readonly layout: ElectroCraftLayout;
  readonly inherited: boolean;
  readonly onChange: (layout: ElectroCraftLayout) => void;
  readonly onReset: () => void;
}) {
  const preset = (mode: 'stack' | 'row' | 'grid', wrap: boolean, columns: number | null) =>
    onChange({ ...layout, mode, wrap, columns });

  return (
    <section className="ec-presentation-group" aria-labelledby="ec-layout-heading">
      <div className="ec-presentation-group-heading">
        <div>
          <h4 id="ec-layout-heading">Disposición</h4>
          <span>{inherited ? 'Heredado de la definición del componente' : 'Anulación del elemento'}</span>
        </div>
        <Button size="sm" variant="ghost" disabled={inherited} onClick={onReset}>
          Restablecer
        </Button>
      </div>

      <div className="ec-layout-presets" role="group" aria-label="Regla de disposición">
        <Button
          variant={layout.mode === 'stack' && !layout.wrap ? 'default' : 'outline'}
          onClick={() => preset('stack', false, null)}
        >
          Columna
        </Button>
        <Button
          variant={layout.mode === 'row' && !layout.wrap ? 'default' : 'outline'}
          onClick={() => preset('row', false, null)}
        >
          Fila
        </Button>
        <Button
          variant={layout.mode === 'grid' ? 'default' : 'outline'}
          onClick={() => preset('grid', false, layout.columns ?? 2)}
        >
          Cuadrícula
        </Button>
        <Button
          variant={layout.mode === 'row' && layout.wrap ? 'default' : 'outline'}
          onClick={() => preset('row', true, null)}
        >
          Envolver
        </Button>
      </div>

      <label className="ec-presentation-field">
        <span>Separación</span>
        <Select
          value={lengthValue(layout.gap)}
          onValueChange={(value) => onChange({ ...layout, gap: tokenLength(value) })}
        >
          <SelectTrigger aria-label="Separación entre elementos">
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

      <label className="ec-presentation-field">
        <span>Alineación</span>
        <Select
          value={layout.align}
          onValueChange={(value) => onChange({ ...layout, align: value as ElectroCraftLayout['align'] })}
        >
          <SelectTrigger aria-label="Alineación">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Inicio</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="end">Final</SelectItem>
            <SelectItem value="stretch">Estirar</SelectItem>
          </SelectContent>
        </Select>
      </label>

      {layout.mode === 'grid' ? (
        <label className="ec-presentation-field">
          <span>Columnas</span>
          <Input
            type="number"
            min={1}
            max={24}
            value={layout.columns ?? 2}
            onChange={(event) =>
              onChange({ ...layout, columns: Math.min(24, Math.max(1, event.currentTarget.valueAsNumber || 1)) })
            }
          />
        </label>
      ) : null}
    </section>
  );
}

function StyleControls({
  style,
  inherited,
  onChange,
  onReset,
}: {
  readonly style: ElectroCraftStyle;
  readonly inherited: boolean;
  readonly onChange: (style: ElectroCraftStyle) => void;
  readonly onReset: () => void;
}) {
  const updateBase = (base: ElectroCraftStyle['base']) => onChange({ ...style, base });

  return (
    <section className="ec-presentation-group" aria-labelledby="ec-style-heading">
      <div className="ec-presentation-group-heading">
        <div>
          <h4 id="ec-style-heading">Estilo</h4>
          <span>{inherited ? 'Heredado de la definición del componente' : 'Anulación del elemento'}</span>
        </div>
        <Button size="sm" variant="ghost" disabled={inherited} onClick={onReset}>
          Restablecer
        </Button>
      </div>

      <label className="ec-presentation-field">
        <span>Relleno</span>
        <Select
          value={lengthValue(style.base.padding)}
          onValueChange={(value) => updateBase({ ...style.base, padding: tokenLength(value) })}
        >
          <SelectTrigger aria-label="Token de relleno">
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

      <label className="ec-presentation-field">
        <span>Fondo</span>
        <Select
          value={style.base.background?.kind === 'token' ? style.base.background.token : 'none'}
          onValueChange={(value) =>
            updateBase({ ...style.base, background: value === 'none' ? null : { kind: 'token', token: value } })
          }
        >
          <SelectTrigger aria-label="Token de fondo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin fondo</SelectItem>
            <SelectItem value="color.surface">Superficie</SelectItem>
            <SelectItem value="color.muted">Atenuado</SelectItem>
            <SelectItem value="color.primary">Primario</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="ec-presentation-field">
        <span>Opacidad</span>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={style.base.opacity ?? 1}
          onChange={(event) =>
            updateBase({ ...style.base, opacity: Math.min(1, Math.max(0, event.currentTarget.valueAsNumber || 0)) })
          }
        />
      </label>
    </section>
  );
}

function ResponsiveControls({
  style,
  onChange,
}: {
  readonly style: ElectroCraftStyle;
  readonly onChange: (style: ElectroCraftStyle) => void;
}) {
  const responsive = useSyncExternalStore(
    puckResponsiveControls.subscribe,
    puckResponsiveControls.getSnapshot,
    puckResponsiveControls.getSnapshot,
  );
  const breakpointId = responsive.currentId;
  const currentBreakpoint = responsive.breakpoints.find((breakpoint) => breakpoint.id === breakpointId);
  const breakpointIds = responsive.breakpoints.map((breakpoint) => breakpoint.id);
  const resolved = resolveResponsiveStyleProperty(
    { base: style.base, overrides: style.responsive },
    breakpointIds,
    breakpointId,
    'width',
  );
  const width = resolved.value;
  const hasOverride = resolved.source.kind === 'override';
  const inheritedId = resolved.source.kind === 'inherited' ? resolved.source.breakpointId : null;
  const source =
    resolved.source.kind === 'base'
      ? 'Base'
      : resolved.source.kind === 'override'
        ? 'Anulado aquí'
        : `Heredado de ${responsive.breakpoints.find((item) => item.id === inheritedId)?.label ?? inheritedId}`;

  const setWidth = (value: ElectroCraftLength | null) => {
    if (breakpointId === null) {
      onChange({ ...style, base: { ...style.base, width: value } });
      return;
    }
    const updated = setResponsiveStyleOverride(
      { base: style.base, overrides: style.responsive },
      breakpointId,
      'width',
      value,
    );
    onChange({ ...style, responsive: updated.overrides });
  };

  const resetWidth = () => {
    if (breakpointId === null) return;
    const updated = resetResponsiveStyleOverride(
      { base: style.base, overrides: style.responsive },
      breakpointId,
      'width',
    );
    onChange({ ...style, responsive: updated.overrides });
  };

  return (
    <section className="ec-presentation-group" aria-labelledby="ec-responsive-heading">
      <div className="ec-presentation-group-heading">
        <div>
          <h4 id="ec-responsive-heading">Responsive</h4>
          <span data-responsive-source={hasOverride ? 'override' : breakpointId ? 'inherited' : 'base'}>{source}</span>
        </div>
        <Button size="sm" variant="ghost" disabled={!hasOverride} onClick={resetWidth}>
          Restablecer
        </Button>
      </div>
      <p>
        {breakpointId === null
          ? 'Selecciona un breakpoint en la barra superior para crear una anulación.'
          : `Editando ${responsive.breakpoints.find((item) => item.id === breakpointId)?.label ?? breakpointId}.`}
      </p>
      <div className="ec-layout-presets" role="group" aria-label="Breakpoints personalizados">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            let suffix = responsive.breakpoints.length + 1;
            while (responsive.breakpoints.some((breakpoint) => breakpoint.id === `custom-${suffix}`)) suffix += 1;
            const id = `custom-${suffix}`;
            puckResponsiveControls.addCustom({
              id,
              label: `Personalizado ${suffix}`,
              width: 1200,
              height: 800,
              orientation: 'landscape',
            });
          }}
        >
          Crear breakpoint
        </Button>
      </div>
      {currentBreakpoint?.custom ? (
        <div className="ec-presentation-group" aria-label="Editar breakpoint personalizado">
          <label className="ec-presentation-field">
            <span>Identificador estable</span>
            <Input
              key={`${currentBreakpoint.id}-id`}
              defaultValue={currentBreakpoint.id}
              onBlur={(event) =>
                puckResponsiveControls.updateCustom(currentBreakpoint.id, { id: event.currentTarget.value })
              }
            />
          </label>
          <label className="ec-presentation-field">
            <span>Nombre</span>
            <Input
              key={`${currentBreakpoint.id}-label`}
              defaultValue={currentBreakpoint.label}
              onBlur={(event) =>
                puckResponsiveControls.updateCustom(currentBreakpoint.id, { label: event.currentTarget.value })
              }
            />
          </label>
          <label className="ec-presentation-field">
            <span>Ancho del viewport</span>
            <Input
              type="number"
              min={240}
              max={7680}
              value={currentBreakpoint.width}
              onChange={(event) =>
                puckResponsiveControls.updateCustom(currentBreakpoint.id, { width: event.currentTarget.valueAsNumber })
              }
            />
          </label>
        </div>
      ) : null}
      <label className="ec-presentation-field">
        <span>Ancho</span>
        <Input
          type="number"
          min={0}
          value={width?.kind === 'value' && width.unit === 'px' ? width.value : ''}
          placeholder="Automático"
          onChange={(event) =>
            setWidth(
              event.currentTarget.value === ''
                ? null
                : { kind: 'value', value: event.currentTarget.valueAsNumber, unit: 'px' },
            )
          }
        />
      </label>
      {breakpointId !== null && !hasOverride ? (
        <Button variant="outline" size="sm" onClick={() => setWidth(style.base.width)}>
          Anular aquí
        </Button>
      ) : null}
    </section>
  );
}

export function LayoutStyleInspector() {
  const presentation = usePuckEditorPresentation();

  if (presentation.status !== 'ready') {
    return (
      <p className={`ec-presentation-state ec-presentation-state--${presentation.status}`}>{presentation.message}</p>
    );
  }

  return (
    <div className="ec-presentation-inspector" data-puck-layout-style-inspector>
      <Tabs defaultValue="layout">
        <TabsList className="ec-presentation-tabs" aria-label="Diseño, estilo, responsive y plataforma">
          <TabsTrigger value="layout">Diseño</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="platform">Plataforma</TabsTrigger>
        </TabsList>
        <TabsContent value="layout">
          <LayoutControls
            layout={presentation.layout}
            inherited={presentation.layoutInherited}
            onChange={presentation.setLayout}
            onReset={presentation.resetLayout}
          />
        </TabsContent>
        <TabsContent value="style">
          <StyleControls
            style={presentation.style}
            inherited={presentation.styleInherited}
            onChange={presentation.setStyle}
            onReset={presentation.resetStyle}
          />
        </TabsContent>
        <TabsContent value="responsive">
          <ResponsiveControls style={presentation.style} onChange={presentation.setStyle} />
        </TabsContent>
        <TabsContent value="platform">
          <PlatformStyleInspector
            componentType={presentation.componentType}
            style={presentation.style}
            onChange={presentation.setStyle}
          />
        </TabsContent>
      </Tabs>
      <aside className="ec-presentation-help" data-help-id="help.editor.advanced" aria-label={help.title}>
        <strong>{help.title}</strong>
        <p>{help.summary}</p>
      </aside>
    </div>
  );
}
