import {
  createElectroCraftExportIREnvelope,
  electroCraftActionGraphSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftDocumentSchema,
  electroCraftExportValidationReportSchema,
  electroCraftMediaManifestSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftPermissionPolicySchema,
  electroCraftProjectDefinitionSchema,
  electroCraftQueryDefinitionSchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
  electroCraftThemeSchema,
  validateDataSchemaReferences,
  validateProjectDefinitionSemantics,
  validateProjectDocumentReferences,
  validateQueryDefinitionReferences,
  type ElectroCraftActionGraph,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftDocument,
  type ElectroCraftExportIREnvelope,
  type ElectroCraftExportValidationDiagnostic,
  type ElectroCraftExportValidationReport,
  type ElectroCraftMediaManifest,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftPermissionPolicy,
  type ElectroCraftProjectDefinition,
  type ElectroCraftQueryDefinition,
  type ElectroCraftRole,
  type ElectroCraftRouteDefinition,
  type ElectroCraftStateDefinition,
  type ElectroCraftTheme,
} from '@electrocraft/domain';
import { parseAppBehaviorGraph, validateAppBehaviorGraph } from './app-behavior-service';

export interface ElectroCraftExportIRSource {
  project: unknown;
  documents: readonly unknown[];
  routes: readonly unknown[];
  navigations: readonly unknown[];
  dataSources: readonly unknown[];
  dataSchemas: readonly unknown[];
  queries: readonly unknown[];
  states: readonly unknown[];
  actionGraphs: readonly unknown[];
  roles: readonly unknown[];
  permissionPolicies: readonly unknown[];
  theme: unknown | null;
  mediaManifest: unknown;
}

interface ParsedExportIRSource {
  project: ElectroCraftProjectDefinition;
  documents: ElectroCraftDocument[];
  routes: ElectroCraftRouteDefinition[];
  navigations: ElectroCraftNavigationDefinition[];
  dataSources: ElectroCraftDataSourceDefinition[];
  dataSchemas: ElectroCraftDataSchema[];
  queries: ElectroCraftQueryDefinition[];
  states: ElectroCraftStateDefinition[];
  actionGraphs: ElectroCraftActionGraph[];
  roles: ElectroCraftRole[];
  permissionPolicies: ElectroCraftPermissionPolicy[];
  theme: ElectroCraftTheme | null;
  mediaManifest: ElectroCraftMediaManifest;
}

function diagnostic(
  code: string,
  path: Array<string | number>,
  message: string,
  repair: string,
): ElectroCraftExportValidationDiagnostic {
  return {
    code,
    severity: 'error',
    path,
    message,
    repair,
  };
}

function extractIssuePath(error: unknown): Array<string | number> {
  if (error === null || typeof error !== 'object' || !('issues' in error)) return [];
  const issues = (error as { issues?: Array<{ path?: PropertyKey[] }> }).issues;
  const firstPath = issues?.[0]?.path ?? [];
  return firstPath.filter((segment): segment is string | number => typeof segment === 'string' || typeof segment === 'number');
}

function parseSource(input: ElectroCraftExportIRSource): ParsedExportIRSource {
  return {
    project: electroCraftProjectDefinitionSchema.parse(input.project),
    documents: input.documents.map((value) => electroCraftDocumentSchema.parse(value)),
    routes: input.routes.map((value) => electroCraftRouteDefinitionSchema.parse(value)),
    navigations: input.navigations.map((value) => electroCraftNavigationDefinitionSchema.parse(value)),
    dataSources: input.dataSources.map((value) => electroCraftDataSourceDefinitionSchema.parse(value)),
    dataSchemas: input.dataSchemas.map((value) => electroCraftDataSchemaSchema.parse(value)),
    queries: input.queries.map((value) => electroCraftQueryDefinitionSchema.parse(value)),
    states: input.states.map((value) => electroCraftStateDefinitionSchema.parse(value)),
    actionGraphs: input.actionGraphs.map((value) => electroCraftActionGraphSchema.parse(value)),
    roles: input.roles.map((value) => electroCraftRoleSchema.parse(value)),
    permissionPolicies: input.permissionPolicies.map((value) => electroCraftPermissionPolicySchema.parse(value)),
    theme: input.theme === null ? null : electroCraftThemeSchema.parse(input.theme),
    mediaManifest: electroCraftMediaManifestSchema.parse(input.mediaManifest),
  };
}

