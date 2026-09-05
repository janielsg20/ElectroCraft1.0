import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('M08.11 relation architecture boundary', () => {
  it('keeps one physical relation_edges store and routes it through the internal adapter', () => {
    const schema = readFileSync(resolve('packages/data-web/src/schema.ts'), 'utf8');
    const relationRepository = readFileSync(resolve('packages/data-web/src/internal-relation-repository.ts'), 'utf8');
    const adapter = readFileSync(resolve('packages/connectors/src/internal-data-source-adapter.ts'), 'utf8');
    const runtime = readFileSync(resolve('apps/studio/src/features/data/data-model-runtime.ts'), 'utf8');

    expect(schema.match(/pgTable\(\s*'relation_edges'/g)).toHaveLength(1);
    expect(relationRepository).toContain('createDrizzleInternalRelationRepository');
    expect(relationRepository).toContain('validateCardinality');
    expect(relationRepository).toContain('prepareRecordDelete');
    expect(adapter).toContain('parseRelationResourceId');
    expect(adapter).toContain("'relations'");
    expect(runtime).toContain('dataSourceWorkspaceRuntime.registry');
    expect(runtime).not.toMatch(/@electric-sql\/pglite|drizzle-orm/);
  });

  it('exposes the exact Spanish model UI instead of a placeholder', () => {
    const workspace = readFileSync(resolve('apps/studio/src/features/data/data-models-workspace.tsx'), 'utf8');
    const editor = readFileSync(resolve('apps/studio/src/features/data/relation-editor.tsx'), 'utf8');

    expect(workspace).toContain('<TabsTrigger value="relations">Relaciones</TabsTrigger>');
    expect(workspace).toContain('<RelationEditor');
    for (const copy of [
      'Relaciones',
      'Origen',
      'Tipo',
      'Destino',
      'Inverso',
      'Integridad',
      'Permisos',
      'Registro de origen',
      'Registro de destino',
    ]) {
      expect(editor).toContain(copy);
    }
    expect(editor).toContain('relation_edges');
  });
});
