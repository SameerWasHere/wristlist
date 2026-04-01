import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, displayName, bio, collectingSince } = await request.json();

  if (!username || username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: "Only letters, numbers, hyphens, and underscores" }, { status: 400 });
  }

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

  // Check if new username is taken by someone else
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

  // Update user
  const [updated] = await db
    .update(schema.users)
    .set({
      username,
      displayName: displayName || username,
      bio: bio || null,
      collectingSince: collectingSince || null,
    })
    .where(eq(schema.users.id, currentUser.id))
    .returning();

  return NextResponse.json({ user: updated });
}
