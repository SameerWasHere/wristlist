import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { normalizeDimensionValue } from "@/lib/normalize-dimension";

function slugify(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Safely check if `collection` column exists on watchFamilies.
 * The other agent is adding it; we gracefully handle its absence.
 */
function hasCollectionField(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return "collection" in (schema.watchFamilies as any);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// GET /api/catalog
//   ?brands=true              -> sorted list of unique brand names
//   ?fuzzy=rolex+sub          -> matching families for "did you mean?"
//   ?ref=126610LN&brand=Rolex -> check if a reference exists (dedup)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const brandsParam = request.nextUrl.searchParams.get("brands");
  const fuzzyParam = request.nextUrl.searchParams.get("fuzzy");
  const refParam = request.nextUrl.searchParams.get("ref");
  const brandParam = request.nextUrl.searchParams.get("brand");

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ brands: [], families: [] });
  }

  const db = getDb();
  const collectionExists = hasCollectionField();

  // ------------------------------------------------------------------
  // Check if a specific reference exists (for dedup in wizard step 4)
  // ------------------------------------------------------------------
  if (refParam && brandParam) {
    try {
      const [existing] = await db
        .select({
          id: schema.watchReferences.id,
          slug: schema.watchReferences.slug,
          brand: schema.watchReferences.brand,
          model: schema.watchReferences.model,
          reference: schema.watchReferences.reference,
          imageUrl: schema.watchReferences.imageUrl,
        })
        .from(schema.watchReferences)
        .where(
          and(
            ilike(schema.watchReferences.reference, refParam.trim()),
            ilike(schema.watchReferences.brand, brandParam.trim()),
          ),
        )
        .limit(1);

      if (existing) {
        return NextResponse.json({
          exists: true,
          watchReferenceId: existing.id,
          slug: existing.slug,
          brand: existing.brand,
          model: existing.model,
          reference: existing.reference,
          imageUrl: existing.imageUrl,
        });
      }
      return NextResponse.json({ exists: false });
    } catch {
      return NextResponse.json({ exists: false });
    }
  }

  // ------------------------------------------------------------------
  // Return distinct brands for autocomplete
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Fuzzy matching for "did you mean?" — also returns collection field
  // ------------------------------------------------------------------
  if (fuzzyParam && fuzzyParam.trim().length >= 2) {
    try {
      const pattern = `%${fuzzyParam.trim()}%`;

      // Build select fields dynamically based on whether collection exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectFields: Record<string, any> = {
        id: schema.watchFamilies.id,
        slug: schema.watchFamilies.slug,
        brand: schema.watchFamilies.brand,
        model: schema.watchFamilies.model,
        imageUrl: schema.watchFamilies.imageUrl,
      };

      if (collectionExists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selectFields.collection = (schema.watchFamilies as any).collection;
      }

      const families = await db
        .select(selectFields)
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
        .limit(20);

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
          collection: collectionExists ? (f as Record<string, unknown>).collection ?? null : null,
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

  // Rate limiting removed for now — can re-enable later when needed

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
    bezelType,
    braceletType,
    waterResistanceM,
    caseBack,
    shape,
    color,
    imageUrl,
    description,
    familyId: providedFamilyId,
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

  // Check for existing family by slug or by provided familyId
  const familySlug = slugify(trimmedBrand, trimmedModel);
  let familyId: number | null = providedFamilyId ? Number(providedFamilyId) : null;

  if (!familyId) {
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
      familyId = null;
    }
  }

  // Create the watch reference
  const refSlug = slugify(trimmedBrand, trimmedModel, trimmedRef);
  const slug = `${refSlug}-${Date.now().toString(36)}`;

  const insertValues: Record<string, unknown> = {
    slug,
    brand: trimmedBrand,
    model: trimmedModel,
    reference: trimmedRef,
    category: normalizeDimensionValue("category", category) || null,
    movement: normalizeDimensionValue("movement", movement) || null,
    sizeMm: sizeMm ? parseFloat(sizeMm) : null,
    origin: normalizeDimensionValue("origin", origin) || null,
    crystal: normalizeDimensionValue("crystal", crystal) || null,
    material: normalizeDimensionValue("material", material) || null,
    color: normalizeDimensionValue("color", color) || null,
    bezelType: normalizeDimensionValue("bezelType", bezelType) || null,
    braceletType: normalizeDimensionValue("braceletType", braceletType) || null,
    waterResistanceM: waterResistanceM ? parseInt(waterResistanceM) : null,
    caseBack: normalizeDimensionValue("caseBack", caseBack) || null,
    shape: normalizeDimensionValue("shape", shape) || null,
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

    // Log catalog edits for the creation
    try {
      const editEntries: Array<{
        userId: number;
        targetType: string;
        targetId: number;
        action: string;
        fieldChanged: string | null;
        oldValue: string | null;
        newValue: string | null;
      }> = [];

      // Log reference creation
      editEntries.push({
        userId: user.id,
        targetType: "reference",
        targetId: watch.id,
        action: "create",
        fieldChanged: null,
        oldValue: null,
        newValue: `${trimmedBrand} ${trimmedModel} ${trimmedRef}`,
      });

      // If we created a new family (familyId was null before), log that too
      if (!providedFamilyId && familyId) {
        editEntries.push({
          userId: user.id,
          targetType: "family",
          targetId: familyId,
          action: "create",
          fieldChanged: null,
          oldValue: null,
          newValue: `${trimmedBrand} ${trimmedModel}`,
        });
      }

      if (editEntries.length > 0) {
        await db.insert(schema.catalogEdits).values(editEntries);
      }
    } catch {
      // Non-critical: don't fail the creation if edit logging fails
    }

    return NextResponse.json({ watch }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create watch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
