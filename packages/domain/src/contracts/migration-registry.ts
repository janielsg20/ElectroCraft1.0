export interface ElectroCraftMigrationStep {
  id: string;
  fromVersion: number;
  toVersion: number;
  migrate(input: unknown): unknown;
}

export interface ElectroCraftMigrationResult {
  value: unknown;
  fromVersion: number;
  toVersion: number;
  appliedStepIds: string[];
}

export class ElectroCraftMigrationRegistry {
  readonly #steps = new Map<number, ElectroCraftMigrationStep>();

  register(step: ElectroCraftMigrationStep): void {
    if (!Number.isInteger(step.fromVersion) || !Number.isInteger(step.toVersion)) {
      throw new TypeError('migration versions must be integers');
    }
    if (step.fromVersion < 0 || step.toVersion !== step.fromVersion + 1) {
      throw new TypeError('migration registry only accepts sequential version steps');
    }
    if (!step.id.trim()) throw new TypeError('migration step id cannot be empty');
    if (this.#steps.has(step.fromVersion)) {
      throw new TypeError(`migration step from v${step.fromVersion} is already registered`);
    }
    this.#steps.set(step.fromVersion, step);
  }

  hasStep(fromVersion: number): boolean {
    return this.#steps.has(fromVersion);
  }

  migrate(input: unknown, fromVersion: number, targetVersion: number): ElectroCraftMigrationResult {
    if (!Number.isInteger(fromVersion) || !Number.isInteger(targetVersion)) {
      throw new TypeError('migration versions must be integers');
    }
    if (fromVersion > targetVersion) {
      throw new TypeError('migration registry does not perform downgrade migrations');
    }

    let currentVersion = fromVersion;
    let value = structuredClone(input);
    const appliedStepIds: string[] = [];

    while (currentVersion < targetVersion) {
      const step = this.#steps.get(currentVersion);
      if (!step) throw new TypeError(`missing migration step from v${currentVersion}`);
      value = step.migrate(structuredClone(value));
      currentVersion = step.toVersion;
      appliedStepIds.push(step.id);
    }

    return {
      value,
      fromVersion,
      toVersion: currentVersion,
      appliedStepIds,
    };
  }
}
