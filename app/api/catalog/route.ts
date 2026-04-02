import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";

function slugify(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// GET /api/catalog
//   ?brands=true  -> sorted list of unique brand names
//   ?fuzzy=rolex+sub -> matching families for "did you mean?"
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const brandsParam = request.nextUrl.searchParams.get("brands");
  const fuzzyParam = request.nextUrl.searchParams.get("fuzzy");

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ brands: [], families: [] });
  }

  const db = getDb();

  // Return distinct brands for autocomplete
  if (brandsParam === "true") {
    try {
      const rows = await db
        .selectDistinct({ brand: schema.watchFamilies.brand })
        .from(schema.watchFamilies);

      // Also get brands from watchReferences that may not have families
      const refRows = await db
        .selectDistinct({ brand: schema.watchReferences.brand })
        .from(schema.watchReferences);

      const brandSet = new Set<string>();
      for (const r of rows) brandSet.add(r.brand);
      for (const r of refRows) brandSet.add(r.brand);

      const brands = Array.from(brandSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );

      return NextResponse.json({ brands });
    } catch {
      return NextResponse.json({ brands: [] });
    }
  }

  // Fuzzy matching for "did you mean?"
  if (fuzzyParam && fuzzyParam.trim().length >= 2) {
    try {
      const pattern = `%${fuzzyParam.trim()}%`;

      const families = await db
        .select({
          id: schema.watchFamilies.id,
          slug: schema.watchFamilies.slug,
          brand: schema.watchFamilies.brand,
          model: schema.watchFamilies.model,
          imageUrl: schema.watchFamilies.imageUrl,
        })
        .from(schema.watchFamilies)
        .where(
          or(
            ilike(schema.watchFamilies.brand, pattern),
            ilike(schema.watchFamilies.model, pattern),
            ilike(
              sql`${schema.watchFamilies.brand} || ' ' || ${schema.watchFamilies.model}`,
              pattern,
            ),
          ),
        )
        .limit(5);

      // Get variation counts
      if (families.length > 0) {
        const familyIds = families.map((f) => f.id);
        const { inArray } = await import("drizzle-orm");
        const varCounts = await db
          .select({
            familyId: schema.watchReferences.familyId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.watchReferences)
          .where(inArray(schema.watchReferences.familyId, familyIds))
          .groupBy(schema.watchReferences.familyId);

        const countMap = new Map(
          varCounts.map((c) => [c.familyId, c.count]),
        );

        const results = families.map((f) => ({
          ...f,
          variationCount: countMap.get(f.id) || 0,
        }));

        return NextResponse.json({ families: results });
      }

      return NextResponse.json({ families: [] });
    } catch {
      return NextResponse.json({ families: [] });
    }
  }

  return NextResponse.json({ brands: [], families: [] });
}

// ---------------------------------------------------------------------------
// POST /api/catalog — create a community-submitted watch reference
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Rate limit: count recent community submissions by this user
  // watchReferences doesn't have createdAt, so we count families created
  // in the last 24h by checking watchFamilies.createdAt as a proxy,
  // plus count total references created by this user today via families
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.watchReferences)
      .innerJoin(
        schema.watchFamilies,
        eq(schema.watchReferences.familyId, schema.watchFamilies.id),
      )
      .where(
        and(
          eq(schema.watchReferences.createdBy, user.id),
          sql`${schema.watchFamilies.createdAt} > ${oneDayAgo}`,
        ),
      );

    if (countResult && countResult.count >= 5) {
      return NextResponse.json(
        {
          error:
            "You've added 5 watches today. Try again tomorrow.",
        },
        { status: 429 },
      );
    }
  } catch {
    // If rate limit check fails (e.g. table issues), allow the request
  }

  const body = await request.json();
  const {
    brand,
    model,
    reference,
    category,
    movement,
    sizeMm,
    origin,
    crystal,
    material,
    braceletType,
    waterResistanceM,
    caseBack,
    shape,
    imageUrl,
    description,
  } = body;

  // Validate required fields
  if (
    !brand ||
    typeof brand !== "string" ||
    !brand.trim() ||
    !model ||
    typeof model !== "string" ||
    !model.trim() ||
    !reference ||
    typeof reference !== "string" ||
    !reference.trim()
  ) {
    return NextResponse.json(
      { error: "Brand, model, and reference are required" },
      { status: 400 },
    );
  }

  const trimmedBrand = brand.trim();
  const trimmedModel = model.trim();
  const trimmedRef = reference.trim();

  // Check for existing family by slug
  const familySlug = slugify(trimmedBrand, trimmedModel);
  let familyId: number | null = null;

  try {
    const [existingFamily] = await db
      .select()
      .from(schema.watchFamilies)
      .where(eq(schema.watchFamilies.slug, familySlug))
      .limit(1);

    if (existingFamily) {
      familyId = existingFamily.id;
    } else {
      // Also check by brand+model match (case differences, etc.)
      const [altFamily] = await db
        .select()
        .from(schema.watchFamilies)
        .where(
          and(
            ilike(schema.watchFamilies.brand, trimmedBrand),
            ilike(schema.watchFamilies.model, trimmedModel),
          ),
        )
        .limit(1);

      if (altFamily) {
        familyId = altFamily.id;
      } else {
        // Create new family
        const [newFamily] = await db
          .insert(schema.watchFamilies)
          .values({
            slug: familySlug,
            brand: trimmedBrand,
            model: trimmedModel,
            isCommunitySubmitted: true,
          })
          .returning();

        familyId = newFamily.id;
      }
    }
  } catch {
    // If families table has issues, continue without family
    familyId = null;
  }

  // Create the watch reference
  const refSlug = slugify(trimmedBrand, trimmedModel, trimmedRef);
  const slug = `${refSlug}-${Date.now().toString(36)}`;

  const insertValues: Record<string, unknown> = {
    slug,
    brand: trimmedBrand,
    model: trimmedModel,
    reference: trimmedRef,
    category: category || null,
    movement: movement || null,
    sizeMm: sizeMm ? parseFloat(sizeMm) : null,
    origin: origin || null,
    crystal: crystal || null,
    material: material || null,
    braceletType: braceletType || null,
    waterResistanceM: waterResistanceM ? parseInt(waterResistanceM) : null,
    caseBack: caseBack || null,
    shape: shape || null,
    imageUrl: imageUrl || null,
    description: description || null,
    isCommunitySubmitted: true,
    createdBy: user.id,
  };

  if (familyId !== null) {
    insertValues.familyId = familyId;
  }

  try {
    const [watch] = await db
      .insert(schema.watchReferences)
      .values(insertValues as typeof schema.watchReferences.$inferInsert)
      .returning();

    return NextResponse.json({ watch }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create watch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
