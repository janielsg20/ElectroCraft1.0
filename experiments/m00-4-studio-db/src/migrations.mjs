import { sql } from "drizzle-orm";
import { MIGRATION_STATEMENTS } from "./physical-contract.mjs";

export async function applyStudioMigrations(db) {
  for (const statement of MIGRATION_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
}