function duplicateIds(values: readonly { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of values) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates].sort();
}

function addMissingProjectRefs(
  diagnostics: ElectroCraftExportValidationDiagnostic[],
  label: string,
  refs: readonly string[],
  actualIds: ReadonlySet<string>,
): void {
  for (const ref of refs) {
    if (!actualIds.has(ref)) {
      diagnostics.push(
        diagnostic(
          'MISSING_PROJECT_REF',
          ['project', label, ref],
          `ProjectDefinition references missing ${label} object ${ref}`,
          `Add ${ref} to the ExportIR source or remove the stale project reference.`,
        ),
      );
    }
  }
}

function collectReferenceDiagnostics(source: ParsedExportIRSource): ElectroCraftExportValidationDiagnostic[] {
  const diagnostics: ElectroCraftExportValidationDiagnostic[] = [];

  for (const projectDiagnostic of validateProjectDefinitionSemantics(source.project)) {
    diagnostics.push(
      diagnostic(
        'PROJECT_SEMANTIC_ERROR',
        ['project'],
        projectDiagnostic.code,
        'Repair the ProjectDefinition semantic diagnostic before export.',
      ),
    );
  }
  for (const projectDiagnostic of validateProjectDocumentReferences(source.project, source.documents)) {
    diagnostics.push(
      diagnostic(
        'DOCUMENT_REFERENCE_ERROR',
        ['documents'],
        projectDiagnostic.code,
        'Repair the missing or duplicated document reference before export.',
      ),
    );
  }

  const collections: Array<[string, readonly { id: string }[]]> = [
    ['documents', source.documents],
    ['routes', source.routes],
    ['navigations', source.navigations],
    ['dataSources', source.dataSources],
    ['dataSchemas', source.dataSchemas],
    ['queries', source.queries],
    ['states', source.states],
    ['actionGraphs', source.actionGraphs],
    ['roles', source.roles],
    ['permissionPolicies', source.permissionPolicies],
  ];
  for (const [name, collection] of collections) {
    for (const id of duplicateIds(collection)) {
      diagnostics.push(
        diagnostic(
          'DUPLICATE_OBJECT_ID',
          [name],
          `Duplicate ${name} id ${id}`,
          'Keep exactly one canonical object for each ID.',
        ),
      );
    }
  }

  addMissingProjectRefs(diagnostics, 'routeRefs', source.project.routeRefs, new Set(source.routes.map(({ id }) => id)));
  addMissingProjectRefs(
    diagnostics,
    'navigationRefs',
    source.project.navigationRefs,
    new Set(source.navigations.map(({ id }) => id)),
  );
  addMissingProjectRefs(
    diagnostics,
    'dataSourceRefs',
    source.project.dataSourceRefs,
    new Set(source.dataSources.map(({ id }) => id)),
  );
  addMissingProjectRefs(
    diagnostics,
    'dataSchemaRefs',
    source.project.dataSchemaRefs,
    new Set(source.dataSchemas.map(({ id }) => id)),
  );
  addMissingProjectRefs(diagnostics, 'queryRefs', source.project.queryRefs, new Set(source.queries.map(({ id }) => id)));

  if (source.project.themeRef === null && source.theme !== null) {
    diagnostics.push(
      diagnostic(
        'THEME_REFERENCE_ERROR',
        ['theme'],
        'ExportIR contains a theme but ProjectDefinition.themeRef is null.',
        'Set themeRef to the theme ID or omit the theme.',
      ),
    );
  }
  if (source.project.themeRef !== null && source.theme?.id !== source.project.themeRef) {
    diagnostics.push(
      diagnostic(
        'THEME_REFERENCE_ERROR',
        ['project', 'themeRef'],
        `ProjectDefinition.themeRef ${source.project.themeRef} does not match the supplied theme.`,
        'Supply the referenced theme or repair themeRef.',
      ),
    );
  }

  for (const schema of source.dataSchemas) {
    for (const issue of validateDataSchemaReferences(schema, source.dataSources)) {
      diagnostics.push(
        diagnostic(
          'DATA_REFERENCE_ERROR',
          ['dataSchemas', schema.id],
          issue.code,
          'Repair the DataSchema/DataSource ownership reference before export.',
        ),
      );
    }
  }
  for (const query of source.queries) {
    const schema = source.dataSchemas.find(({ id }) => id === query.dataSchemaRef);
    if (!schema) {
      diagnostics.push(
        diagnostic(
          'QUERY_REFERENCE_ERROR',
          ['queries', query.id, 'dataSchemaRef'],
          `Query ${query.id} references missing DataSchema ${query.dataSchemaRef}.`,
          'Supply the referenced DataSchema or repair the query.',
        ),
      );
      continue;
    }
    for (const issue of validateQueryDefinitionReferences(query, schema)) {
      diagnostics.push(
        diagnostic(
          'QUERY_REFERENCE_ERROR',
          ['queries', query.id],
          issue.code,
          'Repair the query binding/reference diagnostic before export.',
        ),
      );
    }
  }

  const behavior = parseAppBehaviorGraph({
    documents: source.documents,
    routes: source.routes,
    navigations: source.navigations,
    actionGraphs: source.actionGraphs,
    states: source.states,
    policies: source.permissionPolicies,
    roles: source.roles,
  });
  for (const issue of validateAppBehaviorGraph(behavior)) {
    diagnostics.push(
      diagnostic(
        'APP_BEHAVIOR_REFERENCE_ERROR',
        ['appBehavior', issue.ownerId],
        issue.code,
        'Repair the Action/State/Navigation/Permission reference before export.',
      ),
    );
  }

  return diagnostics;
}

