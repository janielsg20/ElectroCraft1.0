export * from './contracts/app-behavior';
export {
  cloneJsonValue,
  collectNavigationRouteRefs,
  electroCraftDeepLinkDefinitionSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftNavigationDefinitionV2Schema,
  electroCraftNavigationNavigatorNodeSchema,
  electroCraftNavigationNodeSchema,
  electroCraftNavigationScreenNodeSchema,
  electroCraftNavigatorKindSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftRouteDefinitionV2Schema,
  electroCraftRouteGuardKindSchema,
  electroCraftRouteGuardSchema,
  electroCraftRouteParamDefinitionSchema,
  electroCraftRouteParamSourceSchema,
  electroCraftRouteParamValueTypeSchema,
  importElectroCraftNavigationDefinition,
  importElectroCraftRouteDefinition,
  validateElectroCraftNavigationGraph,
  type ElectroCraftDeepLinkDefinition,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationDiagnostic,
  type ElectroCraftNavigationDiagnosticCode,
  type ElectroCraftNavigationGraphInput,
  type ElectroCraftNavigationImportResult,
  type ElectroCraftNavigationNavigatorNode,
  type ElectroCraftNavigationNode,
  type ElectroCraftNavigationScreenNode,
  type ElectroCraftNavigatorKind,
  type ElectroCraftRouteDefinition,
  type ElectroCraftRouteGuard,
  type ElectroCraftRouteImportResult,
  type ElectroCraftRouteParamDefinition,
} from './navigation';
export * from './navigation/builder';
export * from './contracts/canonical-json';
export * from './contracts/capability-report';
export * from './contracts/component-definition';
export * from './contracts/data-definition';
export * from './contracts/document';
export * from './contracts/engine-payload';
export * from './contracts/export-ir';
export {
  createElectroCraftExportIR,
  createElectroCraftExportIRChecksum,
  createElectroCraftExportIREnvelope,
  electroCraftExportIrEnvelopeSchema,
  electroCraftExportIrSchema,
  serializeElectroCraftExportIR,
  serializeElectroCraftExportIREnvelope,
  verifyElectroCraftExportIREnvelope,
  type ElectroCraftExportIR,
  type ElectroCraftExportIREnvelope,
} from './navigation/export-ir';
export * from './contracts/json-value';
export * from './contracts/migration-registry';
export * from './contracts/model-ownership';
export * from './contracts/object-id';
export * from './contracts/platform-overrides';
export * from './contracts/project-definition';
export * from './contracts/project-snapshot';
export * from './contracts/query-definition';
export * from './contracts/responsive';
export * from './contracts/serialization';
export {
  canonicalNavigationDefinitionRoundTrip,
  canonicalRouteDefinitionRoundTrip,
  deserializeElectroCraftNavigationDefinition,
  deserializeElectroCraftNavigationDefinitionWithMigration,
  deserializeElectroCraftRouteDefinition,
  deserializeElectroCraftRouteDefinitionWithMigration,
  serializeElectroCraftNavigationDefinition,
  serializeElectroCraftRouteDefinition,
} from './navigation/serialization';
export * from './contracts/theme-blueprint';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/domain',
  responsibility: 'modelo canónico y contratos puros',
  dependencies: [] as const,
});

export type DomainPackageDescriptor = typeof packageDescriptor;
