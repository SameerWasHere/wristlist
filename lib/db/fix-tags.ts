/**
 * One-time script to fix incorrect tags in the live database.
 * Run with: npx tsx lib/db/fix-tags.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchReferences } from "./schema";
import { eq, and, ilike } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface Fix {
  brand: string;
  reference: string;
  field: string;
  oldValue: string;
  newValue: string;
}

const FIXES: Fix[] = [
  // Movement: Spring Drive watches incorrectly tagged as automatic
  { brand: "Grand Seiko", reference: "SBGA211", field: "movement", oldValue: "automatic", newValue: "spring drive" },
  { brand: "Grand Seiko", reference: "SBGE257", field: "movement", oldValue: "automatic", newValue: "spring drive" },
  { brand: "Seiko", reference: "SNR029", field: "movement", oldValue: "automatic", newValue: "spring drive" },

  // Material: gold → specific gold type
  { brand: "Rolex", reference: "228235", field: "material", oldValue: "gold", newValue: "rose gold" },
  { brand: "Patek Philippe", reference: "5227R-001", field: "material", oldValue: "gold", newValue: "rose gold" },
  { brand: "A. Lange & Sohne", reference: "380.032", field: "material", oldValue: "gold", newValue: "white gold" },
  { brand: "A. Lange & Sohne", reference: "191.032", field: "material", oldValue: "gold", newValue: "white gold" },
  { brand: "A. Lange & Sohne", reference: "235.032", field: "material", oldValue: "gold", newValue: "white gold" },
  { brand: "Vacheron Constantin", reference: "85180/000R-9248", field: "material", oldValue: "gold", newValue: "rose gold" },
  { brand: "Breguet", reference: "5177BR/15/9V6", field: "material", oldValue: "gold", newValue: "rose gold" },

  // Case back fixes
  { brand: "Cartier", reference: "WSSA0018", field: "caseBack", oldValue: "solid", newValue: "display" },
  { brand: "Junghans", reference: "027/4731.00", field: "caseBack", oldValue: "solid", newValue: "display" },

  // Category fix
  { brand: "Shinola", reference: "S0120169414", field: "category", oldValue: "dress", newValue: "chronograph" },

  // Origin fixes
  { brand: "Baltic", reference: "AQUA-BLK-CRM", field: "origin", oldValue: "Swiss", newValue: "French" },
  { brand: "Baltic", reference: "HMS-002-S-BLU", field: "origin", oldValue: "Swiss", newValue: "French" },
  { brand: "Lorier", reference: "NEP-V-BLK", field: "origin", oldValue: "Swiss", newValue: "American" },
];

async function main() {
  console.log(`Applying ${FIXES.length} tag fixes...`);

  let applied = 0;
  let skipped = 0;

  for (const fix of FIXES) {
    // Find the watch by brand + reference (case-insensitive)
    const [existing] = await db
      .select()
      .from(watchReferences)
      .where(
        and(
          ilike(watchReferences.brand, fix.brand),
          eq(watchReferences.reference, fix.reference),
        ),
      )
      .limit(1);

    if (!existing) {
      console.log(`  SKIP: ${fix.brand} ${fix.reference} — not found in database`);
      skipped++;
      continue;
    }

    const currentValue = (existing as Record<string, unknown>)[fix.field];
    if (currentValue === fix.newValue) {
      console.log(`  SKIP: ${fix.brand} ${fix.reference} — ${fix.field} already "${fix.newValue}"`);
      skipped++;
      continue;
    }

    await db
      .update(watchReferences)
      .set({ [fix.field]: fix.newValue })
      .where(eq(watchReferences.id, existing.id));

    console.log(`  FIXED: ${fix.brand} ${fix.reference} — ${fix.field}: "${currentValue}" → "${fix.newValue}"`);
    applied++;
  }

  console.log(`\nDone. ${applied} fixed, ${skipped} skipped.`);
}

main().catch(console.error);
