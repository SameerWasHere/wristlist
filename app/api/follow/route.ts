import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// POST /api/follow — follow a user
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followingId } = await request.json();
  if (!followingId || typeof followingId !== "number") {
    return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
  }

  const db = getDb();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Can't follow yourself
  if (user.id === followingId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await db.insert(schema.follows).values({
      followerId: user.id,
      followingId,
    });
  } catch {
    // Unique constraint — already following, that's fine
  }

  return NextResponse.json({ ok: true, following: true });
}

// DELETE /api/follow — unfollow a user
export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followingId } = await request.json();
  if (!followingId || typeof followingId !== "number") {
    return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
  }

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
    .delete(schema.follows)
    .where(
      and(
        eq(schema.follows.followerId, user.id),
        eq(schema.follows.followingId, followingId),
      ),
    );

  return NextResponse.json({ ok: true, following: false });
}
