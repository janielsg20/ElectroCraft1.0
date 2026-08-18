import {
  electroCraftDataSchemaSchema,
  electroCraftDocumentSchema,
  getDataModel,
  type ElectroCraftBindingRef,
  type ElectroCraftDataSchema,
  type ElectroCraftDocument,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';

export type FormContractDiagnosticCode =
  'NOT_A_FORM_DOCUMENT' | 'MISSING_FORM_META' | 'FORM_SCHEMA_MISMATCH' | 'FORM_MODEL_MISMATCH';

export interface FormContractDiagnostic {
  code: FormContractDiagnosticCode;
  documentId: ElectroCraftObjectId;
  ref?: ElectroCraftObjectId;
}

export function validateFormDocument(
  documentInput: unknown,
  schemas: readonly ElectroCraftDataSchema[],
): FormContractDiagnostic[] {
  const document = electroCraftDocumentSchema.parse(documentInput);
  const canonicalSchemas = schemas.map((schema) => electroCraftDataSchemaSchema.parse(schema));
  if (document.kind !== 'form') {
    return [{ code: 'NOT_A_FORM_DOCUMENT', documentId: document.id }];
  }
  if (document.formMeta === null) {
    return [{ code: 'MISSING_FORM_META', documentId: document.id }];
  }

  if (document.formMeta.dataSchemaRef === null || document.formMeta.modelRef === null) return [];
  const schema = canonicalSchemas.find(({ id }) => id === document.formMeta?.dataSchemaRef);
  if (!schema) {
    return [{ code: 'FORM_SCHEMA_MISMATCH', documentId: document.id, ref: document.formMeta.dataSchemaRef }];
  }
  if (!getDataModel(schema, document.formMeta.modelRef)) {
    return [{ code: 'FORM_MODEL_MISMATCH', documentId: document.id, ref: document.formMeta.modelRef }];
  }
  return [];
}

export interface FormBindingEntry {
  fieldKey: string | null;
  binding: ElectroCraftBindingRef;
}

export function collectFormBindings(documentInput: unknown): FormBindingEntry[] {
  const document: ElectroCraftDocument = electroCraftDocumentSchema.parse(documentInput);
  if (document.kind !== 'form' || document.formMeta === null) return [];
  const bindings: FormBindingEntry[] = [];
  if (document.formMeta.initialValuesBinding) {
    bindings.push({ fieldKey: null, binding: document.formMeta.initialValuesBinding });
  }
  for (const [fieldKey, binding] of Object.entries(document.formMeta.fieldBindings)) {
    bindings.push({ fieldKey, binding });
  }
  return bindings;
}
