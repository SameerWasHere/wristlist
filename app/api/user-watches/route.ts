import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { userWatchId } = body;
  if (!userWatchId) return NextResponse.json({ error: "userWatchId required" }, { status: 400 });

  const db = getDb();

  // Get user
  const [user] = await db.select().from(schema.users).where(eq(schema.users.clerkId, clerkId)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify ownership
  const [existing] = await db.select().from(schema.userWatches)
    .where(and(eq(schema.userWatches.id, userWatchId), eq(schema.userWatches.userId, user.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Watch not found" }, { status: 404 });

  // Build partial update
  const updates: Record<string, unknown> = {};
  if (body.caption !== undefined) updates.caption = body.caption || null;
  if (body.milestone !== undefined) updates.milestone = body.milestone || null;
  if (body.modelYear !== undefined) updates.modelYear = body.modelYear || null;
  if (body.acquiredYear !== undefined) updates.acquiredYear = body.acquiredYear || null;
  if (body.acquiredDate !== undefined) updates.acquiredDate = body.acquiredDate || null;
  if (body.modifications !== undefined) updates.modifications = body.modifications || [];
  if (body.photos !== undefined) updates.photos = body.photos || [];
  if (body.notes !== undefined) updates.notes = body.notes || null;
  if (body.status !== undefined && (body.status === "collection" || body.status === "wishlist")) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ entry: existing });

  const [updated] = await db.update(schema.userWatches).set(updates)
    .where(eq(schema.userWatches.id, userWatchId)).returning();

  return NextResponse.json({ entry: updated });
}
