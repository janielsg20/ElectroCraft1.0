import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftActionGraphSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
} from '@electrocraft/domain';

function read(path: string): string {
  return readFileSync(resolve(path), 'utf8');
}

function fixture(name: string): unknown {
  return JSON.parse(read(`tooling/fixtures/canonical-model/${name}.json`)) as unknown;
}

describe('M02.4 behavior ownership boundaries', () => {
  it('keeps domain independent from Rete, Zustand, routers, Refine and Expo', () => {
    const source = read('packages/domain/src/contracts/app-behavior.ts');
    for (const forbidden of ['rete', 'zustand', 'react-router', 'expo-router', '@refinedev', 'ai']) {
      expect(source).not.toContain(`from '${forbidden}`);
      expect(source).not.toContain(`from "${forbidden}`);
    }
  });

  it('keeps engine/runtime objects out of canonical persisted contracts', () => {
    const action = fixture('action-graph-v1') as Record<string, unknown>;
    const state = fixture('state-v1') as Record<string, unknown>;
    const route = fixture('route-v1') as Record<string, unknown>;

    expect(electroCraftActionGraphSchema.safeParse({ ...action, nodeEditor: {} }).success).toBe(false);
    expect(electroCraftStateDefinitionSchema.safeParse({ ...state, store: {} }).success).toBe(false);
    expect(electroCraftRouteDefinitionSchema.safeParse({ ...route, loader: 'runtime callback' }).success).toBe(false);
  });

  it('keeps permission policy declarative instead of persisting executable guards', () => {
    const policy = fixture('permission-policy-v1') as Record<string, unknown>;
    expect(electroCraftPermissionPolicySchema.safeParse({ ...policy, predicate: '() => true' }).success).toBe(false);
  });

  it('documents Action, State, Navigation and Permission ownership in Spanish help', () => {
    const help = read('.ai/HELP_ARCHITECTURE_MODELS.md');
    expect(help).toContain('Action');
    expect(help).toContain('State');
    expect(help).toContain('Navigation');
    expect(help).toContain('Permission');
  });
});
