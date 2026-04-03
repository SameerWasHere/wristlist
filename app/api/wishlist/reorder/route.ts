import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  // Update position for each wishlist item
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(schema.userWatches)
      .set({ position: i })
      .where(
        and(
          eq(schema.userWatches.id, orderedIds[i]),
          eq(schema.userWatches.userId, user.id),
          eq(schema.userWatches.status, "wishlist")
        )
      );
  }

  return NextResponse.json({ ok: true });
}
