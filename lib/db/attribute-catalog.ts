import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, isNull } from "drizzle-orm";
import { watchReferences, watchFamilies, users } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function attributeCatalog() {
  // Find Sameer's user ID
  const [sameer] = await db
    .select()
    .from(users)
    .where(eq(users.username, "sameer"))
    .limit(1);

  if (!sameer) {
    // Try to find any user with "sameer" in username
    const allUsers = await db.select().from(users).limit(10);
    console.log("Available users:", allUsers.map(u => `${u.username} (id: ${u.id})`));
    console.log("No 'sameer' user found. Update the username in this script.");
    return;
  }

  console.log(`Found user @${sameer.username} (id: ${sameer.id})`);

  // Attribute all unattributed watch references to Sameer
  const refResult = await db
    .update(watchReferences)
    .set({ createdBy: sameer.id })
    .where(isNull(watchReferences.createdBy));

  console.log("Updated watch references with createdBy");

  // Mark all as NOT community submitted (they're founder-curated)
  await db
    .update(watchReferences)
    .set({ isCommunitySubmitted: false })
    .where(eq(watchReferences.createdBy, sameer.id));

  console.log("Marked founder entries as curated (not community submitted)");

  // Also attribute families
  // watchFamilies doesn't have createdBy, but the references do
  // The watch page will show the contributor from the reference

  console.log("Done! All catalog entries attributed to @" + sameer.username);
}

attributeCatalog().catch(console.error);
