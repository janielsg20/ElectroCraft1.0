import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as z from 'zod';
import { describe, expect, it } from 'vitest';
import {
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  validateProjectDocumentReferences,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.1 canonical model boundaries', () => {
  it('keeps documents as object references instead of embedding them in ProjectDefinition', () => {
    const schema = z.toJSONSchema(electroCraftProjectDefinitionSchema) as {
      additionalProperties?: boolean;
      properties?: Record<string, unknown>;
    };

    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties).toHaveProperty('documentRefs');
    expect(schema.properties).toHaveProperty('dataSourceRefs');
    expect(schema.properties).toHaveProperty('requiredCapabilities');
    expect(schema.properties).not.toHaveProperty('documents');
    expect(schema.properties).not.toHaveProperty('capabilityRegistry');
  });

  it('fails closed when a referenced document is missing', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const diagnostics = validateProjectDocumentReferences(project, []);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'missing-document-ref',
          ref: 'ec_document_0000000000002',
        }),
      ]),
    );
  });

  it('rejects Puck/AppState internals as canonical document keys', () => {
    const document = fixture('screen-v3') as Record<string, unknown>;
    const result = electroCraftDocumentSchema.safeParse({
      ...document,
      appState: { content: [] },
    });

    expect(result.success).toBe(false);
  });

  it('keeps domain free of editor/storage/runtime imports', () => {
    const files = [
      'packages/domain/src/contracts/document.ts',
      'packages/domain/src/contracts/project-definition.ts',
      'packages/domain/src/contracts/data-definition.ts',
      'packages/domain/src/contracts/query-definition.ts',
      'packages/domain/src/contracts/theme-blueprint.ts',
      'packages/domain/src/contracts/serialization.ts',
    ];
    const source = files.map((file) => readFileSync(resolve(file), 'utf8')).join('\n');
    const forbiddenImport =
      /from ['"](?:@puckeditor\/core|@react-querybuilder\/core|react(?:\/[^'"]*)?|drizzle-orm(?:\/[^'"]*)?|node:fs|node:path)['"]/;

    expect(source).not.toMatch(forbiddenImport);
  });
});
