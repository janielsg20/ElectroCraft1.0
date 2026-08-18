import {
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  electroCraftQueryDefinitionSchema,
  getDataField,
  getDataModel,
  validateDataSchemaReferences,
  validateQueryDefinitionReferences,
  type ElectroCraftDataField,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftDocument,
  type ElectroCraftObjectId,
  type ElectroCraftProjectDefinition,
  type ElectroCraftQueryDefinition,
  type QueryReferenceDiagnostic,
} from '@electrocraft/domain';

export type DataOwnershipDiagnosticCode =
  | 'missing-project-data-source-ref'
  | 'missing-project-data-schema-ref'
  | 'missing-project-query-ref'
  | 'schema-source-ref-invalid'
  | 'query-reference-invalid'
  | 'form-schema-ref-invalid'
  | 'form-model-ref-invalid'
  | 'form-binding-ref-invalid';

export interface DataOwnershipDiagnostic {
  code: DataOwnershipDiagnosticCode;
  ownerId: ElectroCraftObjectId;
  ref?: ElectroCraftObjectId;
  path?: string;
  queryDiagnostic?: QueryReferenceDiagnostic;
}

export interface DataOwnershipGraph {
  project: ElectroCraftProjectDefinition;
  sources: ElectroCraftDataSourceDefinition[];
  schemas: ElectroCraftDataSchema[];
  queries: ElectroCraftQueryDefinition[];
  forms: ElectroCraftDocument[];
}

function collectFormBindingRefs(document: ElectroCraftDocument): Array<{ ref: ElectroCraftObjectId; path: string; source: string }> {
  if (document.kind !== 'form' || document.formMeta === null) return [];
  const refs: Array<{ ref: ElectroCraftObjectId; path: string; source: string }> = [];
  if (document.formMeta.initialValuesBinding) {
    refs.push({
      ref: document.formMeta.initialValuesBinding.ref,
      path: 'formMeta.initialValuesBinding',
      source: document.formMeta.initialValuesBinding.source,
    });
  }
  for (const [fieldKey, binding] of Object.entries(document.formMeta.fieldBindings)) {
    refs.push({ ref: binding.ref, path: `formMeta.fieldBindings.${fieldKey}`, source: binding.source });
  }
  return refs;
}

export function validateDataOwnershipGraph(input: DataOwnershipGraph): DataOwnershipDiagnostic[] {
  const project = electroCraftProjectDefinitionSchema.parse(input.project);
  const sources = input.sources.map((source) => electroCraftDataSourceDefinitionSchema.parse(source));
  const schemas = input.schemas.map((schema) => electroCraftDataSchemaSchema.parse(schema));
  const queries = input.queries.map((query) => electroCraftQueryDefinitionSchema.parse(query));
  const forms = input.forms.map((form) => electroCraftDocumentSchema.parse(form));

  const sourceById = new Map(sources.map((source) => [source.id, source] as const));
  const schemaById = new Map(schemas.map((schema) => [schema.id, schema] as const));
  const queryById = new Map(queries.map((query) => [query.id, query] as const));
  const formById = new Map(forms.map((form) => [form.id, form] as const));
  const diagnostics: DataOwnershipDiagnostic[] = [];

  for (const ref of project.dataSourceRefs) {
    if (!sourceById.has(ref)) diagnostics.push({ code: 'missing-project-data-source-ref', ownerId: project.id, ref });
  }
  for (const ref of project.dataSchemaRefs) {
    if (!schemaById.has(ref)) diagnostics.push({ code: 'missing-project-data-schema-ref', ownerId: project.id, ref });
  }
  for (const ref of project.queryRefs) {
    if (!queryById.has(ref)) diagnostics.push({ code: 'missing-project-query-ref', ownerId: project.id, ref });
  }

  for (const schema of schemas) {
    for (const schemaDiagnostic of validateDataSchemaReferences(schema, sources)) {
      diagnostics.push({ code: 'schema-source-ref-invalid', ownerId: schemaDiagnostic.ownerId, ref: schemaDiagnostic.ref });
    }
  }

  for (const query of queries) {
    const schema = schemaById.get(query.dataSchemaRef);
    if (!schema) {
      diagnostics.push({ code: 'missing-project-data-schema-ref', ownerId: query.id, ref: query.dataSchemaRef });
      continue;
    }
    for (const queryDiagnostic of validateQueryDefinitionReferences(query, schema)) {
      diagnostics.push({
        code: 'query-reference-invalid',
        ownerId: query.id,
        ref: queryDiagnostic.ref,
        path: queryDiagnostic.path,
        queryDiagnostic,
      });
    }
  }

  for (const form of forms) {
    if (form.kind !== 'form' || form.formMeta === null) continue;
    const schemaRef = form.formMeta.dataSchemaRef;
    const modelRef = form.formMeta.modelRef;
    if (schemaRef !== null) {
      const schema = schemaById.get(schemaRef);
      if (!schema) {
        diagnostics.push({ code: 'form-schema-ref-invalid', ownerId: form.id, ref: schemaRef, path: 'formMeta.dataSchemaRef' });
      } else if (modelRef !== null && !getDataModel(schema, modelRef)) {
        diagnostics.push({ code: 'form-model-ref-invalid', ownerId: form.id, ref: modelRef, path: 'formMeta.modelRef' });
      }
    }

    for (const binding of collectFormBindingRefs(form)) {
      const valid =
        (binding.source === 'query' && queryById.has(binding.ref)) ||
        (binding.source === 'data-source' && sourceById.has(binding.ref)) ||
        (binding.source === 'form' && formById.has(binding.ref)) ||
        !['query', 'data-source', 'form'].includes(binding.source);
      if (!valid) {
        diagnostics.push({ code: 'form-binding-ref-invalid', ownerId: form.id, ref: binding.ref, path: binding.path });
      }
    }
  }

  return diagnostics;
}

export interface PortableFieldBinding {
  modelRef: ElectroCraftObjectId;
  fieldRef: ElectroCraftObjectId;
  fieldKey: string;
  fieldType: ElectroCraftDataField['type'];
  indexed: boolean;
  faceted: boolean;
}

export function resolvePortableFieldBinding(
  schema: ElectroCraftDataSchema,
  modelRef: ElectroCraftObjectId,
  fieldRef: ElectroCraftObjectId,
): PortableFieldBinding {
  const model = getDataModel(schema, modelRef);
  if (!model) throw new TypeError(`unknown data model ref: ${modelRef}`);
  const field = getDataField(model, fieldRef);
  if (!field) throw new TypeError(`unknown data field ref: ${fieldRef}`);
  return {
    modelRef,
    fieldRef,
    fieldKey: field.key,
    fieldType: field.type,
    indexed: field.indexed,
    faceted: field.faceted,
  };
}
