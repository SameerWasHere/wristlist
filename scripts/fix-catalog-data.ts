/**
 * One-shot catalog fixup:
 *   1. Sync every reference's brand + model to its parent family
 *      (fixes "Submariner Date" under "Submariner" family, etc.)
 *   2. Backfill variantName for famous known nicknames
 *
 * Does NOT delete anything. Duplicates and empty families are left alone so
 * the user can review them manually.
 *
 *   npx tsx scripts/fix-catalog-data.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const NICKNAMES: Array<{ ref: string; name: string }> = [
  // Rolex
  { ref: "126710BLNR", name: "Batman" },
  { ref: "126710BLRO", name: "Pepsi" },
  { ref: "126719BLRO", name: "Pepsi (WG)" },
  { ref: "126720VTNR", name: "Sprite" },
  { ref: "126711CHNR", name: "Root Beer" },
  { ref: "116710BLNR", name: "Batman (prev.)" },
  { ref: "116710LN", name: "GMT (black)" },
  { ref: "116610LV", name: "Hulk" },
  { ref: "126610LV", name: "Starbucks" },
  { ref: "116598SACO", name: "Leopard" },
  { ref: "16610LV", name: "Kermit" },
  { ref: "116613LB", name: "Bluesy" },
  { ref: "116613LN", name: "Two-Tone Sub" },
  // Grand Seiko / Seiko
  { ref: "SPB121", name: "Alpinist" },
  { ref: "SBGA413", name: "Shunbun" },
  { ref: "SBGA211", name: "Snowflake" },
  { ref: "SLGH005", name: "White Birch" },
  { ref: "SLGW003", name: "White Birch Bark" },
  { ref: "SLA021", name: "62MAS Reissue" },
  // Tudor
  { ref: "M79030N", name: "BB58 Black" },
  { ref: "M79030B", name: "BB58 Blue" },
  { ref: "M7941A1A0RU", name: "Pelagos 39" },
  // Omega
  { ref: "310.30.42.50.01.001", name: "Moonwatch (Hesalite)" },
  { ref: "311.30.42.30.01.005", name: "Speedmaster Silver Snoopy" },
];

async function main() {
  const db = getDb();

  // ---- Load ----
  const families = await db.select().from(schema.watchFamilies);
  const refs = await db.select().from(schema.watchReferences);
  const familyById = new Map(families.map((f) => [f.id, f]));

  console.log(`Loaded ${families.length} families, ${refs.length} references`);

  // ---- 1. Sync brand + model to parent family ----
  let brandSynced = 0;
  let modelSynced = 0;
  for (const r of refs) {
    if (!r.familyId) continue;
    const fam = familyById.get(r.familyId);
    if (!fam) continue;

    const updates: { brand?: string; model?: string } = {};
    if (r.brand.trim() !== fam.brand.trim()) updates.brand = fam.brand;
    if (r.model.trim() !== fam.model.trim()) updates.model = fam.model;

    if (Object.keys(updates).length === 0) continue;
    await db.update(schema.watchReferences).set(updates).where(eq(schema.watchReferences.id, r.id));
    if (updates.brand) brandSynced++;
    if (updates.model) modelSynced++;
    console.log(
      `  synced id=${r.id} ${r.reference}:  ${r.brand}/${r.model}  ->  ${fam.brand}/${fam.model}`,
    );
  }
  console.log(`\nBrand syncs: ${brandSynced}, Model syncs: ${modelSynced}`);

  // ---- 2. Backfill nicknames ----
  let nicksSet = 0;
  for (const { ref: refCode, name } of NICKNAMES) {
    const row = refs.find((r) => r.reference?.toUpperCase() === refCode.toUpperCase());
    if (!row) continue;
    if (row.variantName) continue; // don't override user-set names
    await db
      .update(schema.watchReferences)
      .set({ variantName: name })
      .where(eq(schema.watchReferences.id, row.id));
    console.log(`  nickname ${row.brand} ${row.reference} = "${name}"`);
    nicksSet++;
  }
  console.log(`\nNicknames set: ${nicksSet}`);

  // ---- 3. Report (not fix) potentially problematic state ----
  console.log(`\n===== FOR YOUR MANUAL REVIEW =====`);

  // Duplicate brand+reference combos
  const byBrandRef = new Map<string, typeof refs>();
  refs.forEach((r) => {
    const k = `${r.brand.toLowerCase().trim()}|${r.reference?.toLowerCase().trim()}`;
    if (!byBrandRef.has(k)) byBrandRef.set(k, []);
    byBrandRef.get(k)!.push(r);
  });
  const dups = [...byBrandRef.entries()].filter(([, v]) => v.length > 1);
  if (dups.length > 0) {
    console.log(`\n  ${dups.length} duplicate (brand, reference) combos — consider flagging for deletion:`);
    dups.forEach(([k, rows]) => {
      console.log(`    ${k}:`);
      rows.forEach((r) => console.log(`      id=${r.id}  model="${r.model}"  familyId=${r.familyId}  imageUrl=${r.imageUrl ? "yes" : "no"}`));
    });
  }

  // Empty families
  const variationCountByFamily = new Map<number, number>();
  refs.forEach((r) => { if (r.familyId) variationCountByFamily.set(r.familyId, (variationCountByFamily.get(r.familyId) || 0) + 1); });
  const emptyFams = families.filter((f) => !variationCountByFamily.get(f.id));
  if (emptyFams.length > 0) {
    console.log(`\n  ${emptyFams.length} families with 0 variations — consider merging or deleting:`);
    emptyFams.forEach((f) => console.log(`    id=${f.id}  ${f.brand} ${f.model}  slug=${f.slug}`));
  }

  console.log(`\n===== DONE =====\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
