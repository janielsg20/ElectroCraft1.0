import { createHash } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { MIGRATION_STATEMENTS } from "../../m00-4-studio-db/src/physical-contract.mjs";

export const PROJECT_ID = "m00-5-query-poc";

const records = [
  { id: "article-001", modelId: "article", data: { category: "power", title: "Power Bank 20K", description: "USB-C battery pack", price: 79.99 } },
  { id: "article-002", modelId: "article", data: { category: "cables", title: "USB-C Cable", description: "Braided cable", price: 14.99 } },
  { id: "article-003", modelId: "article", data: { category: "cables", title: "Power Cable", description: "AC power cable", price: 19.99 } },
  { id: "customer-001", modelId: "customer", data: { vip: true, name: "Ana", city: "Houston" } },
  { id: "customer-002", modelId: "customer", data: { vip: false, name: "Luis", city: "Austin" } },
];

export async function createStudioClient(dataDir) {
  const client = dataDir ? new PGlite(dataDir) : new PGlite();
  await client.waitReady;
  for (const statement of MIGRATION_STATEMENTS) await client.query(statement);
  return client;
}

async function insertRecord(client, record) {
  await client.query(
    `INSERT INTO content_records (id, project_id, model_id, data, state) VALUES ($1, $2, $3, $4::jsonb, 'published') ON CONFLICT (project_id, id) DO UPDATE SET model_id = EXCLUDED.model_id, data = EXCLUDED.data, updated_at = now()`,
    [record.id, PROJECT_ID, record.modelId, JSON.stringify(record.data)],
  );
}

async function insertIndex(client, { modelId, recordId, fieldId, valueKind, textValue = null, booleanValue = null }) {
  await client.query(
    `INSERT INTO record_field_index (project_id, model_id, record_id, field_id, ordinal, value_kind, text_value, boolean_value, faceted) VALUES ($1, $2, $3, $4, 0, $5, $6, $7, true) ON CONFLICT (project_id, record_id, field_id, ordinal) DO UPDATE SET value_kind = EXCLUDED.value_kind, text_value = EXCLUDED.text_value, boolean_value = EXCLUDED.boolean_value, faceted = true`,
    [PROJECT_ID, modelId, recordId, fieldId, valueKind, textValue, booleanValue],
  );
}

export async function seedStudioFixture(client) {
  await client.query(
    `INSERT INTO projects (id, name, status, metadata) VALUES ($1, $2, 'active', '{}'::jsonb) ON CONFLICT (id) DO NOTHING`,
    [PROJECT_ID, "M00.5 Query POC"],
  );
  for (const record of records) await insertRecord(client, record);
  await insertIndex(client, { modelId: "article", recordId: "article-001", fieldId: "category", valueKind: "text", textValue: "power" });
  await insertIndex(client, { modelId: "article", recordId: "article-002", fieldId: "category", valueKind: "text", textValue: "cables" });
  await insertIndex(client, { modelId: "article", recordId: "article-003", fieldId: "category", valueKind: "text", textValue: "cables" });
  await insertIndex(client, { modelId: "customer", recordId: "customer-001", fieldId: "vip", valueKind: "boolean", booleanValue: true });
  await insertIndex(client, { modelId: "customer", recordId: "customer-002", fieldId: "vip", valueKind: "boolean", booleanValue: false });
}

export async function saveQueryDefinition(client, definition) {
  const payload = JSON.stringify(definition);
  const checksum = createHash("sha256").update(payload).digest("hex");
  await client.query(
    `INSERT INTO project_objects (project_id, object_id, kind, version, payload, checksum) VALUES ($1, $2, 'query-definition', $3, $4::jsonb, $5) ON CONFLICT (project_id, object_id) DO UPDATE SET version = EXCLUDED.version, payload = EXCLUDED.payload, checksum = EXCLUDED.checksum, updated_at = now()`,
    [PROJECT_ID, definition.id, definition.version, payload, checksum],
  );
  return checksum;
}

export async function loadQueryDefinition(client, id) {
  const result = await client.query(`SELECT payload, checksum FROM project_objects WHERE project_id = $1 AND object_id = $2`, [PROJECT_ID, id]);
  return result.rows[0] ?? null;
}
