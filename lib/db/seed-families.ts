import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { watchFamilies, watchReferences } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function slugify(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedFamilies() {
  console.log("Reading all watch references...");
  const refs = await db.select().from(watchReferences);
  console.log(`Found ${refs.length} watch references.`);

  // Group by brand + model
  const familyMap = new Map<
    string,
    { brand: string; model: string; imageUrl: string | null; refIds: number[] }
  >();

  for (const ref of refs) {
    const key = `${ref.brand}|||${ref.model}`;
    if (!familyMap.has(key)) {
      familyMap.set(key, {
        brand: ref.brand,
        model: ref.model,
        imageUrl: ref.imageUrl ?? null,
        refIds: [],
      });
    }
    const family = familyMap.get(key)!;
    family.refIds.push(ref.id);
    // Use first available image
    if (!family.imageUrl && ref.imageUrl) {
      family.imageUrl = ref.imageUrl;
    }
  }

  console.log(`Found ${familyMap.size} unique families.`);

  for (const [, family] of familyMap) {
    const slug = slugify(family.brand, family.model);

    // Insert family (skip if slug already exists)
    const inserted = await db
      .insert(watchFamilies)
      .values({
        slug,
        brand: family.brand,
        model: family.model,
        imageUrl: family.imageUrl,
        isCommunitySubmitted: false,
      })
      .onConflictDoNothing()
      .returning({ id: watchFamilies.id });

    // Get the family id (either just inserted or already existing)
    let familyId: number;
    if (inserted.length > 0) {
      familyId = inserted[0].id;
    } else {
      const existing = await db
        .select({ id: watchFamilies.id })
        .from(watchFamilies)
        .where(eq(watchFamilies.slug, slug));
      familyId = existing[0].id;
    }

    // Update all references in this family
    for (const refId of family.refIds) {
      await db
        .update(watchReferences)
        .set({ familyId })
        .where(eq(watchReferences.id, refId));
    }

    console.log(
      `  ${family.brand} ${family.model} (${slug}) -> ${family.refIds.length} reference(s)`,
    );
  }

  console.log("Done seeding families.");
}

seedFamilies().catch(console.error);
