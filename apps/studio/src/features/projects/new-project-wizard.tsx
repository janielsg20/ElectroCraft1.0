import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Loader,
} from '@electrocraft/design-system';
import { useState } from 'react';
import { projectStorageRuntime } from './project-storage-runtime';

const steps = ['Tipo', 'Diseño', 'Demo', 'Revisar'] as const;
export function NewProjectWizard({
  open,
  onClose,
  onCreated,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Proyecto sin título');
  const [type, setType] = useState('blank');
  const [design, setDesign] = useState('system');
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function create() {
    setSaving(true);
    setError('');
    try {
      const id = crypto.randomUUID();
      await projectStorageRuntime.saveProject({
        project: { id, name, metadata: { projectType: type, designPreset: design, includeDemo: demo } },
        objects: [],
        reason: 'project-wizard',
      });
      onCreated(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el proyecto.');
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DialogContent className="ec-project-wizard" aria-describedby="wizard-description">
        <header>
          <div>
            <p>
              Paso {step + 1} de {steps.length}
            </p>
            <DialogTitle id="wizard-title">Nuevo proyecto · {steps[step]}</DialogTitle>
            <DialogDescription id="wizard-description" className="sr-only">
              Asistente de cuatro pasos para configurar un proyecto local.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" aria-label="Cerrar asistente">
              Cerrar
            </Button>
          </DialogClose>
        </header>
        <ol aria-label="Progreso">
          {steps.map((label, index) => (
            <li key={label} aria-current={index === step ? 'step' : undefined}>
              {label}
            </li>
          ))}
        </ol>
        <div className="ec-project-wizard-body">
          {step === 0 ? (
            <>
              <label htmlFor="project-name">Nombre del proyecto</label>
              <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
              <fieldset>
                <legend>Tipo</legend>
                <label>
                  <input
                    name="project-type"
                    type="radio"
                    checked={type === 'blank'}
                    onChange={() => setType('blank')}
                  />{' '}
                  Básico en blanco
                </label>
                <label>
                  <input
                    name="project-type"
                    type="radio"
                    checked={type === 'blueprint'}
                    onChange={() => setType('blueprint')}
                  />{' '}
                  Blueprint
                </label>
              </fieldset>
            </>
          ) : null}
          {step === 1 ? (
            <fieldset>
              <legend>Diseño inicial</legend>
              <label>
                <input
                  name="project-design"
                  type="radio"
                  checked={design === 'system'}
                  onChange={() => setDesign('system')}
                />{' '}
                Sistema
              </label>
              <label>
                <input
                  name="project-design"
                  type="radio"
                  checked={design === 'minimal'}
                  onChange={() => setDesign('minimal')}
                />{' '}
                Minimalista
              </label>
            </fieldset>
          ) : null}
          {step === 2 ? (
            <>
              <h3>Contenido de demostración</h3>
              <label>
                <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} /> Incluir preferencia
                de contenido demo
              </label>
              <p>La selección se registra como configuración; no crea datos permanentes ocultos.</p>
            </>
          ) : null}
          {step === 3 ? (
            <>
              <h3>Revisar</h3>
              <dl>
                <dt>Nombre</dt>
                <dd>{name}</dd>
                <dt>Tipo</dt>
                <dd>{type === 'blank' ? 'Básico' : 'Blueprint'}</dd>
                <dt>Diseño</dt>
                <dd>{design === 'system' ? 'Sistema' : 'Minimalista'}</dd>
                <dt>Demo</dt>
                <dd>{demo ? 'Sí' : 'No'}</dd>
              </dl>
            </>
          ) : null}
          {error ? <p role="alert">{error}</p> : null}
        </div>
        <footer>
          <Button variant="ghost" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}>
            Anterior
          </Button>
          {step < 3 ? (
            <Button disabled={!name.trim()} onClick={() => setStep(step + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button disabled={!name.trim() || saving} onClick={() => void create()}>
              {saving ? <Loader label="Guardando proyecto" announce={false} size="xs" /> : null}
              {saving ? 'Guardando…' : 'Crear proyecto'}
            </Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
