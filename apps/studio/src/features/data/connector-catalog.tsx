import { connectorExtensionRegistry } from '@electrocraft/connectors';
import { createConnectorCatalog, type ConnectorCatalogEntry } from '@electrocraft/data-web';
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@electrocraft/design-system';
import { HelpTrigger } from '../../help/help-ui';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

function gatewayLabel(entry: ConnectorCatalogEntry) {
  if (entry.gateway === 'required') return 'Requiere gateway';
  if (entry.gateway === 'optional') return 'Gateway según credenciales';
  return 'No requiere gateway';
}

function availabilityLabel(entry: ConnectorCatalogEntry) {
  return entry.availability === 'installed' ? 'Instalado' : 'Requiere extensión';
}

export function ConnectorCatalogSheet({
  open,
  onOpenChange,
  onBack,
  onChooseCore,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onBack: () => void;
  readonly onChooseCore: (connectorId: 'rest' | 'graphql') => void;
}) {
  const catalog = createConnectorCatalog(dataSourceWorkspaceRuntime.registry, connectorExtensionRegistry);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px]" data-connector-catalog>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>Más conectores</SheetTitle>
            <HelpTrigger helpId="help.data.connectors" />
          </div>
          <SheetDescription>
            Core conserva contratos y seguridad. Los drivers adicionales se instalan como extensiones y nunca
            guardan secretos dentro del proyecto.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between gap-2 px-4 pb-2">
          <Button size="sm" variant="ghost" onClick={onBack}>
            ← Nueva fuente
          </Button>
          <span className="text-xs text-muted-foreground">Core + extensiones compatibles</span>
        </div>

        <div className="grid gap-3 overflow-y-auto px-4 pb-5" role="list" aria-label="Catálogo de conectores">
          {catalog.map((entry) => {
            const canChooseCore = entry.origin === 'core' && (entry.id === 'rest' || entry.id === 'graphql');
            return (
              <article className="grid gap-3 rounded-lg border p-4" key={entry.adapterId} role="listitem">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{entry.label}</strong>
                      <span className="rounded border px-2 py-0.5 text-[11px] font-medium">
                        {entry.origin === 'core' ? 'Core' : 'Extensión'}
                      </span>
                      <span className="rounded border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {availabilityLabel(entry)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.adapterId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Versión: {entry.version ?? 'No instalada'}</span>
                </div>

                <p className="text-sm text-muted-foreground">{entry.description}</p>

                <div className="grid gap-1 text-xs">
                  <span>
                    <strong>Gateway:</strong> {gatewayLabel(entry)}
                  </span>
                  <span>
                    <strong>Compatibilidad:</strong> {entry.compatibility}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5" aria-label={`Capacidades de ${entry.label}`}>
                  {entry.capabilities.map((capability) => (
                    <span className="rounded bg-muted px-2 py-1 text-[11px]" key={capability}>
                      {capability}
                    </span>
                  ))}
                </div>

                <div className="flex justify-end">
                  {canChooseCore ? (
                    <Button size="sm" onClick={() => onChooseCore(entry.id as 'rest' | 'graphql')}>
                      Usar conector
                    </Button>
                  ) : entry.installHref ? (
                    <Button asChild size="sm">
                      <a href={entry.installHref}>Instalar conector</a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      {entry.origin === 'core' ? 'Incluido en Core' : 'Conector instalado'}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
