import { NextRequest, NextResponse } from "next/server";
import { ilike, or, and, isNotNull, notInArray, eq, sql, inArray } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Unified search endpoint
// ---------------------------------------------------------------------------
//
// GET /api/watches/search
//
// Supported params:
//   ?q=<query>                 — unified search: brand, model, reference,
//                                variantName (nickname), description.
//                                Multi-token AND matching so "rolex batman"
//                                surfaces the GMT-Master II family.
//                                A ref/nickname match returns the PARENT
//                                family with the matched variation attached,
//                                so the user lands on the right model page.
//   ?popular=true              — top families for "browse popular"
//   ?familyId=<id>             — all variations for a family
//   ?ref=<ref>&brand=<brand>   — dedup check used by the add-to-catalog wizard
//   ?brands=true               — distinct brand list for autocomplete
//   ?fuzzy=<brand>             — families under a brand for the wizard step 2
//   ?excludeIds=1,2,3          — exclude these ref ids from popular results
//
// Response shape (unified search):
//   {
//     families: [
//       {
//         id, slug, brand, model, imageUrl, variationCount, collectorCount,
//         matchedVariant: { id, slug, reference, variantName, imageUrl } | null,
//         matchedBy: "brand" | "model" | "reference" | "variantName" | "description",
//         score: number,
//       }
//     ],
//     variations: [...]  // individual variations matching, family-less fallback only
//     results: [...]     // legacy alias for variations (backwards compat)
//   }

type Tokenized = {
  raw: string;
  lower: string;
  tokens: string[];
};

function tokenize(q: string): Tokenized {
  const raw = q.trim();
  const lower = raw.toLowerCase();
  const tokens = lower.split(/\s+/).filter((t) => t.length > 0);
  return { raw, lower, tokens };
}

/**
 * Return true if every token appears somewhere in `haystack` (case-insensitive).
 */
function matchesAllTokens(haystack: string | null | undefined, tokens: string[]): boolean {
  if (!tokens.length) return true;
  if (!haystack) return false;
  const h = haystack.toLowerCase();
  return tokens.every((t) => h.includes(t));
}

/**
 * Score a candidate on how well it matches the query. Higher = more relevant.
 *
 * - Exact ref or nickname match (full token equality): 100
 * - Exact brand or model match: 60
 * - Prefix match on any field: 40
 * - Substring match on any field: 20
 * - +10 for matching every token (multi-token queries)
 * - +5 if a family has a matching variation (specificity)
 */
function score(opts: {
  haystack: string;
  q: Tokenized;
  kind: "ref" | "nickname" | "brand" | "model" | "description";
}): number {
  const { haystack, q, kind } = opts;
  const h = haystack.toLowerCase();
  if (!h || q.tokens.length === 0) return 0;

  let s = 0;

  // Exact full match: the haystack is exactly the query
  if (h === q.lower) {
    s += kind === "ref" || kind === "nickname" ? 100 : 60;
  }
  // Prefix
  else if (h.startsWith(q.lower)) {
    s += 40;
  }
  // Substring
  else if (h.includes(q.lower)) {
    s += 20;
  }

  // Every-token bonus (helps "rolex batman" style queries)
  if (q.tokens.length > 1 && matchesAllTokens(haystack, q.tokens)) {
    s += 10;
  }

  return s;
}

// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const popular = request.nextUrl.searchParams.get("popular");
  const familyIdParam = request.nextUrl.searchParams.get("familyId");
  const refParam = request.nextUrl.searchParams.get("ref")?.trim();
  const brandParam = request.nextUrl.searchParams.get("brand")?.trim();
  const brandsParam = request.nextUrl.searchParams.get("brands");
  const fuzzyParam = request.nextUrl.searchParams.get("fuzzy")?.trim();

  // Parse optional excludeIds (comma-separated watch reference IDs)
  const excludeIdsParam = request.nextUrl.searchParams.get("excludeIds");
  const excludeIds = excludeIdsParam
    ? excludeIdsParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }

  const { getDb, schema } = await import("@/lib/db");
  const db = getDb();

  // ------------------------------------------------------------------
  // Mode: ?familyId=X — fetch all variations for a family
  // ------------------------------------------------------------------
  if (familyIdParam) {
    const familyId = parseInt(familyIdParam);
    if (isNaN(familyId)) return NextResponse.json({ variations: [] });

    try {
      const variations = await db
        .select()
        .from(schema.watchReferences)
        .where(eq(schema.watchReferences.familyId, familyId));

      const variationIds = variations.map((v) => v.id);
      let collectorCounts = new Map<number, number>();
      if (variationIds.length > 0) {
        const counts = await db
          .select({
            watchReferenceId: schema.userWatches.watchReferenceId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.userWatches)
          .where(
            and(
              inArray(schema.userWatches.watchReferenceId, variationIds),
              eq(schema.userWatches.status, "collection"),
            ),
          )
          .groupBy(schema.userWatches.watchReferenceId);

        collectorCounts = new Map(counts.map((c) => [c.watchReferenceId, c.count]));
      }

      const results = variations.map((v) => ({
        ...v,
        collectorCount: collectorCounts.get(v.id) || 0,
      }));

      return NextResponse.json({ variations: results });
    } catch {
      return NextResponse.json({ variations: [] });
    }
  }

  // ------------------------------------------------------------------
  // Mode: ?brands=true — distinct brand list (used by wizard)
  // ------------------------------------------------------------------
  if (brandsParam === "true") {
    try {
      const rows = await db
        .select({ brand: schema.watchReferences.brand })
        .from(schema.watchReferences)
        .groupBy(schema.watchReferences.brand);
      const brands = rows.map((r) => r.brand).sort();
      return NextResponse.json({ brands });
    } catch {
      return NextResponse.json({ brands: [] });
    }
  }

  // ------------------------------------------------------------------
  // Mode: ?fuzzy=<brand> — families for a brand (wizard step 2)
  // ------------------------------------------------------------------
  if (fuzzyParam) {
    try {
      const rows = await db
        .select({
          id: schema.watchFamilies.id,
          slug: schema.watchFamilies.slug,
          brand: schema.watchFamilies.brand,
          model: schema.watchFamilies.model,
          imageUrl: schema.watchFamilies.imageUrl,
        })
        .from(schema.watchFamilies)
        .where(ilike(schema.watchFamilies.brand, `%${fuzzyParam}%`));

      const familyIds = rows.map((r) => r.id);
      let countMap = new Map<number, number>();
      if (familyIds.length > 0) {
        const counts = await db
          .select({
            familyId: schema.watchReferences.familyId,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.watchReferences)
          .where(inArray(schema.watchReferences.familyId, familyIds))
          .groupBy(schema.watchReferences.familyId);
        countMap = new Map(counts.map((c) => [c.familyId ?? 0, c.count]));
      }

      const families = rows.map((r) => ({
        ...r,
        variationCount: countMap.get(r.id) ?? 0,
      }));
      return NextResponse.json({ families });
    } catch {
      return NextResponse.json({ families: [] });
    }
  }

  // ------------------------------------------------------------------
  // Mode: ?ref=<ref>&brand=<brand> — dedup check (used by wizard step 3/4)
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
            ilike(schema.watchReferences.reference, refParam),
            ilike(schema.watchReferences.brand, brandParam),
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
  // Mode: ?popular=true
  // ------------------------------------------------------------------
  if (popular === "true") {
    try {
      let families: Array<{
        id: number;
        slug: string;
        brand: string;
        model: string;
        imageUrl: string | null;
        variationCount: number;
      }> = [];

      try {
        const familyRows = await db
          .select({
            id: schema.watchFamilies.id,
            slug: schema.watchFamilies.slug,
            brand: schema.watchFamilies.brand,
            model: schema.watchFamilies.model,
            imageUrl: schema.watchFamilies.imageUrl,
          })
          .from(schema.watchFamilies)
          .limit(6);

        if (familyRows.length > 0) {
          const familyIds = familyRows.map((f) => f.id);
          const varCounts = await db
            .select({
              familyId: schema.watchReferences.familyId,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.watchReferences)
            .where(inArray(schema.watchReferences.familyId, familyIds))
            .groupBy(schema.watchReferences.familyId);

          const countMap = new Map(varCounts.map((c) => [c.familyId, c.count]));
          families = familyRows.map((f) => ({
            ...f,
            variationCount: countMap.get(f.id) || 0,
          }));

          const { getBestVariantImagesForFamilies, effectiveFamilyImage } =
            await import("@/lib/family-image");
          const missingIds = families.filter((f) => !f.imageUrl).map((f) => f.id);
          const bestImgs = await getBestVariantImagesForFamilies(missingIds);
          families = families.map((f) => ({
            ...f,
            imageUrl: effectiveFamilyImage(f.imageUrl, f.id, bestImgs),
          }));
        }
      } catch {
        // watchFamilies table may not exist yet
      }

      if (families.length > 0) {
        return NextResponse.json({ families, results: [] });
      }

      // Fallback to raw references if no families
      const conditions = [isNotNull(schema.watchReferences.imageUrl)];
      if (excludeIds.length > 0) {
        conditions.push(notInArray(schema.watchReferences.id, excludeIds));
      }
      const rows = await db
        .select()
        .from(schema.watchReferences)
        .where(and(...conditions))
        .limit(6);
      return NextResponse.json({ families: [], results: rows });
    } catch {
      return NextResponse.json({ families: [], results: [] });
    }
  }

  // ------------------------------------------------------------------
  // Mode: ?q=<query> — unified search
  // ------------------------------------------------------------------
  if (!q || q.length < 2) {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }

  try {
    const qt = tokenize(q);
    const pattern = `%${qt.lower}%`;
    // Build an ilike clause per token so we can AND them for multi-token queries
    const tokenPatterns = qt.tokens.map((t) => `%${t}%`);

    // ---- Fetch candidate families (broad net) ----
    let familyCandidates: Array<{
      id: number;
      slug: string;
      brand: string;
      model: string;
      description: string | null;
      imageUrl: string | null;
    }> = [];
    try {
      familyCandidates = await db
        .select({
          id: schema.watchFamilies.id,
          slug: schema.watchFamilies.slug,
          brand: schema.watchFamilies.brand,
          model: schema.watchFamilies.model,
          description: schema.watchFamilies.description,
          imageUrl: schema.watchFamilies.imageUrl,
        })
        .from(schema.watchFamilies)
        .where(
          or(
            ilike(schema.watchFamilies.brand, pattern),
            ilike(schema.watchFamilies.model, pattern),
            ilike(schema.watchFamilies.description, pattern),
            // Any-token match so "rolex gmt" finds "Rolex GMT-Master II"
            ...tokenPatterns.flatMap((p) => [
              ilike(schema.watchFamilies.brand, p),
              ilike(schema.watchFamilies.model, p),
              ilike(schema.watchFamilies.description, p),
            ]),
          ),
        )
        .limit(40);
    } catch {
      // watchFamilies may not exist
    }

    // ---- Fetch candidate variations (across refs, nicknames, descriptions) ----
    const variationCandidates = await db
      .select()
      .from(schema.watchReferences)
      .where(
        or(
          ilike(schema.watchReferences.brand, pattern),
          ilike(schema.watchReferences.model, pattern),
          ilike(schema.watchReferences.reference, pattern),
          ilike(schema.watchReferences.variantName, pattern),
          ilike(schema.watchReferences.description, pattern),
          ...tokenPatterns.flatMap((p) => [
            ilike(schema.watchReferences.brand, p),
            ilike(schema.watchReferences.model, p),
            ilike(schema.watchReferences.reference, p),
            ilike(schema.watchReferences.variantName, p),
            ilike(schema.watchReferences.description, p),
          ]),
        ),
      )
      .limit(80);

    // ---- Score families ----
    type Scored = {
      family: (typeof familyCandidates)[number];
      score: number;
      matchedBy: "brand" | "model" | "reference" | "variantName" | "description";
      matchedVariant: (typeof variationCandidates)[number] | null;
    };

    const familyById = new Map<number, (typeof familyCandidates)[number]>();
    for (const f of familyCandidates) familyById.set(f.id, f);

    const scoredByFamilyId = new Map<number, Scored>();

    // Score direct family matches
    for (const f of familyCandidates) {
      const tokens = matchesAllTokens(`${f.brand} ${f.model} ${f.description ?? ""}`, qt.tokens);
      const brandHit = score({ haystack: f.brand, q: qt, kind: "brand" });
      const modelHit = score({ haystack: f.model, q: qt, kind: "model" });
      const descHit = score({ haystack: f.description ?? "", q: qt, kind: "description" });
      const best = Math.max(brandHit, modelHit, descHit);
      if (best === 0 && !tokens) continue;
      let kind: Scored["matchedBy"] = "brand";
      if (modelHit >= brandHit && modelHit >= descHit) kind = "model";
      else if (descHit > brandHit) kind = "description";
      const s = best + (tokens ? 10 : 0);
      scoredByFamilyId.set(f.id, {
        family: f,
        score: s,
        matchedBy: kind,
        matchedVariant: null,
      });
    }

    // Score variation matches — roll each one up to its parent family
    const orphanVariations: Array<typeof variationCandidates[number]> = [];
    for (const v of variationCandidates) {
      const refHit = score({ haystack: v.reference ?? "", q: qt, kind: "ref" });
      const nickHit = score({ haystack: v.variantName ?? "", q: qt, kind: "nickname" });
      const brandHit = score({ haystack: v.brand, q: qt, kind: "brand" });
      const modelHit = score({ haystack: v.model, q: qt, kind: "model" });
      const descHit = score({ haystack: v.description ?? "", q: qt, kind: "description" });
      const combined = `${v.brand} ${v.model} ${v.reference ?? ""} ${v.variantName ?? ""} ${v.description ?? ""}`;
      const tokens = matchesAllTokens(combined, qt.tokens);
      let best = Math.max(refHit, nickHit, brandHit, modelHit, descHit);
      if (best === 0 && !tokens) continue;
      let kind: Scored["matchedBy"] = "brand";
      if (refHit >= nickHit && refHit >= brandHit && refHit >= modelHit && refHit >= descHit) kind = "reference";
      else if (nickHit >= brandHit && nickHit >= modelHit && nickHit >= descHit) kind = "variantName";
      else if (modelHit >= brandHit && modelHit >= descHit) kind = "model";
      else if (descHit > brandHit) kind = "description";
      best += tokens ? 10 : 0;

      // Variation matches get a specificity boost when they have a strong
      // identifier (exact ref or nickname) because the user probably typed
      // that specific thing and expects to land on that family.
      if (kind === "reference" || kind === "variantName") best += 5;

      if (v.familyId == null) {
        // Orphan variation — no parent family to roll up to
        orphanVariations.push(v);
        continue;
      }

      const existing = scoredByFamilyId.get(v.familyId);
      if (!existing || best > existing.score) {
        // Need the family row — fetch if we don't already have it
        let family = familyById.get(v.familyId);
        if (!family) {
          const [loaded] = await db
            .select({
              id: schema.watchFamilies.id,
              slug: schema.watchFamilies.slug,
              brand: schema.watchFamilies.brand,
              model: schema.watchFamilies.model,
              description: schema.watchFamilies.description,
              imageUrl: schema.watchFamilies.imageUrl,
            })
            .from(schema.watchFamilies)
            .where(eq(schema.watchFamilies.id, v.familyId))
            .limit(1);
          if (!loaded) continue;
          family = loaded;
          familyById.set(family.id, family);
        }
        scoredByFamilyId.set(v.familyId, {
          family,
          score: best,
          matchedBy: kind,
          matchedVariant: v,
        });
      }
    }

    // ---- Load variation count + best variant image per family ----
    const scoredFamilies = [...scoredByFamilyId.values()];
    const familyIds = scoredFamilies.map((s) => s.family.id);

    const countMap = new Map<number, number>();
    const collectorCountMap = new Map<number, number>();
    if (familyIds.length > 0) {
      const varCounts = await db
        .select({
          familyId: schema.watchReferences.familyId,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.watchReferences)
        .where(inArray(schema.watchReferences.familyId, familyIds))
        .groupBy(schema.watchReferences.familyId);
      varCounts.forEach((c) => {
        if (c.familyId != null) countMap.set(c.familyId, c.count);
      });

      // Collector count per family (how many total owners across all variations)
      const collectorRows = await db
        .select({
          familyId: schema.watchReferences.familyId,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.userWatches)
        .innerJoin(
          schema.watchReferences,
          eq(schema.userWatches.watchReferenceId, schema.watchReferences.id),
        )
        .where(
          and(
            inArray(schema.watchReferences.familyId, familyIds),
            eq(schema.userWatches.status, "collection"),
          ),
        )
        .groupBy(schema.watchReferences.familyId);
      collectorRows.forEach((c) => {
        if (c.familyId != null) collectorCountMap.set(c.familyId, c.count);
      });
    }

    const { getBestVariantImagesForFamilies, effectiveFamilyImage } = await import(
      "@/lib/family-image"
    );
    const missingImgIds = scoredFamilies
      .filter((s) => !s.family.imageUrl)
      .map((s) => s.family.id);
    const bestImgs = await getBestVariantImagesForFamilies(missingImgIds);

    // ---- Sort: score desc, then collectorCount desc, then model asc ----
    scoredFamilies.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ac = collectorCountMap.get(a.family.id) ?? 0;
      const bc = collectorCountMap.get(b.family.id) ?? 0;
      if (bc !== ac) return bc - ac;
      return a.family.model.localeCompare(b.family.model);
    });

    const TOP = 10;
    const topFamilies = scoredFamilies.slice(0, TOP).map((s) => ({
      id: s.family.id,
      slug: s.family.slug,
      brand: s.family.brand,
      model: s.family.model,
      imageUrl: effectiveFamilyImage(s.family.imageUrl, s.family.id, bestImgs),
      variationCount: countMap.get(s.family.id) ?? 0,
      collectorCount: collectorCountMap.get(s.family.id) ?? 0,
      matchedBy: s.matchedBy,
      matchedVariant: s.matchedVariant
        ? {
            id: s.matchedVariant.id,
            slug: s.matchedVariant.slug,
            reference: s.matchedVariant.reference,
            variantName: s.matchedVariant.variantName,
            imageUrl: s.matchedVariant.imageUrl,
          }
        : null,
      score: s.score,
    }));

    // ---- Return ----
    //
    // Kept `variations` and `results` keys for backwards compatibility with
    // the few existing callers. `families` is the primary output now, with
    // matchedVariant attached when relevant.
    //
    // `variations` / `results` is limited to orphan variations (no family).
    return NextResponse.json({
      families: topFamilies,
      variations: orphanVariations.slice(0, 10),
      results: orphanVariations.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ families: [], variations: [], results: [] });
  }
}
