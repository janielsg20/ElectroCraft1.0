import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../schema.mjs";
import { applyStudioMigrations } from "../migrations.mjs";

export async function createBrowserStudioDbClient() {
  const client = new PGliteWorker(new Worker(
    new URL("./studio-db.worker.mjs", import.meta.url),
    { type: "module" },
  ));
  await client.waitReady;
  const db = drizzle(client, { schema });
  await applyStudioMigrations(db);
  return {
    client,
    db,
    close: () => client.close(),
  };
}
