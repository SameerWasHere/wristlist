import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";

// ---------------------------------------------------------------------------
// GET /api/catalog/references/[id]
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const db = getDb();
    const [ref] = await db
      .select()
      .from(schema.watchReferences)
      .where(eq(schema.watchReferences.id, id))
      .limit(1);

    if (!ref) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ reference: ref });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/catalog/references/[id] — edit a variation's specs
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = getDb();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 403 });
  }

  // Rate limit
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(
        and(
          eq(schema.catalogEdits.userId, user.id),
          sql`${schema.catalogEdits.createdAt} > ${oneDayAgo}`,
        ),
      );

    if (countResult && countResult.count >= 10) {
      return NextResponse.json(
        { error: "Rate limit: max 10 edits per day." },
        { status: 429 },
      );
    }
  } catch {
    // Allow if check fails
  }

  const [ref] = await db
    .select()
    .from(schema.watchReferences)
    .where(eq(schema.watchReferences.id, id))
    .limit(1);

  if (!ref) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = [
    "reference",
    "sizeMm",
    "movement",
    "material",
    "color",
    "category",
    "braceletType",
    "shape",
    "waterResistanceM",
    "crystal",
    "caseBack",
    "origin",
    "complications",
    "description",
    "imageUrl",
  ] as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  const editEntries: Array<{
    userId: number;
    targetType: string;
    targetId: number;
    action: string;
    fieldChanged: string;
    oldValue: string | null;
    newValue: string | null;
  }> = [];

  for (const field of allowedFields) {
    if (!(field in body)) continue;
    const oldVal = (ref as Record<string, unknown>)[field];
    const newVal = body[field];

    // Normalize for comparison
    const oldStr = oldVal != null ? JSON.stringify(oldVal) : null;
    const newStr = newVal != null ? JSON.stringify(newVal) : null;
    if (oldStr === newStr) continue;

    // Parse numeric fields
    if (field === "sizeMm") {
      updates[field] = newVal ? parseFloat(newVal) : null;
    } else if (field === "waterResistanceM") {
      updates[field] = newVal ? parseInt(newVal, 10) : null;
    } else {
      updates[field] = newVal ?? null;
    }

    editEntries.push({
      userId: user.id,
      targetType: "reference",
      targetId: id,
      action: "edit",
      fieldChanged: field,
      oldValue: oldVal != null ? String(oldVal) : null,
      newValue: newVal != null ? String(newVal) : null,
    });
  }

  if (editEntries.length === 0) {
    return NextResponse.json({ reference: ref });
  }

  try {
    await db.insert(schema.catalogEdits).values(editEntries);

    const [updated] = await db
      .update(schema.watchReferences)
      .set({
        ...updates,
        updatedAt: new Date(),
        updatedBy: user.id,
        editCount: sql`${schema.watchReferences.editCount} + ${editEntries.length}`,
      })
      .where(eq(schema.watchReferences.id, id))
      .returning();

    return NextResponse.json({ reference: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
