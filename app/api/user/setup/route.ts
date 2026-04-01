import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await request.json();

  if (!username || username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
  }

  // Only allow letters, numbers, hyphens, underscores
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: "Only letters, numbers, hyphens, and underscores" }, { status: 400 });
  }

  const db = getDb();

  // Check if username is taken
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
  }

  // Check if this clerk user already has an account
  const [existingClerk] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (existingClerk) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  // Create user with chosen username as both username and displayName
  const [user] = await db
    .insert(schema.users)
    .values({
      clerkId,
      username,
      displayName: username, // Use username as display name, not real name
    })
    .returning();

  return NextResponse.json({ user }, { status: 201 });
}
