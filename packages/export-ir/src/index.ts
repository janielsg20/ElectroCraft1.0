import {
  electroCraftCapabilityAnalysisReportSchema,
  packageDescriptor as dep0,
  type ElectroCraftCapabilityAnalysisEntry,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';

export interface ElectroCraftTargetCapabilityPlan {
  target: string;
  blocked: boolean;
  capabilities: ElectroCraftCapabilityAnalysisEntry[];
}

export interface ElectroCraftCapabilityExportPlan {
  schemaVersion: 1;
  projectId: ElectroCraftObjectId;
  registryVersion: number;
  blocked: boolean;
  targets: ElectroCraftTargetCapabilityPlan[];
}

export function createCapabilityExportPlan(input: unknown): ElectroCraftCapabilityExportPlan {
  const report = electroCraftCapabilityAnalysisReportSchema.parse(input);
  const byTarget = new Map<string, ElectroCraftCapabilityAnalysisEntry[]>();

  for (const entry of report.entries) {
    const list = byTarget.get(entry.target) ?? [];
    list.push(entry);
    byTarget.set(entry.target, list);
  }

  const targets = [...byTarget.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([target, capabilities]) => ({
      target,
      blocked: capabilities.some(({ mode }) => mode === 'blocked'),
      capabilities,
    }));

  return {
    schemaVersion: 1,
    projectId: report.projectId,
    registryVersion: report.registryVersion,
    blocked: targets.some(({ blocked }) => blocked),
    targets,
  };
}

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/export-ir',
  responsibility: 'contrato ExportIR neutral a targets',
  dependencies: [dep0.name] as const,
});

export type ExportIrPackageDescriptor = typeof packageDescriptor;
