import {
  validateProjectBackupPackage,
  type ProjectBackupImportMode,
  type ProjectBackupPackage,
  type ProjectSummary,
} from '@electrocraft/application';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import { useState } from 'react';
import { projectStorageRuntime } from './project-storage-runtime';

function backupFileName(project: ProjectSummary) {
  const safeName = project.name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${safeName || 'proyecto'}.electrocraft-backup.json`;
}

function downloadJson(fileName: string, value: unknown) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ProjectBackupButton({ project }: { readonly project: ProjectSummary }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  return (
    <div>
      <Button
        variant="ghost"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError('');
          void projectStorageRuntime
            .exportProjectBackup(project.id)
            .then((backup) => downloadJson(backupFileName(project), backup))
            .catch((cause) =>
              setError(cause instanceof Error ? cause.message : 'No se pudo crear la copia de seguridad.'),
            )
            .finally(() => setPending(false));
        }}
      >
        {pending ? 'Creando copia…' : 'Crear copia de seguridad'}
      </Button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

export function ProjectImportDialog({ onImported }: { readonly onImported: (projectId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [backup, setBackup] = useState<ProjectBackupPackage | null>(null);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<ProjectBackupImportMode>('import-as-copy');
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setBackup(null);
    setFileName('');
    setMode('import-as-copy');
    setName('');
    setPending(false);
    setError('');
  }

  async function readBackup(file: File) {
    setError('');
    setBackup(null);
    setFileName(file.name);
    try {
      const parsed = JSON.parse(await file.text()) as ProjectBackupPackage;
      const validated = validateProjectBackupPackage(parsed);
      setBackup(validated);
      setName(`${validated.snapshot.project.name} (copia importada)`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'El archivo no es un backup válido de ElectroCraft.');
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Importar proyecto
      </Button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) reset();
        }}
      >
        <DialogContent className="max-w-lg" aria-describedby="project-import-description">
          <DialogTitle>Importar proyecto</DialogTitle>
          <DialogDescription id="project-import-description">
            Selecciona una copia de seguridad. ElectroCraft valida formato, versión y checksum antes de escribir en el
            almacenamiento local.
          </DialogDescription>

          <label htmlFor="project-backup-file">Archivo de copia de seguridad</label>
          <Input
            id="project-backup-file"
            type="file"
            accept=".json,application/json"
            disabled={pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readBackup(file);
            }}
          />
          {fileName ? <small>Archivo: {fileName}</small> : null}
          {error ? <p role="alert">{error}</p> : null}

          {backup ? (
            <section aria-label="Resumen de impacto">
              <h3>Resumen de impacto</h3>
              <p>
                <strong>{backup.snapshot.project.name}</strong>
              </p>
              <p>
                {backup.manifest.objectCount} objetos · {backup.manifest.mediaCount} recursos multimedia
              </p>
              <p>Versión de backup: {backup.manifest.formatVersion}</p>

              <label htmlFor="project-import-mode">Estrategia</label>
              <Select value={mode} onValueChange={(value) => setMode(value as ProjectBackupImportMode)}>
                <SelectTrigger id="project-import-mode" aria-label="Estrategia de importación">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import-as-copy">Importar como copia</SelectItem>
                  <SelectItem value="replace-existing">Restaurar y reemplazar el proyecto original</SelectItem>
                </SelectContent>
              </Select>

              {mode === 'import-as-copy' ? (
                <>
                  <label htmlFor="project-import-name">Nombre de la copia</label>
                  <Input
                    id="project-import-name"
                    value={name}
                    disabled={pending}
                    onChange={(event) => setName(event.target.value)}
                  />
                </>
              ) : (
                <p>
                  Antes de reemplazar se crea un checkpoint <code>pre-restore-safety</code> del proyecto existente.
                </p>
              )}
            </section>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!backup || pending || (mode === 'import-as-copy' && !name.trim())}
              onClick={() => {
                if (!backup) return;
                setPending(true);
                setError('');
                void projectStorageRuntime
                  .importProjectBackup(backup, {
                    mode,
                    ...(mode === 'import-as-copy' ? { name: name.trim() } : {}),
                  })
                  .then((result) => {
                    setOpen(false);
                    onImported(result.projectId);
                  })
                  .catch((cause) =>
                    setError(cause instanceof Error ? cause.message : 'No se pudo importar el proyecto.'),
                  )
                  .finally(() => setPending(false));
              }}
            >
              {pending ? 'Importando…' : mode === 'replace-existing' ? 'Restaurar proyecto' : 'Importar copia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
