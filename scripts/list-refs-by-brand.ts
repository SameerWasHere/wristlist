/**
 * List every reference in the DB grouped by brand, so we can decide which
 * ones deserve a community nickname. Read-only.
 *
 *   npx tsx scripts/list-refs-by-brand.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb, schema } from "@/lib/db";

async function main() {
  const db = getDb();
  const refs = await db.select().from(schema.watchReferences);

  const byBrand = new Map<string, typeof refs>();
  for (const r of refs) {
    const b = r.brand.trim();
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b)!.push(r);
  }

  const sortedBrands = [...byBrand.keys()].sort();
  for (const brand of sortedBrands) {
    const list = byBrand.get(brand)!;
    console.log(`\n=== ${brand} (${list.length}) ===`);
    list
      .sort((a, b) => (a.reference || "").localeCompare(b.reference || ""))
      .forEach((r) => {
        const nn = r.variantName ? ` "${r.variantName}"` : "";
        const color = r.color ? `  [${r.color}]` : "";
        console.log(`  ${r.reference.padEnd(24)}  ${r.model}${nn}${color}`);
      });
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
