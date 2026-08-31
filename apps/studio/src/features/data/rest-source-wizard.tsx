import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@electrocraft/design-system';
import { useEffect, useState } from 'react';
import { GraphQLSourceWizardSheet } from './graphql-source-wizard';
import { RestSourceWizardSheet as RestSourceWizardImpl } from './rest-source-wizard-impl';

type SourceWizardMode = 'choose' | 'rest' | 'graphql';

export function RestSourceWizardSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<SourceWizardMode>('choose');

  useEffect(() => {
    if (!open) setMode('choose');
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setMode('choose');
    onOpenChange(nextOpen);
  };

  if (mode === 'rest') {
    return <RestSourceWizardImpl open={open} onOpenChange={handleOpenChange} />;
  }

  if (mode === 'graphql') {
    return <GraphQLSourceWizardSheet open={open} onOpenChange={handleOpenChange} />;
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[520px]" data-new-data-source-picker>
        <SheetHeader>
          <SheetTitle>Nueva fuente de datos</SheetTitle>
          <SheetDescription>
            Elige el conector. Los secretos nunca se guardan dentro del proyecto portable.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 p-4 pt-2">
          <Button className="h-auto justify-start p-4 text-left" variant="outline" onClick={() => setMode('rest')}>
            <span className="grid gap-1">
              <strong>REST API</strong>
              <span className="text-xs font-normal text-muted-foreground">
                OpenAPI o configuración manual con Fetch y Gateway.
              </span>
            </span>
          </Button>
          <Button className="h-auto justify-start p-4 text-left" variant="outline" onClick={() => setMode('graphql')}>
            <span className="grid gap-1">
              <strong>GraphQL</strong>
              <span className="text-xs font-normal text-muted-foreground">
                Introspection, consultas, mutaciones y variables tipadas.
              </span>
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
