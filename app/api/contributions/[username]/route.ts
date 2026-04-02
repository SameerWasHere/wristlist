import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, sql, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// GET /api/contributions/[username] — user's catalog contributions
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const db = getDb();

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count families created
    const [familiesCreated] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(
        and(
          eq(schema.catalogEdits.userId, user.id),
          eq(schema.catalogEdits.targetType, "family"),
          eq(schema.catalogEdits.action, "create"),
        ),
      );

    // Count references created
    const [refsCreated] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(
        and(
          eq(schema.catalogEdits.userId, user.id),
          eq(schema.catalogEdits.targetType, "reference"),
          eq(schema.catalogEdits.action, "create"),
        ),
      );

    // Count total edits
    const [totalEdits] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(eq(schema.catalogEdits.userId, user.id));

    // Recent 10 edits with details
    const recentEdits = await db
      .select({
        id: schema.catalogEdits.id,
        targetType: schema.catalogEdits.targetType,
        targetId: schema.catalogEdits.targetId,
        action: schema.catalogEdits.action,
        fieldChanged: schema.catalogEdits.fieldChanged,
        createdAt: schema.catalogEdits.createdAt,
      })
      .from(schema.catalogEdits)
      .where(eq(schema.catalogEdits.userId, user.id))
      .orderBy(desc(schema.catalogEdits.createdAt))
      .limit(10);

    // Enrich with watch names
    const enriched = await Promise.all(
      recentEdits.map(async (edit) => {
        let watchName = "";
        try {
          if (edit.targetType === "family") {
            const [f] = await db
              .select({ brand: schema.watchFamilies.brand, model: schema.watchFamilies.model })
              .from(schema.watchFamilies)
              .where(eq(schema.watchFamilies.id, edit.targetId))
              .limit(1);
            if (f) watchName = `${f.brand} ${f.model}`;
          } else {
            const [r] = await db
              .select({ brand: schema.watchReferences.brand, model: schema.watchReferences.model, reference: schema.watchReferences.reference })
              .from(schema.watchReferences)
              .where(eq(schema.watchReferences.id, edit.targetId))
              .limit(1);
            if (r) watchName = `${r.brand} ${r.model} ${r.reference}`;
          }
        } catch {
          // ignore
        }
        return { ...edit, watchName };
      }),
    );

    return NextResponse.json({
      familiesCreated: familiesCreated?.count ?? 0,
      referencesCreated: refsCreated?.count ?? 0,
      totalEdits: totalEdits?.count ?? 0,
      recentEdits: enriched,
    });
  } catch {
    return NextResponse.json(
      { familiesCreated: 0, referencesCreated: 0, totalEdits: 0, recentEdits: [] },
    );
  }
}
