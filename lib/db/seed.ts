import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchReferences } from "./schema";
import { SEED_WATCHES } from "./seed-data";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding watch references...");

  for (const w of SEED_WATCHES) {
    await db.insert(watchReferences).values(w).onConflictDoNothing();
  }

  console.log(`Seeded ${SEED_WATCHES.length} watches.`);
}

seed().catch(console.error);
