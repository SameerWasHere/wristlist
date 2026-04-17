import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// POST /api/catalog/references/[id]/flag-delete
// Body: { reason: string }
// Creates a deletion flag for this watch reference with the caller's reason.
// Enforced unique on (flaggedBy, watchReferenceId) so a user can only flag
// a given watch once.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const watchReferenceId = parseInt(id);
  if (isNaN(watchReferenceId)) {
    return NextResponse.json({ error: "Invalid reference id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!reason || reason.length < 3) {
    return NextResponse.json(
      { error: "Please provide a reason (at least 3 characters)" },
      { status: 400 },
    );
  }
  if (reason.length > 500) {
    return NextResponse.json(
      { error: "Reason is too long (max 500 characters)" },
      { status: 400 },
    );
  }

  const db = getDb();

  // Look up the caller's internal user id
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify the reference exists
  const [ref] = await db
    .select({ id: schema.watchReferences.id })
    .from(schema.watchReferences)
    .where(eq(schema.watchReferences.id, watchReferenceId))
    .limit(1);
  if (!ref) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }

  try {
    await db.insert(schema.deletionFlags).values({
      watchReferenceId,
      flaggedBy: user.id,
      reason,
    });
  } catch {
    // Unique index — user already flagged this watch. Treat as success so the
    // UI doesn't show a scary error; the flag exists, that's what matters.
    return NextResponse.json({ ok: true, alreadyFlagged: true });
  }

  return NextResponse.json({ ok: true });
}
