// @ts-check

/** @param {string} id */
export function phaseNumber(id) {
  const match = /^F(\d{2})$/.exec(id);
  if (!match) throw new Error(`Invalid phase id: ${id}`);
  return Number(match[1]);
}

/**
 * @param {{phases:Array<{id:string,owner:string,dependsOn:string[]}>}} graph
 */
export function validatePhaseGraph(graph) {
  const errors = [];
  const ids = graph.phases.map((phase) => phase.id);
  const unique = new Set(ids);
  if (graph.phases.length !== 28) errors.push(`Expected 28 phases, got ${graph.phases.length}`);
  if (unique.size !== graph.phases.length) errors.push('Duplicate phase id.');

  for (let index = 0; index < 28; index += 1) {
    const expected = `F${String(index).padStart(2, '0')}`;
    if (!unique.has(expected)) errors.push(`Missing phase ${expected}`);
  }

  for (const phase of graph.phases) {
    if (!phase.owner.trim()) errors.push(`${phase.id} has no owner.`);
    const current = phaseNumber(phase.id);
    for (const dependency of phase.dependsOn) {
      if (!unique.has(dependency)) errors.push(`${phase.id} depends on unknown ${dependency}`);
      else if (phaseNumber(dependency) >= current) errors.push(`${phase.id} dependency ${dependency} does not point backward.`);
    }
  }
  return errors;
}

/** @param {{phases:Array<{id:string,dependsOn:string[]}>}} graph */
export function validateCriticalOrder(graph) {
  const byId = new Map(graph.phases.map((phase) => [phase.id, phase]));
  const errors = [];
  const f08 = byId.get('F08');
  const f09 = byId.get('F09');
  const f15 = byId.get('F15');
  if (!f08?.dependsOn.includes('F07')) errors.push('F08 must depend on F07 Navigation.');
  if (!f09?.dependsOn.includes('F08')) errors.push('F09 must depend on F08 Data Sources.');
  if (!f15?.dependsOn.includes('F08')) errors.push('F15 Administration must depend on F08 Data Sources.');
  return errors;
}

/**
 * @typedef {{id:string,decision:string,allowedCapabilities?:string[],forbidden?:string[]}} EngineDecision
 * @typedef {{id:string,reason:string}} RejectedAlternative
 * @typedef {{engines:EngineDecision[],targets:string[],canonicalProduct:{internalData:string,coreModels:string[],singleDocumentModel:boolean,singleExportTargetContract:boolean},rejectedAlternatives:RejectedAlternative[],eliminatedDuplications:string[]}} ArchitectureDecisions
 */

/** @param {ArchitectureDecisions} decisions */
export function validateArchitectureDecisions(decisions) {
  const errors = [];
  const requiredEngines = ['puck','shadcn-radix','ai-elements','i18next','pglite-drizzle','data-sources-gateway','rqb-tanstack-query','refine-tanstack-table','rete','tiptap','zustand','expo','ai-sdk-google','gemini-native-capability-adapter','export-targets'];
  const engineIds = new Set(decisions.engines.map((engine) => engine.id));
  for (const id of requiredEngines) if (!engineIds.has(id)) errors.push(`Missing architecture decision: ${id}`);
  if (decisions.targets.length !== 9 || new Set(decisions.targets).size !== 9) errors.push('Exactly nine unique Core targets are required.');
  if (decisions.canonicalProduct.internalData !== 'DataSourceDefinition(kind=internal)') errors.push('Internal Data must remain a Data Source.');
  if (!decisions.canonicalProduct.coreModels.includes('Screens') || !decisions.canonicalProduct.coreModels.includes('Navigation') || !decisions.canonicalProduct.coreModels.includes('Data Sources')) errors.push('Screens/Navigation/Data Sources must be Core.');
  if (!decisions.canonicalProduct.singleDocumentModel) errors.push('Single canonical document model invariant failed.');
  if (!decisions.canonicalProduct.singleExportTargetContract) errors.push('Single Export Target Contract invariant failed.');

  const gemini = decisions.engines.find((engine) => engine.id === 'gemini-native-capability-adapter');
  if (gemini?.decision !== 'accept-narrow') errors.push('Gemini native adapter must remain narrow.');
  if (gemini?.allowedCapabilities?.join(',') !== 'interactions-v1') errors.push('Gemini native adapter may own only interactions-v1 in F00 closure.');

  const rejected = new Set(decisions.rejectedAlternatives.map((item) => item.id));
  for (const id of ['craftjs','grapesjs','react-flow','full-low-code-platform']) if (!rejected.has(id)) errors.push(`Rejected alternative not documented: ${id}`);

  const duplicates = new Set(decisions.eliminatedDuplications);
  for (const id of ['parallel-screen-editor','parallel-editor-history','cms-centered-canonical-model','custom-ai-provider-abstraction','dynamic-ddl-per-logical-model','universal-crud-runtime']) if (!duplicates.has(id)) errors.push(`Eliminated duplication not documented: ${id}`);
  return errors;
}

/** @param {ArchitectureDecisions} decisions */
export function computeClosureState(decisions) {
  const conditional = decisions.engines.filter((engine) => engine.decision === 'conditional').map((engine) => engine.id);
  return conditional.length ? {state:'blocked', conditional} : {state:'ready', conditional:[]};
}
