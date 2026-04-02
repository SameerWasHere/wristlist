import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const db = getDb();

  // Get current user
  const [currentUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build partial update — only update fields that were sent
  const updates: Record<string, unknown> = {};

  // Username (optional — only validate if provided)
  if (body.username !== undefined) {
    const username = body.username;
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: "Only letters, numbers, hyphens, and underscores" }, { status: 400 });
    }
    // Check uniqueness if changed
    if (username !== currentUser.username) {
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.username, username),
            ne(schema.users.id, currentUser.id)
          )
        )
        .limit(1);

      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
      }
    }
    updates.username = username;
  }

  // Display name (optional)
  if (body.displayName !== undefined) {
    updates.displayName = body.displayName || currentUser.username;
  }

  // Bio (optional)
  if (body.bio !== undefined) {
    updates.bio = body.bio || null;
  }

  // Collecting since (optional)
  if (body.collectingSince !== undefined) {
    updates.collectingSince = body.collectingSince || null;
  }

  // Nothing to update
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ user: currentUser });
  }

  const [updated] = await db
    .update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, currentUser.id))
    .returning();

  return NextResponse.json({ user: updated });
}
