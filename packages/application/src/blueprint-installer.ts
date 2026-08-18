import {
  electroCraftBlueprintPackageSchema,
  type ElectroCraftBlueprintArtifact,
  type ElectroCraftBlueprintPackage,
  type ElectroCraftObjectId,
  type ElectroCraftOriginBlueprint,
} from '@electrocraft/domain';

export interface InstalledBlueprintObject {
  objectId: ElectroCraftObjectId;
  contentHash: string;
  originBlueprint: ElectroCraftOriginBlueprint | null;
}

export interface BlueprintInstallConflict {
  objectId: ElectroCraftObjectId;
  code: 'create-object-exists' | 'replace-object-missing';
}

export interface BlueprintInstallPlan {
  schemaVersion: 1;
  packageRef: ElectroCraftOriginBlueprint;
  creates: ElectroCraftBlueprintArtifact[];
  replacements: ElectroCraftBlueprintArtifact[];
  conflicts: BlueprintInstallConflict[];
}

export interface BlueprintInstallJournal {
  schemaVersion: 1;
  packageRef: ElectroCraftOriginBlueprint;
  createdObjectRefs: ElectroCraftObjectId[];
  replacedBefore: InstalledBlueprintObject[];
  applied: boolean;
  rolledBack: boolean;
}

function packageRef(blueprint: ElectroCraftBlueprintPackage): ElectroCraftOriginBlueprint {
  return { packageId: blueprint.packageId, version: blueprint.version };
}

export class ElectroCraftBlueprintInstaller {
  readonly version: number;

  constructor(version = 1) {
    if (!Number.isInteger(version) || version <= 0) throw new TypeError('installer version must be a positive integer');
    this.version = version;
  }

  plan(blueprintInput: unknown, installedInputs: readonly InstalledBlueprintObject[]): BlueprintInstallPlan {
    const blueprint = electroCraftBlueprintPackageSchema.parse(blueprintInput);
    const installed = new Map(installedInputs.map((entry) => [entry.objectId, structuredClone(entry)] as const));
    const creates: ElectroCraftBlueprintArtifact[] = [];
    const replacements: ElectroCraftBlueprintArtifact[] = [];
    const conflicts: BlueprintInstallConflict[] = [];

    for (const artifact of blueprint.artifacts) {
      const exists = installed.has(artifact.objectId);
      if (artifact.operation === 'create') {
        creates.push(artifact);
        if (exists) conflicts.push({ objectId: artifact.objectId, code: 'create-object-exists' });
      } else {
        replacements.push(artifact);
        if (!exists) conflicts.push({ objectId: artifact.objectId, code: 'replace-object-missing' });
      }
    }

    return {
      schemaVersion: 1,
      packageRef: packageRef(blueprint),
      creates,
      replacements,
      conflicts,
    };
  }

  apply(
    plan: BlueprintInstallPlan,
    store: Map<ElectroCraftObjectId, InstalledBlueprintObject>,
  ): BlueprintInstallJournal {
    if (plan.conflicts.length > 0) throw new TypeError('blueprint install plan contains unresolved conflicts');
    const replacedBefore: InstalledBlueprintObject[] = [];
    const createdObjectRefs: ElectroCraftObjectId[] = [];

    for (const artifact of plan.replacements) {
      const current = store.get(artifact.objectId);
      if (!current) throw new TypeError(`replacement target disappeared: ${artifact.objectId}`);
      replacedBefore.push(structuredClone(current));
      store.set(artifact.objectId, {
        objectId: artifact.objectId,
        contentHash: artifact.contentHash,
        originBlueprint: structuredClone(plan.packageRef),
      });
    }

    for (const artifact of plan.creates) {
      if (store.has(artifact.objectId))
        throw new TypeError(`create target appeared during install: ${artifact.objectId}`);
      createdObjectRefs.push(artifact.objectId);
      store.set(artifact.objectId, {
        objectId: artifact.objectId,
        contentHash: artifact.contentHash,
        originBlueprint: structuredClone(plan.packageRef),
      });
    }

    return {
      schemaVersion: 1,
      packageRef: structuredClone(plan.packageRef),
      createdObjectRefs,
      replacedBefore,
      applied: true,
      rolledBack: false,
    };
  }

  rollback(journal: BlueprintInstallJournal, store: Map<ElectroCraftObjectId, InstalledBlueprintObject>): void {
    if (!journal.applied || journal.rolledBack) throw new TypeError('blueprint journal cannot be rolled back');
    for (const ref of journal.createdObjectRefs) store.delete(ref);
    for (const previous of journal.replacedBefore) store.set(previous.objectId, structuredClone(previous));
    journal.rolledBack = true;
  }
}
