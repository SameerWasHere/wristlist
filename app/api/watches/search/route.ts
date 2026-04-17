import { NextRequest, NextResponse } from "next/server";
import { ilike, or, and, isNotNull, notInArray, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const popular = request.nextUrl.searchParams.get("popular");
  const familyIdParam = request.nextUrl.searchParams.get("familyId");

  // Parse optional excludeIds (comma-separated watch reference IDs)
  const excludeIdsParam = request.nextUrl.searchParams.get("excludeIds");
  const excludeIds = excludeIdsParam
    ? excludeIdsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];

  // Gracefully handle missing DATABASE_URL
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }

  // Fetch variations for a specific family
  if (familyIdParam) {
    const familyId = parseInt(familyIdParam);
    if (isNaN(familyId)) {
      return NextResponse.json({ variations: [] });
    }
    try {
      const { getDb, schema } = await import("@/lib/db");
      const db = getDb();

      const variations = await db
        .select()
        .from(schema.watchReferences)
        .where(eq(schema.watchReferences.familyId, familyId));

      // Get collector counts per variation
      const variationIds = variations.map((v) => v.id);
      let collectorCounts = new Map<number, number>();
      if (variationIds.length > 0) {
        const { inArray } = await import("drizzle-orm");
        const counts = await db
          .select({
            watchReferenceId: schema.userWatches.watchReferenceId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.userWatches)
          .where(
            and(
              inArray(schema.userWatches.watchReferenceId, variationIds),
              eq(schema.userWatches.status, "collection"),
            ),
          )
          .groupBy(schema.userWatches.watchReferenceId);

        collectorCounts = new Map(counts.map((c) => [c.watchReferenceId, c.count]));
      }

      const results = variations.map((v) => ({
        ...v,
        collectorCount: collectorCounts.get(v.id) || 0,
      }));

      return NextResponse.json({ variations: results });
    } catch {
      return NextResponse.json({ variations: [] });
    }
  }

  // Return popular watches — prefer families if available
  if (popular === "true") {
    try {
      const { getDb, schema } = await import("@/lib/db");
      const db = getDb();

      // Try families first
      let families: Array<{
        id: number;
        slug: string;
        brand: string;
        model: string;
        imageUrl: string | null;
        variationCount: number;
      }> = [];

      try {
        const familyRows = await db
          .select({
            id: schema.watchFamilies.id,
            slug: schema.watchFamilies.slug,
            brand: schema.watchFamilies.brand,
            model: schema.watchFamilies.model,
            imageUrl: schema.watchFamilies.imageUrl,
          })
          .from(schema.watchFamilies)
          .limit(6);

        if (familyRows.length > 0) {
          // Get variation counts
          const familyIds = familyRows.map((f) => f.id);
          const { inArray } = await import("drizzle-orm");
          const varCounts = await db
            .select({
              familyId: schema.watchReferences.familyId,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.watchReferences)
            .where(inArray(schema.watchReferences.familyId, familyIds))
            .groupBy(schema.watchReferences.familyId);

          const countMap = new Map(varCounts.map((c) => [c.familyId, c.count]));

          families = familyRows.map((f) => ({
            ...f,
            variationCount: countMap.get(f.id) || 0,
          }));

          // Fill in variant image for families missing a direct imageUrl
          const { getBestVariantImagesForFamilies, effectiveFamilyImage } = await import("@/lib/family-image");
          const missingIds = families.filter((f) => !f.imageUrl).map((f) => f.id);
          const bestImgs = await getBestVariantImagesForFamilies(missingIds);
          families = families.map((f) => ({
            ...f,
            imageUrl: effectiveFamilyImage(f.imageUrl, f.id, bestImgs),
          }));
        }
      } catch {
        // watchFamilies table may not exist yet
      }

      if (families.length > 0) {
        return NextResponse.json({ families, results: [] });
      }

      // Fallback to raw references
      const conditions = [isNotNull(schema.watchReferences.imageUrl)];
      if (excludeIds.length > 0) {
        conditions.push(notInArray(schema.watchReferences.id, excludeIds));
      }
      const rows = await db
        .select()
        .from(schema.watchReferences)
        .where(and(...conditions))
        .limit(6);
      return NextResponse.json({ families: [], results: rows });
    } catch {
      return NextResponse.json({ families: [], results: [] });
    }
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }

  try {
    const { getDb, schema } = await import("@/lib/db");
    const db = getDb();
    const pattern = `%${q}%`;

    // Search families
    let families: Array<{
      id: number;
      slug: string;
      brand: string;
      model: string;
      imageUrl: string | null;
      variationCount: number;
    }> = [];

    try {
      const familyRows = await db
        .select({
          id: schema.watchFamilies.id,
          slug: schema.watchFamilies.slug,
          brand: schema.watchFamilies.brand,
          model: schema.watchFamilies.model,
          imageUrl: schema.watchFamilies.imageUrl,
        })
        .from(schema.watchFamilies)
        .where(
          or(
            ilike(schema.watchFamilies.brand, pattern),
            ilike(schema.watchFamilies.model, pattern),
          ),
        )
        .limit(5);

      if (familyRows.length > 0) {
        const familyIds = familyRows.map((f) => f.id);
        const { inArray } = await import("drizzle-orm");
        const varCounts = await db
          .select({
            familyId: schema.watchReferences.familyId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.watchReferences)
          .where(inArray(schema.watchReferences.familyId, familyIds))
          .groupBy(schema.watchReferences.familyId);

        const countMap = new Map(varCounts.map((c) => [c.familyId, c.count]));
        families = familyRows.map((f) => ({
          ...f,
          variationCount: countMap.get(f.id) || 0,
        }));

        // Fill in variant image for families missing a direct imageUrl
        const { getBestVariantImagesForFamilies, effectiveFamilyImage } = await import("@/lib/family-image");
        const missingIds = families.filter((f) => !f.imageUrl).map((f) => f.id);
        const bestImgs = await getBestVariantImagesForFamilies(missingIds);
        families = families.map((f) => ({
          ...f,
          imageUrl: effectiveFamilyImage(f.imageUrl, f.id, bestImgs),
        }));
      }
    } catch {
      // watchFamilies table may not exist yet
    }

    // Search individual variations
    const variations = await db
      .select()
      .from(schema.watchReferences)
      .where(
        or(
          ilike(schema.watchReferences.brand, pattern),
          ilike(schema.watchReferences.model, pattern),
          ilike(schema.watchReferences.reference, pattern),
        ),
      )
      .limit(10);

    // Also return as `results` for backward compatibility
    return NextResponse.json({ families, variations, results: variations });
  } catch {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }
}
