import { Button, Input } from '@electrocraft/design-system';
import {
  readElectroCraftAdvancedFieldMetadata,
  type ElectroCraftCalculatedOperation,
  type ElectroCraftConditionalOperator,
  type ElectroCraftConditionalValueType,
  type ElectroCraftDataField,
  type ElectroCraftDataModel,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState } from 'react';
import { dataModelWorkspaceRuntime } from './data-model-runtime';

interface AdvancedFieldEditorProps {
  readonly model: ElectroCraftDataModel;
  readonly field: ElectroCraftDataField;
  readonly onMessage: (message: string) => void;
}

const comparisonOperators: readonly { readonly value: ElectroCraftConditionalOperator; readonly label: string }[] = [
  { value: 'equals', label: 'Es igual a' },
  { value: 'not-equals', label: 'No es igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater-than', label: 'Mayor que' },
  { value: 'greater-than-or-equal', label: 'Mayor o igual' },
  { value: 'less-than', label: 'Menor que' },
  { value: 'less-than-or-equal', label: 'Menor o igual' },
  { value: 'empty', label: 'Está vacío' },
  { value: 'not-empty', label: 'No está vacío' },
];

export function AdvancedFieldEditor({ model, field, onMessage }: AdvancedFieldEditorProps) {
  const advanced = readElectroCraftAdvancedFieldMetadata(field);
  const [parentFieldRef, setParentFieldRef] = useState<string>(advanced.parentFieldRef ?? '');
  const [minItems, setMinItems] = useState(String(advanced.repeater?.minItems ?? 0));
  const [maxItems, setMaxItems] = useState(String(advanced.repeater?.maxItems ?? ''));
  const [operation, setOperation] = useState<ElectroCraftCalculatedOperation>(advanced.calculated?.operation ?? 'coalesce');
  const [firstDependency, setFirstDependency] = useState(
    advanced.calculated?.operands.find((operand) => operand.kind === 'field')?.fieldKey ?? '',
  );
  const [secondDependency, setSecondDependency] = useState(
    advanced.calculated?.operands.filter((operand) => operand.kind === 'field')[1]?.fieldKey ?? '',
  );
  const conditionalRule = advanced.conditional?.rule.kind === 'comparison' ? advanced.conditional.rule : null;
  const [conditionFieldKey, setConditionFieldKey] = useState(conditionalRule?.fieldKey ?? '');
  const [conditionOperator, setConditionOperator] = useState<ElectroCraftConditionalOperator>(
    conditionalRule?.operator ?? 'not-empty',
  );
  const [conditionValue, setConditionValue] = useState(
    conditionalRule?.value === undefined || conditionalRule.value === null ? '' : String(conditionalRule.value),
  );
  const [conditionalValueType, setConditionalValueType] = useState<ElectroCraftConditionalValueType>(
    advanced.conditional?.valueType ?? 'text',
  );

  useEffect(() => {
    const next = readElectroCraftAdvancedFieldMetadata(field);
    setParentFieldRef(next.parentFieldRef ?? '');
    setMinItems(String(next.repeater?.minItems ?? 0));
    setMaxItems(String(next.repeater?.maxItems ?? ''));
    setOperation(next.calculated?.operation ?? 'coalesce');
    setFirstDependency(next.calculated?.operands.find((operand) => operand.kind === 'field')?.fieldKey ?? '');
    setSecondDependency(next.calculated?.operands.filter((operand) => operand.kind === 'field')[1]?.fieldKey ?? '');
    const rule = next.conditional?.rule.kind === 'comparison' ? next.conditional.rule : null;
    setConditionFieldKey(rule?.fieldKey ?? '');
    setConditionOperator(rule?.operator ?? 'not-empty');
    setConditionValue(rule?.value === undefined || rule.value === null ? '' : String(rule.value));
    setConditionalValueType(next.conditional?.valueType ?? 'text');
  }, [field]);

  const parentCandidates = useMemo(
    () => model.fields.filter((candidate) => candidate.id !== field.id && ['group', 'repeater'].includes(candidate.type)),
    [field.id, model.fields],
  );
  const dependencyCandidates = useMemo(
    () =>
      model.fields.filter((candidate) => {
        if (candidate.id === field.id) return false;
        const candidateAdvanced = readElectroCraftAdvancedFieldMetadata(candidate);
        return candidateAdvanced.parentFieldRef === (parentFieldRef || null) && !['group', 'repeater'].includes(candidate.type);
      }),
    [field.id, model.fields, parentFieldRef],
  );

  async function saveAdvanced() {
    const patch: Parameters<typeof dataModelWorkspaceRuntime.updateAdvancedFieldMetadata>[2] = {
      parentFieldRef: parentFieldRef || null,
    };
    if (field.type === 'repeater') {
      patch.repeater = {
        minItems: Math.max(0, Number.parseInt(minItems || '0', 10)),
        ...(maxItems.trim() ? { maxItems: Math.max(1, Number.parseInt(maxItems, 10)) } : {}),
      };
    }
    if (field.type === 'calculated') {
      const dependencies = [firstDependency, secondDependency].filter(Boolean);
      patch.calculated = {
        operation,
        operands: dependencies.length
          ? dependencies.map((fieldKey) => ({ kind: 'field' as const, fieldKey }))
          : [{ kind: 'literal' as const, value: null }],
      };
    }
    if (field.type === 'conditional') {
      if (!conditionFieldKey) throw new Error('Selecciona el campo que gobierna la condición.');
      const requiresValue = !['empty', 'not-empty'].includes(conditionOperator);
      patch.conditional = {
        rule: {
          kind: 'comparison',
          fieldKey: conditionFieldKey,
          operator: conditionOperator,
          ...(requiresValue ? { value: conditionValue } : {}),
        },
        valueType: conditionalValueType,
        whenFalse: 'omit',
      };
    }
    await dataModelWorkspaceRuntime.updateAdvancedFieldMetadata(model.id, field.id, patch);
    onMessage('Configuración avanzada guardada. Dependencias y ciclos fueron validados.');
  }

  return (
    <section className="ec-advanced-field-editor" aria-label="Configuración avanzada del campo">
      <div className="ec-advanced-field-heading">
        <div>
          <strong>Estructura y dependencias</strong>
          <p>La configuración es portable; PGlite sigue usando `content_records` sin DDL dinámico.</p>
        </div>
        <div className="ec-advanced-order-actions" aria-label="Orden del campo">
          <Button size="sm" variant="outline" onClick={() => void dataModelWorkspaceRuntime.moveField(model.id, field.id, -1)}>
            Subir
          </Button>
          <Button size="sm" variant="outline" onClick={() => void dataModelWorkspaceRuntime.moveField(model.id, field.id, 1)}>
            Bajar
          </Button>
        </div>
      </div>

      <div className="ec-model-form-grid">
        <label>
          Dentro de
          <select value={parentFieldRef} onChange={(event) => setParentFieldRef(event.target.value)}>
            <option value="">Raíz del modelo</option>
            {parentCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label} · {candidate.type === 'group' ? 'Grupo' : 'Repetidor'}
              </option>
            ))}
          </select>
        </label>

        {field.type === 'repeater' ? (
          <>
            <label>
              Mínimo de elementos
              <Input type="number" min={0} value={minItems} onChange={(event) => setMinItems(event.target.value)} />
            </label>
            <label>
              Máximo de elementos
              <Input type="number" min={1} value={maxItems} onChange={(event) => setMaxItems(event.target.value)} />
            </label>
          </>
        ) : null}

        {field.type === 'calculated' ? (
          <>
            <label>
              Operación segura
              <select value={operation} onChange={(event) => setOperation(event.target.value as ElectroCraftCalculatedOperation)}>
                <option value="coalesce">Primer valor disponible</option>
                <option value="concat">Concatenar</option>
                <option value="add">Sumar</option>
                <option value="subtract">Restar</option>
                <option value="multiply">Multiplicar</option>
                <option value="divide">Dividir</option>
              </select>
            </label>
            <label>
              Dependencia 1
              <select value={firstDependency} onChange={(event) => setFirstDependency(event.target.value)}>
                <option value="">Sin dependencia</option>
                {dependencyCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.key}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dependencia 2
              <select value={secondDependency} onChange={(event) => setSecondDependency(event.target.value)}>
                <option value="">Sin segunda dependencia</option>
                {dependencyCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.key}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {field.type === 'conditional' ? (
          <>
            <label>
              Depende de
              <select value={conditionFieldKey} onChange={(event) => setConditionFieldKey(event.target.value)}>
                <option value="">Seleccionar campo</option>
                {dependencyCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.key}>
                    {candidate.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Operador
              <select
                value={conditionOperator}
                onChange={(event) => setConditionOperator(event.target.value as ElectroCraftConditionalOperator)}
              >
                {comparisonOperators.map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>
            </label>
            {!['empty', 'not-empty'].includes(conditionOperator) ? (
              <label>
                Valor de comparación
                <Input value={conditionValue} onChange={(event) => setConditionValue(event.target.value)} />
              </label>
            ) : null}
            <label>
              Tipo del valor condicional
              <select
                value={conditionalValueType}
                onChange={(event) => setConditionalValueType(event.target.value as ElectroCraftConditionalValueType)}
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Booleano</option>
                <option value="json">JSON</option>
              </select>
            </label>
          </>
        ) : null}
      </div>

      {field.type === 'group' ? <p className="ec-advanced-hint">Los campos hijos se guardan como objeto JSON anidado.</p> : null}
      {field.type === 'repeater' ? <p className="ec-advanced-hint">Cada elemento del Repeater valida sus hijos de forma independiente.</p> : null}
      {field.type === 'calculated' ? <p className="ec-advanced-hint">Solo se ejecutan operaciones registradas; nunca se evalúa código del usuario.</p> : null}
      {field.type === 'conditional' ? <p className="ec-advanced-hint">La condición usa un AST tipado y se interpreta sin `eval`.</p> : null}

      <Button size="sm" variant="outline" onClick={() => void saveAdvanced().catch((error: unknown) => onMessage(error instanceof Error ? error.message : 'No se pudo guardar la configuración avanzada.'))}>
        Guardar estructura
      </Button>
    </section>
  );
}
