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
import type { ElectroCraftLayout, ElectroCraftLength, ElectroCraftStyle } from '@electrocraft/domain';
import { usePuckEditorPresentation } from '@electrocraft/editor-puck';
import { getStudioHelpDescriptor } from '../../../help/help-registry';
import './layout-style-inspector.css';

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
        <TabsList className="ec-presentation-tabs" aria-label="Diseño y estilo">
          <TabsTrigger value="layout">Diseño</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
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
      </Tabs>
      <aside className="ec-presentation-help" data-help-id="help.editor.advanced" aria-label={help.title}>
        <strong>{help.title}</strong>
        <p>{help.summary}</p>
      </aside>
    </div>
  );
}
