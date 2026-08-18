import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  stableCanonicalStringify,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';
import {
  ProjectDocumentService,
  type CanonicalProjectObjectKind,
  type CanonicalProjectObjectRecord,
  type CanonicalProjectObjectRepository,
} from '@electrocraft/application';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8'),
  ) as unknown;
}

class FileProjectObjectRepository implements CanonicalProjectObjectRepository {
  constructor(readonly root: string) {
    mkdirSync(root, { recursive: true });
  }

  recordPath(kind: CanonicalProjectObjectKind, id: ElectroCraftObjectId): string {
    return join(this.root, `${kind}-${id}.json`);
  }

  async putMany(records: readonly CanonicalProjectObjectRecord[]): Promise<void> {
    for (const record of records) {
      writeFileSync(
        this.recordPath(record.kind, record.id),
        `${JSON.stringify(record)}\n`,
        'utf8',
      );
    }
  }

  async get(
    kind: CanonicalProjectObjectKind,
    id: ElectroCraftObjectId,
  ): Promise<CanonicalProjectObjectRecord | null> {
    const file = this.recordPath(kind, id);
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, 'utf8')) as CanonicalProjectObjectRecord;
  }
}

const tempRoots: string[] = [];
afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function repository(): FileProjectObjectRepository {
  const root = mkdtempSync(join(tmpdir(), 'electrocraft-m02-1-'));
  tempRoots.push(root);
  return new FileProjectObjectRepository(root);
}

describe('M02.1 canonical persistence/reopen/recovery', () => {
  it('persists and reopens the same canonical project with a fresh repository instance', async () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v1'));
    const document = electroCraftDocumentSchema.parse(fixture('screen-v1'));
    const firstRepository = repository();
    const save = await new ProjectDocumentService(firstRepository).save(project, [document]);

    expect(save).toEqual({
      status: 'saved',
      projectId: project.id,
      documentCount: 1,
    });

    const reopened = await new ProjectDocumentService(
      new FileProjectObjectRepository(firstRepository.root),
    ).reopen(project.id);

    expect(reopened.status).toBe('ready');
    if (reopened.status === 'ready') {
      expect(reopened.project).toEqual(project);
      expect(reopened.documents).toEqual([document]);
      expect(reopened.migratedDocumentIds).toEqual([]);
    }
  });

  it('fails closed when a referenced document disappears after persistence', async () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v1'));
    const document = electroCraftDocumentSchema.parse(fixture('screen-v1'));
    const repo = repository();
    await new ProjectDocumentService(repo).save(project, [document]);
    rmSync(repo.recordPath('document', document.id));

    const reopened = await new ProjectDocumentService(repo).reopen(project.id);
    expect(reopened).toEqual(
      expect.objectContaining({
        status: 'blocked',
        code: 'MISSING_DOCUMENT_REF',
        ref: document.id,
      }),
    );
  });

  it('reopens a legacy page record only through the explicit page to screen migration', async () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v1'));
    const document = electroCraftDocumentSchema.parse(fixture('screen-v1'));
    const repo = repository();
    await new ProjectDocumentService(repo).save(project, [document]);

    const legacyPage = {
      ...document,
      schemaVersion: 0,
      kind: 'page',
    };
    const record: CanonicalProjectObjectRecord = {
      kind: 'document',
      id: document.id,
      schemaVersion: 1,
      payload: stableCanonicalStringify(legacyPage),
    };
    await repo.putMany([record]);

    const reopened = await new ProjectDocumentService(repo).reopen(project.id);
    expect(reopened.status).toBe('ready');
    if (reopened.status === 'ready') {
      expect(reopened.documents[0]?.kind).toBe('screen');
      expect(reopened.migratedDocumentIds).toEqual([document.id]);
    }
  });
});
