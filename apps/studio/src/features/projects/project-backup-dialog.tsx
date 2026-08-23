import type {
  ProjectBackupImpactSummary,
  ProjectBackupImportResult,
  ProjectBackupImportStrategy,
  ProjectBackupPackage,
  ProjectSummary,
} from '@electrocraft/application';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Loader,
  RadioGroup,
  RadioGroupItem,
} from '@electrocraft/design-system';
import { useId, useState } from 'react';
import { projectStorageRuntime } from './project-storage-runtime';
import './project-backup-dialog.css';

function portableCopyId() {
  return globalThis.crypto?.randomUUID?.() ?? `import-${Date.now()}`;
}

function safeBackupFilename(project: ProjectSummary) {
  const base = project.name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${base || 'electrocraft-project'}-${new Date().toISOString().slice(0, 10)}.electrocraft.json`;
}

export async function downloadProjectBackup(project: ProjectSummary) {
  const pkg = await projectStorageRuntime.createBackup(project.id);
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeBackupFilename(project);
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return pkg;
}

export interface ProjectBackupDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode?: 'import' | 'restore';
  readonly restoreProject?: ProjectSummary | null;
  readonly onImported?: (result: ProjectBackupImportResult) => void | Promise<void>;
}

export function ProjectBackupDialog({
  open,
  onOpenChange,
  mode = 'import',
  restoreProject = null,
  onImported,
}: ProjectBackupDialogProps) {
  const fileInputId = useId();
  const copyNameId = useId();
  const [pkg, setPackage] = useState<ProjectBackupPackage | null>(null);
  const [impact, setImpact] = useState<ProjectBackupImpactSummary | null>(null);
  const [strategy, setStrategy] = useState<ProjectBackupImportStrategy>('reject');
  const [copyProjectId, setCopyProjectId] = useState('');
  const [copyName, setCopyName] = useState('');
  const [state, setState] = useState<'idle' | 'validating' | 'ready' | 'importing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Selecciona una copia de seguridad de ElectroCraft.');

  function reset() {
    setPackage(null);
    setImpact(null);
    setStrategy('reject');
    setCopyProjectId('');
    setCopyName('');
    setState('idle');
    setMessage('Selecciona una copia de seguridad de ElectroCraft.');
  }

  async function validateFile(file: File) {
    setState('validating');
    setMessage('Validando formato, versión y checksums…');
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const validated = projectStorageRuntime.validateBackup(parsed);
      if (mode === 'restore' && restoreProject && validated.manifest.projectId !== restoreProject.id) {
        throw new Error(
          `Esta copia pertenece a “${validated.manifest.projectName}” y no puede reemplazar “${restoreProject.name}”.`,
        );
      }
      const nextCopyId = portableCopyId();
      const collision = await projectStorageRuntime.inspectBackupImport({ package: validated, strategy: 'reject' });
      const nextStrategy: ProjectBackupImportStrategy = mode === 'restore' ? 'replace' : collision.projectCollision ? 'copy' : 'reject';
      const nextCopyName = `${validated.manifest.projectName} (importado)`;
      setPackage(validated);
      setImpact({ ...collision, strategy: nextStrategy, targetProjectId: nextStrategy === 'copy' ? nextCopyId : collision.targetProjectId });
      setStrategy(nextStrategy);
      setCopyProjectId(nextCopyId);
      setCopyName(nextCopyName);
      setState('ready');
      setMessage(
        collision.projectCollision
          ? mode === 'restore'
            ? 'Proyecto localizado. Se creará una revisión de seguridad antes de reemplazarlo.'
            : 'Ya existe un proyecto con este ID. Importa como copia o elige reemplazarlo explícitamente.'
          : 'La copia es válida y está lista para importar.',
      );
    } catch (error) {
      setPackage(null);
      setImpact(null);
      setState('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo validar el archivo seleccionado.');
    }
  }

  async function runImport() {
    if (!pkg) return;
    setState('importing');
    setMessage(strategy === 'replace' ? 'Creando revisión de seguridad y restaurando…' : 'Importando proyecto…');
    try {
      const request = {
        package: pkg,
        strategy,
        ...(strategy === 'copy' ? { copyProjectId, copyName } : {}),
      } as const;
      const nextImpact = await projectStorageRuntime.inspectBackupImport(request);
      if (strategy === 'reject' && nextImpact.projectCollision) {
        throw new Error('El proyecto ya existe. Selecciona “Importar como copia” o “Reemplazar”.');
      }
      const result = await projectStorageRuntime.importBackup(request);
      setImpact(result);
      setState('success');
      setMessage(
        strategy === 'replace'
          ? 'Proyecto restaurado. La versión anterior quedó guardada como revisión de seguridad.'
          : 'Proyecto importado correctamente.',
      );
      await onImported?.(result);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo importar la copia de seguridad.');
    }
  }

  const collision = impact?.projectCollision ?? false;
  const busy = state === 'validating' || state === 'importing';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="ec-project-backup-dialog" aria-describedby="project-backup-description">
        <DialogTitle>{mode === 'restore' ? 'Restaurar desde una copia' : 'Importar copia de seguridad'}</DialogTitle>
        <DialogDescription id="project-backup-description">
          {mode === 'restore'
            ? 'Valida una copia del mismo proyecto y revisa el impacto antes de reemplazar los datos locales.'
            : 'ElectroCraft valida manifest, versión y checksums antes de escribir en el almacenamiento local.'}
        </DialogDescription>

        <div className="ec-project-backup-step">
          <label htmlFor={fileInputId}>
            <strong>1. Archivo</strong>
            <span>Formato .electrocraft.json</span>
          </label>
          <Input
            id={fileInputId}
            type="file"
            accept=".json,.electrocraft.json,application/json"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void validateFile(file);
            }}
          />
        </div>

        <div className="ec-project-backup-status" role="status" aria-live="polite" data-state={state}>
          {busy ? <Loader label={message} announce={false} size="sm" /> : null}
          <span>{message}</span>
        </div>

        {pkg && impact ? (
          <>
            <section className="ec-project-backup-impact" aria-labelledby="project-backup-impact-title">
              <h3 id="project-backup-impact-title">2. Impacto</h3>
              <dl>
                <div>
                  <dt>Proyecto</dt>
                  <dd>{pkg.manifest.projectName}</dd>
                </div>
                <div>
                  <dt>Objetos</dt>
                  <dd>{pkg.manifest.objectCount}</dd>
                </div>
                <div>
                  <dt>Registros</dt>
                  <dd>{pkg.manifest.contentRecordCount}</dd>
                </div>
                <div>
                  <dt>Taxonomías</dt>
                  <dd>{pkg.manifest.taxonomyTermCount}</dd>
                </div>
                <div>
                  <dt>Relaciones</dt>
                  <dd>{pkg.manifest.relationCount}</dd>
                </div>
                <div>
                  <dt>Referencias de medios</dt>
                  <dd>{pkg.manifest.mediaReferenceCount}</dd>
                </div>
              </dl>
              {pkg.manifest.mediaReferenceCount > 0 ? (
                <p className="ec-project-backup-note">
                  Esta versión conserva metadata y referencias de medios. Los archivos binarios se incorporarán cuando
                  MediaBlobStore esté disponible; la copia no afirma contener bytes que no existen.
                </p>
              ) : null}
            </section>

            {mode === 'import' && collision ? (
              <section className="ec-project-backup-strategy" aria-labelledby="project-backup-strategy-title">
                <h3 id="project-backup-strategy-title">3. Resolver colisión</h3>
                <RadioGroup
                  value={strategy}
                  onValueChange={(value) => setStrategy(value as ProjectBackupImportStrategy)}
                  disabled={busy}
                >
                  <label className="ec-project-backup-choice">
                    <RadioGroupItem value="copy" />
                    <span>
                      <strong>Importar como copia</strong>
                      <small>Crea una identidad nueva y remapea referencias internas.</small>
                    </span>
                  </label>
                  <label className="ec-project-backup-choice">
                    <RadioGroupItem value="replace" />
                    <span>
                      <strong>Reemplazar proyecto existente</strong>
                      <small>Primero guarda una revisión de seguridad del estado actual.</small>
                    </span>
                  </label>
                </RadioGroup>
                {strategy === 'copy' ? (
                  <label className="ec-project-backup-copy-name" htmlFor={copyNameId}>
                    Nombre de la copia
                    <Input id={copyNameId} value={copyName} onChange={(event) => setCopyName(event.target.value)} />
                  </label>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}

        <footer className="ec-project-backup-actions">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            {state === 'success' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {state !== 'success' ? (
            <Button
              variant={strategy === 'replace' ? 'destructive' : 'default'}
              disabled={!pkg || state !== 'ready' || (strategy === 'copy' && !copyName.trim())}
              onClick={() => void runImport()}
            >
              {state === 'importing' ? <Loader label="Importando" announce={false} size="xs" /> : null}
              {strategy === 'replace' ? 'Restaurar y reemplazar' : strategy === 'copy' ? 'Importar como copia' : 'Importar'}
            </Button>
          ) : null}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
