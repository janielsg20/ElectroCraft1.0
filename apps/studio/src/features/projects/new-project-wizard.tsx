import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Loader,
  RadioGroup,
  RadioGroupItem,
} from '@electrocraft/design-system';
import { useState } from 'react';
import { projectStorageRuntime } from './project-storage-runtime';
import './project-choice.css';

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
                <RadioGroup value={type} onValueChange={setType} aria-label="Tipo de proyecto">
                  <label className="ec-project-choice" htmlFor="project-type-blank">
                    <RadioGroupItem id="project-type-blank" value="blank" />
                    <span>Básico en blanco</span>
                  </label>
                  <label className="ec-project-choice" htmlFor="project-type-blueprint">
                    <RadioGroupItem id="project-type-blueprint" value="blueprint" />
                    <span>Blueprint</span>
                  </label>
                </RadioGroup>
              </fieldset>
            </>
          ) : null}
          {step === 1 ? (
            <fieldset>
              <legend>Diseño inicial</legend>
              <RadioGroup value={design} onValueChange={setDesign} aria-label="Diseño inicial">
                <label className="ec-project-choice" htmlFor="project-design-system">
                  <RadioGroupItem id="project-design-system" value="system" />
                  <span>Sistema</span>
                </label>
                <label className="ec-project-choice" htmlFor="project-design-minimal">
                  <RadioGroupItem id="project-design-minimal" value="minimal" />
                  <span>Minimalista</span>
                </label>
              </RadioGroup>
            </fieldset>
          ) : null}
          {step === 2 ? (
            <>
              <h3>Contenido de demostración</h3>
              <label className="ec-project-choice" htmlFor="project-demo-content">
                <Checkbox
                  id="project-demo-content"
                  checked={demo}
                  onCheckedChange={(checked) => setDemo(checked === true)}
                />
                <span>Incluir preferencia de contenido demo</span>
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
