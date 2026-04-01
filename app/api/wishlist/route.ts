import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// GET /api/wishlist — get the current user's wishlist
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ watches: [] });
  }

  const watches = await db
    .select({
      id: schema.userWatches.id,
      status: schema.userWatches.status,
      modelYear: schema.userWatches.modelYear,
      modifications: schema.userWatches.modifications,
      notes: schema.userWatches.notes,
      dateAdded: schema.userWatches.dateAdded,
      watch: {
        id: schema.watchReferences.id,
        slug: schema.watchReferences.slug,
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        reference: schema.watchReferences.reference,
        sizeMm: schema.watchReferences.sizeMm,
        movement: schema.watchReferences.movement,
        material: schema.watchReferences.material,
        color: schema.watchReferences.color,
        category: schema.watchReferences.category,
        braceletType: schema.watchReferences.braceletType,
        shape: schema.watchReferences.shape,
        waterResistanceM: schema.watchReferences.waterResistanceM,
        crystal: schema.watchReferences.crystal,
        caseBack: schema.watchReferences.caseBack,
        origin: schema.watchReferences.origin,
        lugWidthMm: schema.watchReferences.lugWidthMm,
        complications: schema.watchReferences.complications,
        retailPrice: schema.watchReferences.retailPrice,
        imageUrl: schema.watchReferences.imageUrl,
      },
    })
    .from(schema.userWatches)
    .innerJoin(
      schema.watchReferences,
      eq(schema.userWatches.watchReferenceId, schema.watchReferences.id)
    )
    .where(
      and(
        eq(schema.userWatches.userId, user.id),
        eq(schema.userWatches.status, "wishlist")
      )
    );

  return NextResponse.json({ watches });
}

// POST /api/wishlist — add a watch to the user's wishlist
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { watchReferenceId } = body;

  if (!watchReferenceId) {
    return NextResponse.json({ error: "watchReferenceId is required" }, { status: 400 });
  }

  const db = getDb();

  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    const clerkUser = await currentUser();
    const username = clerkUser?.username || clerkUser?.firstName?.toLowerCase() || `user-${clerkId.slice(-6)}`;
    [user] = await db
      .insert(schema.users)
      .values({
        clerkId,
        username,
        displayName: clerkUser?.fullName || username,
      })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      [user] = await db.select().from(schema.users).where(eq(schema.users.clerkId, clerkId)).limit(1);
    }
  }

  const existing = await db
    .select()
    .from(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.userId, user.id),
        eq(schema.userWatches.watchReferenceId, watchReferenceId),
        eq(schema.userWatches.status, "wishlist")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Watch already on wishlist" }, { status: 409 });
  }

  const [entry] = await db
    .insert(schema.userWatches)
    .values({
      userId: user.id,
      watchReferenceId,
      status: "wishlist",
    })
    .returning();

  return NextResponse.json({ entry }, { status: 201 });
}

// DELETE /api/wishlist — remove from wishlist
export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userWatchId } = await request.json();

  const db = getDb();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db
    .delete(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.id, userWatchId),
        eq(schema.userWatches.userId, user.id)
      )
    );

  return NextResponse.json({ ok: true });
}
