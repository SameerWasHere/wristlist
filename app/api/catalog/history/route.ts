import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";

// ---------------------------------------------------------------------------
// GET /api/catalog/history?targetType=family&targetId=X
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get("targetType");
  const targetIdStr = request.nextUrl.searchParams.get("targetId");

  if (!targetType || !targetIdStr) {
    return NextResponse.json({ error: "targetType and targetId required" }, { status: 400 });
  }

  const targetId = parseInt(targetIdStr, 10);
  if (isNaN(targetId)) {
    return NextResponse.json({ error: "Invalid targetId" }, { status: 400 });
  }

  try {
    const db = getDb();
    const edits = await db
      .select({
        id: schema.catalogEdits.id,
        action: schema.catalogEdits.action,
        fieldChanged: schema.catalogEdits.fieldChanged,
        oldValue: schema.catalogEdits.oldValue,
        newValue: schema.catalogEdits.newValue,
        createdAt: schema.catalogEdits.createdAt,
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.catalogEdits)
      .innerJoin(schema.users, eq(schema.catalogEdits.userId, schema.users.id))
      .where(
        and(
          eq(schema.catalogEdits.targetType, targetType),
          eq(schema.catalogEdits.targetId, targetId),
        ),
      )
      .orderBy(desc(schema.catalogEdits.createdAt))
      .limit(50);

    return NextResponse.json({ edits });
  } catch {
    return NextResponse.json({ edits: [] });
  }
}
