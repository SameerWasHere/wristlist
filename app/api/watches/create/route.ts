import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

function slugify(brand: string, model: string, reference?: string): string {
  const parts = [brand, model, reference].filter(Boolean);
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// POST /api/watches/create — create a community-submitted watch reference
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brand, model, reference, category, movement, sizeMm, origin } = body;

  if (!brand || !model) {
    return NextResponse.json(
      { error: "Brand and model are required" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Look up the user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "setup_required", redirect: "/setup" },
      { status: 403 }
    );
  }

  // Generate a slug
  const baseSlug = slugify(brand, model, reference);
  // Add a small random suffix to avoid collisions
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const [watch] = await db
    .insert(schema.watchReferences)
    .values({
      slug,
      brand: brand.trim(),
      model: model.trim(),
      reference: reference?.trim() || "",
      category: category || null,
      movement: movement || null,
      sizeMm: sizeMm || null,
      origin: origin || null,
      isCommunitySubmitted: true,
      createdBy: user.id,
    })
    .returning();

  return NextResponse.json({ watch }, { status: 201 });
}
