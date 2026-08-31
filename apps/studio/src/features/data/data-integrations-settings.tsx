import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import type { ElectroCraftSecretBinding, ElectroCraftSecretEnvironment } from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { dataIntegrationsRuntime } from './data-integrations-runtime';

function bindingFor(kind: 'bearer' | 'header', headerName: string): ElectroCraftSecretBinding {
  if (kind === 'bearer') return { kind: 'bearer', headerName: 'Authorization', scheme: 'Bearer' };
  return { kind: 'header', headerName: headerName.trim() || 'X-Api-Key', prefix: '' };
}

export function DataIntegrationsSettings() {
  const integrations = useSyncExternalStore(
    dataIntegrationsRuntime.subscribe,
    dataIntegrationsRuntime.getSnapshot,
    dataIntegrationsRuntime.getSnapshot,
  );
  const [environment, setEnvironment] = useState<ElectroCraftSecretEnvironment>('development');
  const [selectedRefId, setSelectedRefId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [bindingKind, setBindingKind] = useState<'bearer' | 'header'>('bearer');
  const [headerName, setHeaderName] = useState('X-Api-Key');
  const [secretValue, setSecretValue] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void dataIntegrationsRuntime.load();
  }, []);

  const selectedRef = useMemo(
    () => integrations.refs.find(({ id }) => id === selectedRefId) ?? integrations.refs[0] ?? null,
    [integrations.refs, selectedRefId],
  );
  const status = selectedRef ? dataIntegrationsRuntime.secretStatus(selectedRef.id, environment) : null;

  useEffect(() => {
    if (!selectedRef || !selectedRef.environmentScope.includes(environment)) return;
    void dataIntegrationsRuntime.refreshSecretStatus(selectedRef, environment).catch(() => undefined);
  }, [environment, selectedRef]);

  const gatewayConfigured = integrations.gateway.configured;
  const saving = busy || integrations.state === 'saving';

  return (
    <section
      className="ec-topbar-settings-section"
      aria-labelledby="data-integrations-settings-title"
      data-information-level="primary"
      data-settings-destination="integrations"
      data-help-id="help.data.secrets"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="data-integrations-settings-title">Gateway de conectores</h2>
          <p>Secretos y conexiones server-side. Los valores nunca se vuelven a mostrar completos.</p>
        </div>
        <span className="ec-ia-setting-detail-value" data-gateway-configured={gatewayConfigured ? 'true' : 'false'}>
          {gatewayConfigured ? 'Configurado' : 'Falta configuración'}
        </span>
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Estado Gateway</strong>
          <p role="status" aria-live="polite">{integrations.gateway.message}</p>
        </div>
        <Button variant="outline" size="sm" disabled={!gatewayConfigured || saving} onClick={() => void dataIntegrationsRuntime.load()}>
          Probar conexión
        </Button>
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Entorno</strong>
          <p>Selecciona dónde comprobar o reemplazar el valor.</p>
        </div>
        <Select value={environment} onValueChange={(value) => setEnvironment(value as ElectroCraftSecretEnvironment)}>
          <SelectTrigger aria-label="Entorno de secretos">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">Desarrollo</SelectItem>
            <SelectItem value="production">Producción</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ec-topbar-setting-row">
        <div>
          <strong>Secretos</strong>
          <p>{integrations.refs.length === 0 ? 'No hay referencias todavía.' : `${integrations.refs.length} referencia(s) disponible(s).`}</p>
        </div>
        <Select value={selectedRef?.id ?? ''} onValueChange={setSelectedRefId} disabled={integrations.refs.length === 0}>
          <SelectTrigger aria-label="Referencia de secreto">
            <SelectValue placeholder="Seleccionar secreto" />
          </SelectTrigger>
          <SelectContent>
            {integrations.refs.map((ref) => (
              <SelectItem key={ref.id} value={ref.id}>{ref.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRef ? (
        <div className="ec-ia-setting-detail" data-secret-ref={selectedRef.id}>
          <div className="ec-ia-setting-detail-row">
            <strong>{selectedRef.label}</strong>
            <span className="ec-ia-setting-detail-value">
              {selectedRef.environmentScope.includes(environment)
                ? status?.configured
                  ? 'Configurado'
                  : 'Falta configuración'
                : 'No habilitado'}
            </span>
          </div>
          <p>Ref: {selectedRef.key}. El valor almacenado no tiene operación de lectura en esta pantalla.</p>
          <label className="grid gap-1">
            <span>Nuevo valor</span>
            <Input
              type="password"
              autoComplete="new-password"
              value={secretValue}
              disabled={!gatewayConfigured || !selectedRef.environmentScope.includes(environment) || saving}
              onChange={(event) => setSecretValue(event.target.value)}
              placeholder="Reemplazar sin read-back"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!gatewayConfigured || !status?.configured || saving}
              onClick={() => {
                setBusy(true);
                void dataIntegrationsRuntime
                  .removeSecret(selectedRef, environment)
                  .finally(() => setBusy(false));
              }}
            >
              Eliminar valor
            </Button>
            <Button
              size="sm"
              disabled={!gatewayConfigured || !secretValue.trim() || saving || !selectedRef.environmentScope.includes(environment)}
              onClick={() => {
                const value = secretValue;
                setSecretValue('');
                setBusy(true);
                void dataIntegrationsRuntime
                  .replaceSecret(selectedRef, environment, value)
                  .finally(() => setBusy(false));
              }}
            >
              {status?.configured ? 'Reemplazar secreto' : 'Crear secreto'}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="ec-ia-setting-detail" data-secret-ref-create>
        <strong>Nueva referencia</strong>
        <p>Se guarda únicamente nombre, binding y scope. El valor se envía al Gateway después.</p>
        <label className="grid gap-1">
          <span>Nombre</span>
          <Input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="API de productos" />
        </label>
        <label className="grid gap-1">
          <span>Clave portable</span>
          <Input value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="PRODUCTS_API" />
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={bindingKind} onValueChange={(value) => setBindingKind(value as 'bearer' | 'header')}>
            <SelectTrigger aria-label="Tipo de autenticación del secreto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bearer">Bearer token</SelectItem>
              <SelectItem value="header">Header API key</SelectItem>
            </SelectContent>
          </Select>
          {bindingKind === 'header' ? (
            <Input value={headerName} onChange={(event) => setHeaderName(event.target.value)} aria-label="Nombre del header" />
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!newLabel.trim() || saving}
          onClick={() => {
            setBusy(true);
            void dataIntegrationsRuntime
              .createRef({
                label: newLabel,
                key: newKey,
                environmentScope: ['development', 'production'],
                binding: bindingFor(bindingKind, headerName),
              })
              .then((ref) => {
                setSelectedRefId(ref.id);
                setNewLabel('');
                setNewKey('');
              })
              .finally(() => setBusy(false));
          }}
        >
          Crear referencia
        </Button>
      </div>

      <p role={integrations.state === 'error' ? 'alert' : 'status'} aria-live="polite">{integrations.message}</p>
    </section>
  );
}
