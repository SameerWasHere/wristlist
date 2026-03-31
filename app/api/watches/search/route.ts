import { NextRequest, NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

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
      .select({
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        reference: schema.watchReferences.reference,
        category: schema.watchReferences.category,
        movement: schema.watchReferences.movement,
        sizeMm: schema.watchReferences.sizeMm,
      })
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
