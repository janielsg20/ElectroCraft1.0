import { createElement } from 'react';
import {
  ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP,
  type PuckCanonicalRenderer,
} from '@electrocraft/editor-puck';

export const studioPuckDiagnosticRenderer: PuckCanonicalRenderer = (input) => {
  const props = input as Record<string, unknown>;
  const componentRef = String(props[ELECTROCRAFT_PUCK_DIAGNOSTIC_REF_PROP] ?? 'desconocido');
  const code = String(props[ELECTROCRAFT_PUCK_DIAGNOSTIC_CODE_PROP] ?? 'unknown-component');
  const slot = props[ELECTROCRAFT_PUCK_CHILDREN_SLOT];
  const nestedContent = typeof slot === 'function' ? slot() : null;
  const detail =
    code === 'unsupported-children'
      ? 'Su estructura anidada no coincide con los Slots disponibles y se mantiene sin pérdida para poder repararla.'
      : code === 'reserved-prop'
        ? 'Usa una propiedad reservada por el adapter. El contenido original se mantiene para poder repararlo.'
        : 'Falta su definición en el catálogo actual. El contenido original se mantiene para poder repararlo.';

  return createElement(
    'section',
    {
      role: 'alert',
      'data-puck-diagnostic': code,
      'data-component-ref': componentRef,
      'aria-label': `Componente no disponible: ${componentRef}`,
    },
    createElement('strong', null, `Componente no disponible: ${componentRef}`),
    createElement('p', null, detail),
    nestedContent,
  );
};
