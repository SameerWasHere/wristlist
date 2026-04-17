/**
 * Audit the catalog for data issues: orphaned references, missing specs,
 * refs whose brand/model doesn't match their parent family, missing variant
 * names on famous watches, etc. Read-only.
 *
 *   npx tsx scripts/audit-db.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb, schema } from "@/lib/db";

async function main() {
  const db = getDb();

  const families = await db.select().from(schema.watchFamilies);
  const refs = await db.select().from(schema.watchReferences);

  console.log(`\n===== CATALOG SUMMARY =====`);
  console.log(`Families: ${families.length}`);
  console.log(`References: ${refs.length}`);

  // 1. References missing key specs (the 12 we show in the UI)
  const specFields = [
    "movement", "category", "material", "bezelType", "braceletType",
    "shape", "color", "crystal", "origin", "caseBack", "sizeMm", "waterResistanceM",
  ] as const;
  const incompleteRefs = refs.map((r) => {
    const missing = specFields.filter((f) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = (r as any)[f];
      return v == null || v === "";
    });
    return { ref: r, missing };
  }).filter((x) => x.missing.length > 0);

  console.log(`\n===== REFERENCES MISSING SPECS (${incompleteRefs.length}/${refs.length}) =====`);
  const sorted = incompleteRefs.sort((a, b) => b.missing.length - a.missing.length);
  for (const { ref, missing } of sorted.slice(0, 25)) {
    console.log(
      `  [${missing.length}/12] ${ref.brand} ${ref.model} ${ref.reference}` +
        `  — missing: ${missing.join(", ")}`,
    );
  }
  if (sorted.length > 25) {
    console.log(`  ... and ${sorted.length - 25} more`);
  }

  // 2. Orphans: refs with familyId that doesn't exist
  const familyIdSet = new Set(families.map((f) => f.id));
  const orphans = refs.filter((r) => r.familyId != null && !familyIdSet.has(r.familyId));
  console.log(`\n===== ORPHAN REFERENCES (${orphans.length}) =====`);
  orphans.slice(0, 10).forEach((r) => {
    console.log(`  ${r.brand} ${r.model} ${r.reference}  (familyId=${r.familyId})`);
  });

  // 3. References with no familyId at all
  const noFamily = refs.filter((r) => r.familyId == null);
  console.log(`\n===== REFERENCES WITH NO PARENT FAMILY (${noFamily.length}) =====`);
  noFamily.slice(0, 15).forEach((r) => {
    console.log(`  id=${r.id}  ${r.brand} ${r.model} ${r.reference}`);
  });

  // 4. Brand/model mismatch between ref and its family
  const familyById = new Map(families.map((f) => [f.id, f]));
  const mismatched = refs.filter((r) => {
    if (!r.familyId) return false;
    const fam = familyById.get(r.familyId);
    if (!fam) return false;
    return (
      r.brand.trim().toLowerCase() !== fam.brand.trim().toLowerCase() ||
      r.model.trim().toLowerCase() !== fam.model.trim().toLowerCase()
    );
  });
  console.log(`\n===== BRAND/MODEL MISMATCHED WITH PARENT FAMILY (${mismatched.length}) =====`);
  mismatched.slice(0, 15).forEach((r) => {
    const fam = familyById.get(r.familyId!);
    console.log(
      `  ref: ${r.brand} / ${r.model} / ${r.reference}\n  fam: ${fam!.brand} / ${fam!.model}`,
    );
  });

  // 5. Families with no variations
  const variationCountByFamily = new Map<number, number>();
  refs.forEach((r) => {
    if (r.familyId) variationCountByFamily.set(r.familyId, (variationCountByFamily.get(r.familyId) || 0) + 1);
  });
  const emptyFamilies = families.filter((f) => !variationCountByFamily.get(f.id));
  console.log(`\n===== FAMILIES WITH NO VARIATIONS (${emptyFamilies.length}) =====`);
  emptyFamilies.slice(0, 15).forEach((f) => {
    console.log(`  id=${f.id}  ${f.brand} ${f.model}  slug=${f.slug}`);
  });

  // 6. Well-known references that should probably have a nickname
  const knownNicknames: Array<{ ref: string; name: string }> = [
    { ref: "126710BLNR", name: "Batman" },
    { ref: "126710BLRO", name: "Pepsi" },
    { ref: "126719BLRO", name: "Pepsi (WG)" },
    { ref: "126720VTNR", name: "Sprite" },
    { ref: "116610LV", name: "Hulk" },
    { ref: "126610LV", name: "Starbucks" },
    { ref: "116598SACO", name: "Leopard" },
    { ref: "16610LV", name: "Kermit" },
    { ref: "116613LB", name: "Bluesy" },
    { ref: "SPB121", name: "Alpinist" },
    { ref: "SBGA413", name: "Shunbun" },
    { ref: "SLGH005", name: "White Birch" },
  ];
  console.log(`\n===== FAMOUS REFS MISSING NICKNAME =====`);
  for (const { ref: refCode, name } of knownNicknames) {
    const row = refs.find((r) => r.reference?.toUpperCase() === refCode.toUpperCase());
    if (row && !row.variantName) {
      console.log(`  ${row.brand} ${row.model} ${row.reference}  — suggested: "${name}"`);
    }
  }

  // 7. Duplicate (brand, reference) combos
  const byBrandRef = new Map<string, typeof refs>();
  refs.forEach((r) => {
    const k = `${r.brand.toLowerCase().trim()}|${r.reference?.toLowerCase().trim()}`;
    if (!byBrandRef.has(k)) byBrandRef.set(k, []);
    byBrandRef.get(k)!.push(r);
  });
  const dupGroups = [...byBrandRef.entries()].filter(([, v]) => v.length > 1);
  console.log(`\n===== DUPLICATE (brand, reference) COMBOS (${dupGroups.length}) =====`);
  dupGroups.slice(0, 10).forEach(([k, rows]) => {
    console.log(`  ${k}`);
    rows.forEach((r) => console.log(`    id=${r.id}  model="${r.model}"  familyId=${r.familyId}`));
  });

  // 8. Completeness stats by brand
  const byBrand = new Map<string, { total: number; complete: number }>();
  refs.forEach((r) => {
    const brand = r.brand.trim();
    if (!byBrand.has(brand)) byBrand.set(brand, { total: 0, complete: 0 });
    const b = byBrand.get(brand)!;
    b.total++;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allFilled = specFields.every((f) => (r as any)[f] != null && (r as any)[f] !== "");
    if (allFilled) b.complete++;
  });
  console.log(`\n===== COMPLETENESS BY BRAND (top 25 by count) =====`);
  const brandStats = [...byBrand.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 25);
  brandStats.forEach(([brand, s]) => {
    const pct = Math.round((s.complete / s.total) * 100);
    console.log(`  ${brand.padEnd(25)}  ${s.complete}/${s.total} complete  (${pct}%)`);
  });

  // 9. Image + nickname coverage
  const withImg = refs.filter((r) => r.imageUrl).length;
  const withVariantName = refs.filter((r) => r.variantName).length;
  console.log(`\n===== COVERAGE =====`);
  console.log(`  Images:     ${withImg}/${refs.length}  (${Math.round((withImg / refs.length) * 100)}%)`);
  console.log(`  Nicknames:  ${withVariantName}/${refs.length}  (${Math.round((withVariantName / refs.length) * 100)}%)`);

  console.log(`\n===== DONE =====\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
