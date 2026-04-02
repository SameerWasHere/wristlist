import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, isNull, sql } from "drizzle-orm";
import { watchReferences, watchFamilies, catalogEdits, users } from "./schema";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function attributeCommunity() {
  // Find Sameer's user ID
  const [sameer] = await db.select().from(users).where(eq(users.username, "sameer")).limit(1);
  if (!sameer) {
    console.log("No 'sameer' user found.");
    return;
  }
  console.log(`Found @${sameer.username} (id: ${sameer.id})`);

  // 1. Set createdBy on all watchFamilies
  await db.update(watchFamilies).set({ createdBy: sameer.id }).where(isNull(watchFamilies.createdBy));
  console.log("Set createdBy on all families");

  // 2. Set createdBy on all watchReferences
  await db.update(watchReferences).set({ createdBy: sameer.id }).where(isNull(watchReferences.createdBy));
  console.log("Set createdBy on all references");

  // 3. Create catalog_edits entries for all families
  const allFamilies = await db.select({ id: watchFamilies.id, createdAt: watchFamilies.createdAt }).from(watchFamilies);
  console.log(`Creating edit entries for ${allFamilies.length} families...`);

  for (const family of allFamilies) {
    await db.insert(catalogEdits).values({
      userId: sameer.id,
      targetType: "family",
      targetId: family.id,
      action: "create",
      createdAt: family.createdAt,
    }).onConflictDoNothing();
  }

  // 4. Create catalog_edits entries for all references
  const allRefs = await db.select({ id: watchReferences.id }).from(watchReferences);
  console.log(`Creating edit entries for ${allRefs.length} references...`);

  for (const ref of allRefs) {
    await db.insert(catalogEdits).values({
      userId: sameer.id,
      targetType: "reference",
      targetId: ref.id,
      action: "create",
    }).onConflictDoNothing();
  }

  // 5. Count results
  const [editCount] = await db.select({ count: sql<number>`count(*)::int` }).from(catalogEdits);
  console.log(`Total catalog edits: ${editCount.count}`);
  console.log("Done! All catalog entries attributed to @" + sameer.username);
}

attributeCommunity().catch(console.error);
