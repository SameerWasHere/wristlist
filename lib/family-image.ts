import { getDb, schema } from "@/lib/db";
import { inArray, isNotNull, and, eq, sql } from "drizzle-orm";

/**
 * For a given set of watch family IDs, returns a map of familyId -> best
 * variant image URL. The "best" image is the one belonging to the most
 * collected variation that has an imageUrl set. If no variation has an image,
 * the family is omitted from the map.
 *
 * Callers should merge this with their family data and use:
 *   const effectiveImage = family.imageUrl || bestVariantImages.get(family.id) || null
 */
export async function getBestVariantImagesForFamilies(
  familyIds: number[],
): Promise<Map<number, string>> {
  if (familyIds.length === 0) return new Map();

  try {
    const db = getDb();

    // For each family, get the imageUrl of the variation owned by the most
    // collectors (with a non-null imageUrl). Uses a single aggregate query
    // with DISTINCT ON so we don't have N+1 calls.
    const rows = await db
      .select({
        familyId: schema.watchReferences.familyId,
        imageUrl: schema.watchReferences.imageUrl,
        collectorCount: sql<number>`count(${schema.userWatches.id})::int`,
      })
      .from(schema.watchReferences)
      .leftJoin(
        schema.userWatches,
        and(
          eq(schema.userWatches.watchReferenceId, schema.watchReferences.id),
          eq(schema.userWatches.status, "collection"),
        ),
      )
      .where(
        and(
          inArray(schema.watchReferences.familyId, familyIds),
          isNotNull(schema.watchReferences.imageUrl),
        ),
      )
      .groupBy(
        schema.watchReferences.familyId,
        schema.watchReferences.id,
        schema.watchReferences.imageUrl,
      );

    // In memory, keep the row with highest collectorCount per familyId.
    const best = new Map<number, { imageUrl: string; count: number }>();
    for (const r of rows) {
      if (!r.familyId || !r.imageUrl) continue;
      const existing = best.get(r.familyId);
      if (!existing || r.collectorCount > existing.count) {
        best.set(r.familyId, { imageUrl: r.imageUrl, count: r.collectorCount });
      }
    }

    const result = new Map<number, string>();
    for (const [familyId, { imageUrl }] of best) {
      result.set(familyId, imageUrl);
    }
    return result;
  } catch {
    return new Map();
  }
}

/**
 * Pure helper — given a family's imageUrl and the best-variant map, returns
 * the effective image URL to render.
 */
export function effectiveFamilyImage(
  familyImageUrl: string | null,
  familyId: number,
  bestVariantImages: Map<number, string>,
): string | null {
  if (familyImageUrl) return familyImageUrl;
  return bestVariantImages.get(familyId) ?? null;
}
