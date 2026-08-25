import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import {
  WORKSPACE_LAYOUT_LIMITS,
  type WorkspaceLayoutSnapshot,
  type WorkspacePanelId,
} from '@electrocraft/application';
import { useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { workspacePreferencesRuntime } from './workspace-preferences-runtime';

const DEFAULT_GROUP_ORDER = ['build', 'data', 'logic', 'app', 'resources', 'appearance', 'publish'] as const;
const GROUP_LABELS: Readonly<Record<(typeof DEFAULT_GROUP_ORDER)[number], string>> = Object.freeze({
  build: 'Construcción',
  data: 'Datos',
  logic: 'Lógica',
  app: 'Aplicación',
  resources: 'Recursos',
  appearance: 'Apariencia',
  publish: 'Publicación',
});
const PANEL_LABELS: Readonly<Record<WorkspacePanelId, string>> = Object.freeze({
  context: 'Contexto',
  inspector: 'Inspector',
  status: 'Barra de estado',
});
const PERSISTENCE_LABELS = Object.freeze({
  loading: 'Cargando espacio de trabajo…',
  saving: 'Guardando…',
  ready: 'Guardado',
  error: 'Error al guardar',
});

function workspaceErrorMessage(cause: unknown): string {
  if (!(cause instanceof Error)) return 'No se pudo guardar la configuración del espacio de trabajo.';
  if (cause.message.includes('name is required')) return 'Escribe un nombre para guardar el diseño.';
  if (cause.message.includes('name exceeds')) return 'El nombre del diseño es demasiado largo.';
  if (cause.message.includes('layout limit reached')) return 'Ya alcanzaste el máximo de diseños guardados.';
  if (cause.message.includes('layout not found')) return 'Ese diseño guardado ya no está disponible.';
  return 'No se pudo guardar la configuración del espacio de trabajo.';
}

function normalizedGroupOrder(order: readonly string[]) {
  const known = new Set(DEFAULT_GROUP_ORDER);
  const existing = order.filter((id) => known.has(id as (typeof DEFAULT_GROUP_ORDER)[number]));
  return [...existing, ...DEFAULT_GROUP_ORDER.filter((id) => !existing.includes(id))];
}

function WorkspaceLayoutPreview({ layout }: { readonly layout: WorkspaceLayoutSnapshot }) {
  const visible = new Set(layout.visiblePanels);
  const sidebarLabel = layout.sidebarSide === 'right' ? 'derecha' : 'izquierda';
  const collapsedLabel = layout.sidebarCollapsed ? 'contraído' : 'expandido';

  return (
    <div
      className="ec-workspace-layout-preview"
      role="img"
      aria-label={`Vista previa: panel lateral a la ${sidebarLabel}, ${collapsedLabel}`}
      data-sidebar-side={layout.sidebarSide}
      data-sidebar-collapsed={layout.sidebarCollapsed ? 'true' : 'false'}
      data-context-visible={visible.has('context') ? 'true' : 'false'}
      data-inspector-visible={visible.has('inspector') ? 'true' : 'false'}
      data-status-visible={visible.has('status') ? 'true' : 'false'}
    >
      <span className="ec-workspace-layout-preview-sidebar" aria-hidden="true" />
      <span className="ec-workspace-layout-preview-context" aria-hidden="true" />
      <span className="ec-workspace-layout-preview-canvas" aria-hidden="true" />
      <span className="ec-workspace-layout-preview-inspector" aria-hidden="true" />
      <span className="ec-workspace-layout-preview-status" aria-hidden="true" />
    </div>
  );
}

export function WorkspaceSettings() {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const persistenceState = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getPersistenceState,
    workspacePreferencesRuntime.getPersistenceState,
  );
  const [layoutName, setLayoutName] = useState('');
  const [renameValues, setRenameValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const layout = preferences.layout;
  const groupOrder = normalizedGroupOrder(layout.sidebarGroupOrder);

  async function run(operation: () => Promise<unknown>) {
    setError(null);
    try {
      await operation();
    } catch (cause) {
      setError(workspaceErrorMessage(cause));
    }
  }

  function patchNumber(key: 'sidebarWidth' | 'contextWidth' | 'inspectorWidth', value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    void run(() => workspacePreferencesRuntime.patchLayout({ [key]: parsed }));
  }

  function togglePanel(panel: WorkspacePanelId, checked: boolean) {
    const next = checked
      ? [...new Set([...layout.visiblePanels, panel])]
      : layout.visiblePanels.filter((item) => item !== panel);
    void run(() => workspacePreferencesRuntime.patchLayout({ visiblePanels: next }));
  }

  function moveGroup(groupId: string, direction: -1 | 1) {
    const next = [...groupOrder];
    const index = next.indexOf(groupId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    void run(() => workspacePreferencesRuntime.patchLayout({ sidebarGroupOrder: next }));
  }

  return (
    <section
      className="ec-topbar-settings-section"
      aria-labelledby="workspace-preferences-title"
      data-information-level="primary"
      data-workspace-settings
    >
      <div className="ec-workspace-settings-heading">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="workspace-preferences-title">Espacio de trabajo</h2>
            <HelpTrigger helpId="help.projects" />
          </div>
          <p>
            Personaliza el panel lateral, el editor y los diseños reutilizables. Los cambios se guardan en este
            navegador.
          </p>
        </div>
        <span
          className="ec-workspace-persistence-status"
          data-state={persistenceState}
          role="status"
          aria-live="polite"
        >
          {PERSISTENCE_LABELS[persistenceState]}
        </span>
      </div>

      {error ? (
        <div className="ec-ia-diagnostic-alert" role="alert">
          <strong>No se pudo guardar</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Panel lateral</strong>
          <p>{layout.sidebarCollapsed ? 'Contraído' : 'Expandido'}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void run(() => workspacePreferencesRuntime.patchLayout({ sidebarCollapsed: !layout.sidebarCollapsed }))
          }
        >
          {layout.sidebarCollapsed ? 'Expandir' : 'Contraer'}
        </Button>
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-sidebar-side">
          <strong>Lado del panel</strong>
          <p>Se aplica en escritorio; tablet y móvil conservan su navegación responsive.</p>
        </label>
        <Select
          value={layout.sidebarSide}
          onValueChange={(value) =>
            void run(() => workspacePreferencesRuntime.patchLayout({ sidebarSide: value as 'left' | 'right' }))
          }
        >
          <SelectTrigger id="workspace-sidebar-side" aria-label="Lado del panel lateral">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Izquierda</SelectItem>
            <SelectItem value="right">Derecha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-sidebar-display">
          <strong>Contenido del panel</strong>
          <p>Elige iconos, texto o ambos.</p>
        </label>
        <Select
          value={layout.sidebarDisplay}
          onValueChange={(value) =>
            void run(() =>
              workspacePreferencesRuntime.patchLayout({
                sidebarDisplay: value as 'icons' | 'text' | 'icons+text',
              }),
            )
          }
        >
          <SelectTrigger id="workspace-sidebar-display" aria-label="Contenido del panel lateral">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="icons">Solo iconos</SelectItem>
            <SelectItem value="text">Solo texto</SelectItem>
            <SelectItem value="icons+text">Iconos y texto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-sidebar-width">
          <strong>Ancho del panel</strong>
          <p>
            {WORKSPACE_LAYOUT_LIMITS.sidebar.minSize}–{WORKSPACE_LAYOUT_LIMITS.sidebar.maxSize} px
          </p>
        </label>
        <Input
          id="workspace-sidebar-width"
          type="number"
          min={WORKSPACE_LAYOUT_LIMITS.sidebar.minSize}
          max={WORKSPACE_LAYOUT_LIMITS.sidebar.maxSize}
          value={layout.sidebarWidth}
          onChange={(event) => patchNumber('sidebarWidth', event.target.value)}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-context-width">
          <strong>Ancho de Contexto</strong>
          <p>
            {WORKSPACE_LAYOUT_LIMITS.context.minSize}–{WORKSPACE_LAYOUT_LIMITS.context.maxSize} px
          </p>
        </label>
        <Input
          id="workspace-context-width"
          type="number"
          min={WORKSPACE_LAYOUT_LIMITS.context.minSize}
          max={WORKSPACE_LAYOUT_LIMITS.context.maxSize}
          value={layout.contextWidth}
          onChange={(event) => patchNumber('contextWidth', event.target.value)}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-inspector-width">
          <strong>Ancho del Inspector</strong>
          <p>
            {WORKSPACE_LAYOUT_LIMITS.inspector.minSize}–{WORKSPACE_LAYOUT_LIMITS.inspector.maxSize} px
          </p>
        </label>
        <Input
          id="workspace-inspector-width"
          type="number"
          min={WORKSPACE_LAYOUT_LIMITS.inspector.minSize}
          max={WORKSPACE_LAYOUT_LIMITS.inspector.maxSize}
          value={layout.inspectorWidth}
          onChange={(event) => patchNumber('inspectorWidth', event.target.value)}
        />
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Paneles visibles</strong>
          <p>Define qué zonas auxiliares abre el editor por defecto.</p>
        </div>
        <div aria-label="Paneles visibles">
          {(Object.keys(PANEL_LABELS) as WorkspacePanelId[]).map((panel) => (
            <label key={panel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Checkbox
                checked={layout.visiblePanels.includes(panel)}
                onCheckedChange={(checked) => togglePanel(panel, checked === true)}
              />
              <span>{PANEL_LABELS[panel]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Orden de grupos</strong>
          <p>Reordena las secciones del panel lateral.</p>
        </div>
        <div>
          {groupOrder.map((groupId, index) => (
            <div key={groupId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ minWidth: 84 }}>{GROUP_LABELS[groupId as (typeof DEFAULT_GROUP_ORDER)[number]]}</span>
              <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveGroup(groupId, -1)}>
                Subir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={index === groupOrder.length - 1}
                onClick={() => moveGroup(groupId, 1)}
              >
                Bajar
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="ec-topbar-setting-row">
        <label htmlFor="workspace-layout-name">
          <strong>Guardar diseño</strong>
          <p>Captura el estado actual para reutilizarlo después.</p>
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <Input
            id="workspace-layout-name"
            value={layoutName}
            maxLength={64}
            placeholder="Nombre del diseño"
            onChange={(event) => setLayoutName(event.target.value)}
          />
          <Button
            size="sm"
            onClick={() =>
              void run(async () => {
                await workspacePreferencesRuntime.saveCurrentAs(layoutName);
                setLayoutName('');
              })
            }
          >
            Guardar
          </Button>
        </div>
      </div>

      {preferences.savedLayouts.map((saved) => (
        <div
          className="ec-topbar-setting-row ec-workspace-saved-layout"
          key={saved.id}
          data-workspace-saved-layout={saved.id}
        >
          <div className="ec-workspace-saved-layout-summary">
            <WorkspaceLayoutPreview layout={saved.layout} />
            <div>
              <strong>{saved.name}</strong>
              <p>Actualizado {new Date(saved.updatedAt).toLocaleString('es')}</p>
            </div>
          </div>
          <div className="ec-workspace-saved-layout-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void run(() => workspacePreferencesRuntime.applySavedLayout(saved.id))}
            >
              Aplicar
            </Button>
            <Input
              aria-label={`Nuevo nombre para ${saved.name}`}
              value={renameValues[saved.id] ?? saved.name}
              maxLength={64}
              onChange={(event) => setRenameValues((current) => ({ ...current, [saved.id]: event.target.value }))}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void run(() =>
                  workspacePreferencesRuntime.renameSavedLayout(saved.id, renameValues[saved.id] ?? saved.name),
                )
              }
            >
              Renombrar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void run(() => workspacePreferencesRuntime.deleteSavedLayout(saved.id))}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ))}

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Valores predeterminados</strong>
          <p>Restaura el diseño base sin borrar los diseños guardados.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void run(workspacePreferencesRuntime.restoreDefaults)}>
          Restaurar predeterminado
        </Button>
      </div>
    </section>
  );
}
