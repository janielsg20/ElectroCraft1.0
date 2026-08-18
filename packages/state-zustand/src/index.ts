import {
  electroCraftStateDefinitionSchema,
  type ElectroCraftObjectId,
  type ElectroCraftStateDefinition,
  type JsonValue,
} from '@electrocraft/domain';
import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { createStore, type StoreApi } from 'zustand/vanilla';

type RuntimeState = Record<string, JsonValue>;

type ClientPersistence = Extract<ElectroCraftStateDefinition['persistence'], 'local' | 'session'>;

export interface ElectroCraftStateRuntime {
  store: StoreApi<RuntimeState>;
  definitions: ReadonlyMap<ElectroCraftObjectId, ElectroCraftStateDefinition>;
  get(ref: ElectroCraftObjectId): JsonValue;
  set(ref: ElectroCraftObjectId, value: JsonValue): void;
  reset(ref?: ElectroCraftObjectId): void;
  getPersistableSnapshot(persistence: ClientPersistence): RuntimeState;
  hydrate(persistence: ClientPersistence, snapshot: RuntimeState): void;
}

export function createElectroCraftStateRuntime(inputs: readonly unknown[]): ElectroCraftStateRuntime {
  const definitions = inputs.map((input) => electroCraftStateDefinitionSchema.parse(input));
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition] as const));
  const initialState: RuntimeState = Object.fromEntries(
    definitions.map((definition) => [definition.id, structuredClone(definition.defaultValue)]),
  );
  const store = createStore<RuntimeState>()(() => structuredClone(initialState));

  function requireDefinition(ref: ElectroCraftObjectId): ElectroCraftStateDefinition {
    const definition = definitionsById.get(ref);
    if (!definition) throw new TypeError(`unknown ElectroCraft state ref: ${ref}`);
    return definition;
  }

  function validateRuntimeValue(definition: ElectroCraftStateDefinition, value: JsonValue): void {
    const result = electroCraftStateDefinitionSchema.safeParse({ ...definition, defaultValue: value });
    if (!result.success) throw new TypeError(`state value does not match definition: ${definition.id}`);
  }

  function get(ref: ElectroCraftObjectId): JsonValue {
    requireDefinition(ref);
    return structuredClone(store.getState()[ref]);
  }

  function set(ref: ElectroCraftObjectId, value: JsonValue): void {
    const definition = requireDefinition(ref);
    validateRuntimeValue(definition, value);
    store.setState((current) => ({ ...current, [ref]: structuredClone(value) }), true);
  }

  function reset(ref?: ElectroCraftObjectId): void {
    if (ref) {
      const definition = requireDefinition(ref);
      store.setState((current) => ({ ...current, [ref]: structuredClone(definition.defaultValue) }), true);
      return;
    }
    store.setState(structuredClone(initialState), true);
  }

  function getPersistableSnapshot(persistence: ClientPersistence): RuntimeState {
    const current = store.getState();
    return Object.fromEntries(
      definitions
        .filter((definition) => definition.persistence === persistence && !definition.sensitive)
        .map((definition) => [definition.id, structuredClone(current[definition.id])]),
    );
  }

  function hydrate(persistence: ClientPersistence, snapshot: RuntimeState): void {
    const patch: RuntimeState = {};
    for (const [ref, value] of Object.entries(snapshot)) {
      const definition = definitions.find(({ id }) => id === ref);
      if (!definition || definition.persistence !== persistence || definition.sensitive) continue;
      validateRuntimeValue(definition, value);
      patch[ref] = structuredClone(value);
    }
    store.setState((current) => ({ ...current, ...patch }), true);
  }

  return {
    store,
    definitions: definitionsById,
    get,
    set,
    reset,
    getPersistableSnapshot,
    hydrate,
  };
}

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/state-zustand',
  responsibility: 'adapter de estado runtime Zustand',
  dependencies: [dep0.name] as const,
});

export type StateZustandPackageDescriptor = typeof packageDescriptor;
