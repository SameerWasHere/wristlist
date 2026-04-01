import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// GET /api/collection — get the current user's collection
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
        eq(schema.userWatches.status, "collection")
      )
    );

  return NextResponse.json({ watches });
}

// POST /api/collection — add a watch to the user's collection
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { watchReferenceId, modelYear, modifications } = body;

  if (!watchReferenceId) {
    return NextResponse.json({ error: "watchReferenceId is required" }, { status: 400 });
  }

  const db = getDb();

  // Get or create user
  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    // Auto-create user on first watch add
    const res = await fetch(new URL("/api/user", request.url));
    const data = await res.json();
    user = data.user;
  }

  // Check if already in collection
  const existing = await db
    .select()
    .from(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.userId, user.id),
        eq(schema.userWatches.watchReferenceId, watchReferenceId),
        eq(schema.userWatches.status, "collection")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Watch already in collection" }, { status: 409 });
  }

  const [entry] = await db
    .insert(schema.userWatches)
    .values({
      userId: user.id,
      watchReferenceId,
      status: "collection",
      modelYear: modelYear || null,
      modifications: modifications || [],
    })
    .returning();

  return NextResponse.json({ entry }, { status: 201 });
}

// DELETE /api/collection — remove a watch from the user's collection
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
