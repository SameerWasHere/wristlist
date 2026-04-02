import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

// GET /api/watches/variations?familyId=X
// Returns all watchReferences where familyId = X, with collector counts
export async function GET(request: NextRequest) {
  const familyIdParam = request.nextUrl.searchParams.get("familyId");

  if (!familyIdParam) {
    return NextResponse.json({ error: "familyId is required" }, { status: 400 });
  }

  const familyId = parseInt(familyIdParam);
  if (isNaN(familyId)) {
    return NextResponse.json({ error: "familyId must be a number" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ variations: [] });
  }

  try {
    const { getDb, schema } = await import("@/lib/db");
    const { inArray } = await import("drizzle-orm");
    const db = getDb();

    const variations = await db
      .select()
      .from(schema.watchReferences)
      .where(eq(schema.watchReferences.familyId, familyId));

    // Get collector counts
    const variationIds = variations.map((v) => v.id);
    let collectorCounts = new Map<number, number>();

    if (variationIds.length > 0) {
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
