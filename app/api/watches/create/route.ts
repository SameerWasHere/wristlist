import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

function slugify(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
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
      { status: 400 },
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
      { status: 403 },
    );
  }

  const trimmedBrand = brand.trim();
  const trimmedModel = model.trim();
  const trimmedRef = reference?.trim() || "";

  // Try to find or create a family for this brand+model
  let familyId: number | null = null;
  try {
    // Look for existing family matching brand+model (case-insensitive via slug)
    const familySlug = slugify(trimmedBrand, trimmedModel);

    const [existingFamily] = await db
      .select()
      .from(schema.watchFamilies)
      .where(
        and(
          eq(schema.watchFamilies.brand, trimmedBrand),
          eq(schema.watchFamilies.model, trimmedModel),
        ),
      )
      .limit(1);

    if (existingFamily) {
      familyId = existingFamily.id;
    } else {
      // Create a new family
      const [newFamily] = await db
        .insert(schema.watchFamilies)
        .values({
          slug: `${familySlug}-${Date.now().toString(36)}`,
          brand: trimmedBrand,
          model: trimmedModel,
          isCommunitySubmitted: true,
        })
        .returning();

      familyId = newFamily.id;
    }
  } catch {
    // watchFamilies table may not exist yet — continue without family link
    familyId = null;
  }

  // Generate a slug for the reference
  const baseSlug = slugify(trimmedBrand, trimmedModel, trimmedRef);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const insertValues: Record<string, unknown> = {
    slug,
    brand: trimmedBrand,
    model: trimmedModel,
    reference: trimmedRef,
    category: category || null,
    movement: movement || null,
    sizeMm: sizeMm || null,
    origin: origin || null,
    isCommunitySubmitted: true,
    createdBy: user.id,
  };

  if (familyId !== null) {
    insertValues.familyId = familyId;
  }

  const [watch] = await db
    .insert(schema.watchReferences)
    .values(insertValues as typeof schema.watchReferences.$inferInsert)
    .returning();

  return NextResponse.json({ watch }, { status: 201 });
}
