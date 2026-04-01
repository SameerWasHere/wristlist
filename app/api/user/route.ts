import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/user — get or create the current user in our DB
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Check if user exists
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ user: existing[0] });
  }

  // Create user from Clerk profile
  const clerkUser = await currentUser();
  const username =
    clerkUser?.username ||
    clerkUser?.firstName?.toLowerCase() ||
    `user-${clerkId.slice(-6)}`;

  const [newUser] = await db
    .insert(schema.users)
    .values({
      clerkId,
      username,
      displayName: clerkUser?.fullName || username,
    })
    .returning();

  return NextResponse.json({ user: newUser });
}
