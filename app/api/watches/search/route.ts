import { NextRequest, NextResponse } from "next/server";
import { ilike, or, and, isNotNull, notInArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const popular = request.nextUrl.searchParams.get("popular");

  // Parse optional excludeIds (comma-separated watch reference IDs)
  const excludeIdsParam = request.nextUrl.searchParams.get("excludeIds");
  const excludeIds = excludeIdsParam
    ? excludeIdsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];

  // Return popular watches (first 6 with images)
  if (popular === "true") {
    if (!process.env.DATABASE_URL) return NextResponse.json({ results: [] });
    try {
      const { getDb, schema } = await import("@/lib/db");
      const db = getDb();
      const conditions = [isNotNull(schema.watchReferences.imageUrl)];
      if (excludeIds.length > 0) {
        conditions.push(notInArray(schema.watchReferences.id, excludeIds));
      }
      const rows = await db
        .select()
        .from(schema.watchReferences)
        .where(and(...conditions))
        .limit(6);
      return NextResponse.json({ results: rows });
    } catch {
      return NextResponse.json({ results: [] });
    }
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Gracefully handle missing DATABASE_URL — return empty results
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ results: [] });
  }

  try {
    const { getDb, schema } = await import("@/lib/db");
    const db = getDb();
    const pattern = `%${q}%`;

    const rows = await db
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

    return NextResponse.json({ results: rows });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