function toCanonicalIrInput(source: ParsedExportIRSource) {
  return {
    schemaVersion: 1 as const,
    project: source.project,
    documents: source.documents,
    routes: source.routes,
    navigations: source.navigations,
    dataSources: source.dataSources,
    dataSchemas: source.dataSchemas,
    queries: source.queries,
    states: source.states,
    actionGraphs: source.actionGraphs,
    formDocumentRefs: source.documents.filter(({ kind }) => kind === 'form').map(({ id }) => id),
    roles: source.roles,
    permissionPolicies: source.permissionPolicies,
    theme: source.theme,
    mediaManifest: source.mediaManifest,
    requiredCapabilities: source.project.requiredCapabilities,
  };
}

export function validateElectroCraftExportIRSource(input: ElectroCraftExportIRSource): ElectroCraftExportValidationReport {
  let source: ParsedExportIRSource;
  try {
    source = parseSource(input);
  } catch (error) {
    return electroCraftExportValidationReportSchema.parse({
      schemaVersion: 1,
      status: 'blocked',
      checksum: null,
      diagnostics: [
        diagnostic(
          'INVALID_EXPORT_SOURCE',
          extractIssuePath(error),
          error instanceof Error ? error.message : 'Export source schema validation failed.',
          'Repair the invalid canonical source object before export.',
        ),
      ],
    });
  }

  const diagnostics = collectReferenceDiagnostics(source);
  if (diagnostics.length > 0) {
    return electroCraftExportValidationReportSchema.parse({
      schemaVersion: 1,
      status: 'blocked',
      checksum: null,
      diagnostics,
    });
  }

  try {
    const envelope = createElectroCraftExportIREnvelope(toCanonicalIrInput(source));
    return electroCraftExportValidationReportSchema.parse({
      schemaVersion: 1,
      status: 'ready',
      checksum: envelope.checksum,
      diagnostics: [],
    });
  } catch (error) {
    return electroCraftExportValidationReportSchema.parse({
      schemaVersion: 1,
      status: 'blocked',
      checksum: null,
      diagnostics: [
        diagnostic(
          'INVALID_EXPORT_IR',
          extractIssuePath(error),
          error instanceof Error ? error.message : 'ExportIR validation failed.',
          'Remove non-portable, target-specific, cached, AI-history, or secret-value fields before export.',
        ),
      ],
    });
  }
}

export function buildElectroCraftExportIR(input: ElectroCraftExportIRSource): ElectroCraftExportIREnvelope {
  const report = validateElectroCraftExportIRSource(input);
  if (report.status === 'blocked') {
    throw new TypeError(`ExportIR blocked: ${report.diagnostics.map(({ code }) => code).join(', ')}`);
  }
  const source = parseSource(input);
  return createElectroCraftExportIREnvelope(toCanonicalIrInput(source));
}
