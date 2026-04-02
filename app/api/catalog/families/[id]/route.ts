import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";

// ---------------------------------------------------------------------------
// GET /api/catalog/families/[id] — return family with creator info
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
    const rows = await db
      .select({
        id: schema.watchFamilies.id,
        slug: schema.watchFamilies.slug,
        brand: schema.watchFamilies.brand,
        model: schema.watchFamilies.model,
        collection: schema.watchFamilies.collection,
        description: schema.watchFamilies.description,
        imageUrl: schema.watchFamilies.imageUrl,
        editCount: schema.watchFamilies.editCount,
        updatedAt: schema.watchFamilies.updatedAt,
        createdAt: schema.watchFamilies.createdAt,
        creatorUsername: schema.users.username,
        creatorDisplayName: schema.users.displayName,
        creatorAvatarUrl: schema.users.avatarUrl,
      })
      .from(schema.watchFamilies)
      .leftJoin(schema.users, eq(schema.watchFamilies.createdBy, schema.users.id))
      .where(eq(schema.watchFamilies.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ family: rows[0] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/catalog/families/[id] — edit a family's metadata
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

  // Look up user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 403 });
  }

  // Rate limit: max 10 edits per day
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

  // Get current family
  const [family] = await db
    .select()
    .from(schema.watchFamilies)
    .where(eq(schema.watchFamilies.id, id))
    .limit(1);

  if (!family) {
    return NextResponse.json({ error: "Family not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = ["model", "description", "imageUrl", "collection"] as const;

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
    if (field in body && body[field] !== (family as Record<string, unknown>)[field]) {
      const oldVal = (family as Record<string, unknown>)[field];
      updates[field] = body[field] ?? null;
      editEntries.push({
        userId: user.id,
        targetType: "family",
        targetId: id,
        action: "edit",
        fieldChanged: field,
        oldValue: oldVal != null ? String(oldVal) : null,
        newValue: body[field] != null ? String(body[field]) : null,
      });
    }
  }

  if (editEntries.length === 0) {
    return NextResponse.json({ family });
  }

  try {
    // Insert edit log entries
    await db.insert(schema.catalogEdits).values(editEntries);

    // Update family
    const [updated] = await db
      .update(schema.watchFamilies)
      .set({
        ...updates,
        updatedAt: new Date(),
        updatedBy: user.id,
        editCount: sql`${schema.watchFamilies.editCount} + ${editEntries.length}`,
      })
      .where(eq(schema.watchFamilies.id, id))
      .returning();

    return NextResponse.json({ family: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
