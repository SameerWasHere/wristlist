import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Create a Neon-backed Drizzle client.
 *
 * Requires DATABASE_URL in the environment — will throw at runtime if missing.
 * We intentionally don't validate at import time so the schema can be imported
 * in scripts/tests that don't need a live connection.
 */
function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or your Vercel environment.",
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

/** Lazy singleton — only connects when first accessed */
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export { schema };
