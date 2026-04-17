import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getDb, schema } from "@/lib/db";
import { getBestVariantImagesForFamilies, effectiveFamilyImage } from "@/lib/family-image";
import { eq, sql, and, ne, inArray } from "drizzle-orm";
import { FamilyEditButton, ReferenceEditButton, HistoryButton } from "./community-features";
import { AddVariationButton } from "./add-variation-button";
import { VariationRow } from "./variation-row";
import { AddToCollectionButton } from "./add-to-collection-button";
import { CatalogImageUpload } from "@/components/catalog-image-upload";
import { FlagDeletionButton } from "./flag-deletion-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ---------- helpers ---------- */

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

async function getFamilyBySlug(slug: string) {
  const db = getDb();
  try {
    const [family] = await db
      .select()
      .from(schema.watchFamilies)
      .where(eq(schema.watchFamilies.slug, slug))
      .limit(1);
    return family || null;
  } catch {
    // Table may not exist yet — fall through to legacy
    return null;
  }
}

async function getLegacyWatch(slug: string) {
  const db = getDb();
  const [watch] = await db
    .select()
    .from(schema.watchReferences)
    .where(eq(schema.watchReferences.slug, slug))
    .limit(1);
  return watch || null;
}

async function getVariationsForFamily(familyId: number) {
  const db = getDb();
  try {
    return await db
      .select()
      .from(schema.watchReferences)
      .where(eq(schema.watchReferences.familyId, familyId));
  } catch {
    return [];
  }
}

async function getCollectorCountsPerVariation(variationIds: number[]) {
  if (variationIds.length === 0) return new Map<number, number>();
  const db = getDb();
  const rows = await db
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

  const map = new Map<number, number>();
  for (const r of rows) map.set(r.watchReferenceId, r.count);
  return map;
}

async function getWishlistCountsPerVariation(variationIds: number[]) {
  if (variationIds.length === 0) return new Map<number, number>();
  const db = getDb();
  const rows = await db
    .select({
      watchReferenceId: schema.userWatches.watchReferenceId,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.userWatches)
    .where(
      and(
        inArray(schema.userWatches.watchReferenceId, variationIds),
        eq(schema.userWatches.status, "wishlist"),
      ),
    )
    .groupBy(schema.userWatches.watchReferenceId);

  const map = new Map<number, number>();
  for (const r of rows) map.set(r.watchReferenceId, r.count);
  return map;
}

async function getCollectorsForVariations(variationIds: number[]) {
  if (variationIds.length === 0) return [];
  const db = getDb();
  return db
    .select({
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      caption: schema.userWatches.caption,
      milestone: schema.userWatches.milestone,
      photos: schema.userWatches.photos,
      watchReferenceId: schema.userWatches.watchReferenceId,
    })
    .from(schema.userWatches)
    .innerJoin(schema.users, eq(schema.userWatches.userId, schema.users.id))
    .where(
      and(
        inArray(schema.userWatches.watchReferenceId, variationIds),
        eq(schema.userWatches.status, "collection"),
      ),
    );
}

async function getWishlistersForVariations(variationIds: number[]) {
  if (variationIds.length === 0) return [];
  const db = getDb();
  return db
    .select({
      username: schema.users.username,
      displayName: schema.users.displayName,
    })
    .from(schema.userWatches)
    .innerJoin(schema.users, eq(schema.userWatches.userId, schema.users.id))
    .where(
      and(
        inArray(schema.userWatches.watchReferenceId, variationIds),
        eq(schema.userWatches.status, "wishlist"),
      ),
    );
}

/**
 * Safely check if `collection` column exists on watchFamilies.
 */
function hasCollectionField(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return "collection" in (schema.watchFamilies as any);
  } catch {
    return false;
  }
}

async function getCollectionSiblings(
  brand: string,
  collection: string | null,
  excludeFamilyId: number,
) {
  if (!collection) return [];
  const db = getDb();
  const collectionExists = hasCollectionField();
  if (!collectionExists) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionCol = (schema.watchFamilies as any).collection;
    return await db
      .select({
        id: schema.watchFamilies.id,
        slug: schema.watchFamilies.slug,
        brand: schema.watchFamilies.brand,
        model: schema.watchFamilies.model,
        imageUrl: schema.watchFamilies.imageUrl,
      })
      .from(schema.watchFamilies)
      .where(
        and(
          eq(collectionCol, collection),
          eq(schema.watchFamilies.brand, brand),
          ne(schema.watchFamilies.id, excludeFamilyId),
        ),
      )
      .limit(6);
  } catch {
    return [];
  }
}

async function getRelatedFamilies(brand: string, excludeFamilyId: number) {
  const db = getDb();
  try {
    return await db
      .select({
        id: schema.watchFamilies.id,
        slug: schema.watchFamilies.slug,
        brand: schema.watchFamilies.brand,
        model: schema.watchFamilies.model,
        imageUrl: schema.watchFamilies.imageUrl,
      })
      .from(schema.watchFamilies)
      .where(
        and(
          eq(schema.watchFamilies.brand, brand),
          ne(schema.watchFamilies.id, excludeFamilyId),
        ),
      )
      .limit(4);
  } catch {
    return [];
  }
}

async function getFamilyCreator(createdBy: number | null) {
  if (!createdBy) return null;
  const db = getDb();
  try {
    const [creator] = await db
      .select({
        username: schema.users.username,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.users)
      .where(eq(schema.users.id, createdBy))
      .limit(1);
    return creator || null;
  } catch {
    return null;
  }
}

async function getRelatedWatchesLegacy(
  watchId: number,
  brand: string,
) {
  const db = getDb();
  return db
    .select({
      id: schema.watchReferences.id,
      slug: schema.watchReferences.slug,
      brand: schema.watchReferences.brand,
      model: schema.watchReferences.model,
      imageUrl: schema.watchReferences.imageUrl,
    })
    .from(schema.watchReferences)
    .where(and(eq(schema.watchReferences.brand, brand), ne(schema.watchReferences.id, watchId)))
    .limit(4);
}

/* ---------- single-ref helpers (legacy fallback) ---------- */

async function getOwnerCount(watchId: number) {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.watchReferenceId, watchId),
        eq(schema.userWatches.status, "collection"),
      ),
    );
  return result?.count || 0;
}

async function getWishlistCount(watchId: number) {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.watchReferenceId, watchId),
        eq(schema.userWatches.status, "wishlist"),
      ),
    );
  return result?.count || 0;
}

async function getCollectors(watchId: number) {
  const db = getDb();
  return db
    .select({
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      caption: schema.userWatches.caption,
      milestone: schema.userWatches.milestone,
      photos: schema.userWatches.photos,
    })
    .from(schema.userWatches)
    .innerJoin(schema.users, eq(schema.userWatches.userId, schema.users.id))
    .where(
      and(
        eq(schema.userWatches.watchReferenceId, watchId),
        eq(schema.userWatches.status, "collection"),
      ),
    );
}

async function getWishlisters(watchId: number) {
  const db = getDb();
  return db
    .select({
      username: schema.users.username,
      displayName: schema.users.displayName,
    })
    .from(schema.userWatches)
    .innerJoin(schema.users, eq(schema.userWatches.userId, schema.users.id))
    .where(
      and(
        eq(schema.userWatches.watchReferenceId, watchId),
        eq(schema.userWatches.status, "wishlist"),
      ),
    );
}

/* ---------- metadata ---------- */

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const family = await getFamilyBySlug(slug);
  if (family) {
    return {
      title: `${family.brand} ${family.model} | WristList`,
      description: `${family.brand} ${family.model} — see who owns it, who wants it, and explore variations on WristList.`,
    };
  }

  const watch = await getLegacyWatch(slug);
  if (!watch) {
    return { title: "Watch Not Found | WristList" };
  }
  return {
    title: `${watch.brand} ${watch.model} | WristList`,
    description: `${watch.brand} ${watch.model} ${watch.reference} — see who owns it, who wants it, and explore specs on WristList.`,
  };
}

/* ---------- page ---------- */

export default async function WatchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { userId: viewerClerkId } = await auth();
  const isSignedIn = !!viewerClerkId;

  // 1. Try family lookup
  const family = await getFamilyBySlug(slug);

  if (family) {
    return renderFamilyPage(family, isSignedIn);
  }

  // 2. Legacy: single reference
  const watch = await getLegacyWatch(slug);
  if (!watch) {
    notFound();
  }
  return renderLegacyPage(watch);
}

/* ================================================================
   FAMILY PAGE
   ================================================================ */

async function renderFamilyPage(family: {
  id: number;
  slug: string;
  brand: string;
  model: string;
  description: string | null;
  imageUrl: string | null;
  isCommunitySubmitted: boolean;
  createdBy: number | null;
  updatedAt: Date | null;
  editCount: number;
  createdAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}, isSignedIn: boolean = false) {
  // Safely read collection field
  const collectionName: string | null = hasCollectionField()
    ? (family as Record<string, unknown>).collection as string | null ?? null
    : null;

  const variations = await getVariationsForFamily(family.id);
  const variationIds = variations.map((v) => v.id);

  const [collectorCounts, wishlistCounts, collectors, wishlisters, relatedFamiliesRaw, collectionSiblingsRaw, creator] =
    await Promise.all([
      getCollectorCountsPerVariation(variationIds),
      getWishlistCountsPerVariation(variationIds),
      getCollectorsForVariations(variationIds),
      getWishlistersForVariations(variationIds),
      getRelatedFamilies(family.brand, family.id),
      getCollectionSiblings(family.brand, collectionName, family.id),
      getFamilyCreator(family.createdBy),
    ]);

  // Fill in missing family images from the most-collected variant with an image
  const missingImageFamilyIds = [
    ...relatedFamiliesRaw.filter((f) => !f.imageUrl).map((f) => f.id),
    ...collectionSiblingsRaw.filter((f) => !f.imageUrl).map((f) => f.id),
  ];
  const bestVariantImages = await getBestVariantImagesForFamilies(missingImageFamilyIds);
  const relatedFamilies = relatedFamiliesRaw.map((f) => ({
    ...f,
    imageUrl: effectiveFamilyImage(f.imageUrl, f.id, bestVariantImages),
  }));
  const collectionSiblings = collectionSiblingsRaw.map((f) => ({
    ...f,
    imageUrl: effectiveFamilyImage(f.imageUrl, f.id, bestVariantImages),
  }));

  // Total counts across all variations
  let totalOwners = 0;
  let totalWishlisters = 0;
  for (const c of collectorCounts.values()) totalOwners += c;
  for (const w of wishlistCounts.values()) totalWishlisters += w;

  // Featured variation = most collectors
  const featured =
    variations.length > 0
      ? variations.reduce((best, v) => {
          const bc = collectorCounts.get(best.id) || 0;
          const vc = collectorCounts.get(v.id) || 0;
          return vc > bc ? v : best;
        }, variations[0])
      : null;

  // Sort variations by collector count (most popular first), then by reference
  // so the order shown on the family page matches the ordering in the hero.
  const sortedVariations = [...variations].sort((a, b) => {
    const ca = collectorCounts.get(a.id) || 0;
    const cb = collectorCounts.get(b.id) || 0;
    if (cb !== ca) return cb - ca;
    return (a.reference || "").localeCompare(b.reference || "");
  });

  // Build a reference-id-to-ref map for showing which ref each collector owns
  const refMap = new Map(variations.map((v) => [v.id, v]));

  // Hero image: prefer the most-collected variation's image, then family imageUrl
  const heroImage = featured?.imageUrl || family.imageUrl || null;

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Watch Hero */}
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          {/* Image */}
          <div className="relative w-full sm:w-[320px] h-[320px] rounded-[20px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={`${family.brand} ${family.model}`}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="text-center">
                <span className="text-[64px] font-bold text-white/10 font-serif">
                  {family.brand.charAt(0)}
                </span>
              </div>
            )}
            {isSignedIn && featured && (
              <CatalogImageUpload
                referenceId={featured.id}
                currentImageUrl={heroImage}
                brand={family.brand}
                model={family.model}
                size="hero"
              />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[3px] font-medium text-[rgba(26,24,20,0.4)] mb-2">
              {family.brand}
            </p>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[36px] sm:text-[48px] font-bold text-[#1a1814] leading-tight font-serif">
                {family.model}
              </h1>
              {isSignedIn && (
                <FamilyEditButton
                  familyId={family.id}
                  currentModel={family.model}
                  currentDescription={family.description}
                  currentImageUrl={family.imageUrl}
                  currentCollection={collectionName}
                />
              )}
            </div>

            {/* Creator attribution */}
            <p className="text-[12px] text-[rgba(26,24,20,0.35)] mb-3">
              {creator ? (
                <>
                  Created by{" "}
                  <Link href={`/${creator.username}`} className="underline underline-offset-2 hover:text-[#8a7a5a]">
                    @{creator.username}
                  </Link>
                </>
              ) : (
                "Community cataloged"
              )}
              {family.editCount > 0 && (
                <> &middot; {family.editCount} edit{family.editCount !== 1 ? "s" : ""}</>
              )}
              {family.updatedAt && (
                <> &middot; Last updated {timeAgo(family.updatedAt)}</>
              )}
              <> &middot; </>
              <HistoryButton targetType="family" targetId={family.id} />
            </p>

            {family.description && (
              <p className="text-[15px] leading-relaxed text-[rgba(26,24,20,0.5)] font-serif italic">
                {family.description}
              </p>
            )}
          </div>
        </div>

        {/* Variations */}
        {variations.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              {variations.length} {variations.length === 1 ? "Variation" : "Variations"}
            </p>
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
              {sortedVariations.map((v, i) => (
                <VariationRow
                  key={v.id}
                  id={v.id}
                  slug={v.slug}
                  brand={v.brand}
                  model={v.model}
                  reference={v.reference}
                  sizeMm={v.sizeMm}
                  movement={v.movement}
                  material={v.material}
                  color={v.color}
                  category={v.category}
                  braceletType={v.braceletType}
                  bezelType={v.bezelType}
                  shape={v.shape}
                  waterResistanceM={v.waterResistanceM}
                  crystal={v.crystal}
                  caseBack={v.caseBack}
                  origin={v.origin}
                  complications={v.complications as string[] | null}
                  description={v.description}
                  imageUrl={v.imageUrl}
                  isCommunitySubmitted={v.isCommunitySubmitted}
                  isFeatured={!!(featured && v.id === featured.id)}
                  collectorCount={collectorCounts.get(v.id) || 0}
                  isSignedIn={isSignedIn}
                  isFirst={i === 0}
                />
              ))}
            </div>

            {/* Add Variation button */}
            {isSignedIn && (
              <div className="mt-4 flex justify-center">
                <AddVariationButton brand={family.brand} model={family.model} />
              </div>
            )}
          </section>
        )}

        {/* Stats */}
        <div className="flex gap-8 mb-12 pb-8 border-b border-[rgba(26,24,20,0.06)]">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#1a1814]">{totalOwners}</span>
            <span className="text-[14px] text-[rgba(26,24,20,0.4)]">
              {totalOwners === 1 ? "collector owns this" : "collectors own this"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#1a1814]">{totalWishlisters}</span>
            <span className="text-[14px] text-[rgba(26,24,20,0.4)]">
              {totalWishlisters === 1 ? "wants this" : "want this"}
            </span>
          </div>
        </div>

        {/* Who Owns This */}
        {collectors.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Who Owns This
            </p>
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
              {collectors.map((c, i) => {
                const ref = refMap.get(c.watchReferenceId);
                return (
                  <Link
                    key={`${c.username}-${c.watchReferenceId}`}
                    href={`/${c.username}`}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-[rgba(26,24,20,0.015)] transition-colors ${
                      i > 0 ? "border-t border-[rgba(26,24,20,0.06)]" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[14px] font-bold text-[rgba(26,24,20,0.3)]">
                          {(c.displayName || c.username).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1a1814] truncate">
                        {c.displayName || c.username}
                      </p>
                      <div className="flex items-center gap-2">
                        {ref && (
                          <span className="text-[11px] font-mono text-[rgba(26,24,20,0.3)]">
                            {ref.reference}
                          </span>
                        )}
                        {(c.caption || c.milestone) && (
                          <span className="text-[12px] text-[rgba(26,24,20,0.4)] font-serif italic truncate">
                            {c.caption ? `"${c.caption}"` : c.milestone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Photo thumbnail */}
                    {c.photos && (c.photos as string[]).length > 0 && (
                      <div className="w-10 h-10 rounded-[8px] overflow-hidden flex-shrink-0">
                        <img
                          src={(c.photos as string[])[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Who Wants This */}
        {wishlisters.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Who Wants This
            </p>
            <div className="flex flex-wrap gap-2">
              {wishlisters.map((w) => (
                <Link
                  key={w.username}
                  href={`/${w.username}`}
                  className="px-4 py-2 text-[13px] font-medium text-[#8a7a5a] bg-white rounded-full border border-[rgba(26,24,20,0.06)] hover:border-[rgba(138,122,90,0.3)] transition-colors shadow-sm"
                >
                  {w.displayName || w.username}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Collection Siblings */}
        {collectionSiblings.length > 0 && collectionName && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-1">
              Also in the {collectionName} Collection
            </p>
            <p className="text-[13px] text-[rgba(26,24,20,0.4)] mb-4 font-serif italic">
              Other models in the {family.brand} {collectionName} family
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {collectionSiblings.map((r) => (
                <Link
                  key={r.id}
                  href={`/watch/${r.slug}`}
                  className="bg-white rounded-[16px] border border-[rgba(138,122,90,0.1)] shadow-[0_2px_12px_rgba(26,24,20,0.03)] overflow-hidden hover:shadow-[0_4px_20px_rgba(26,24,20,0.08)] transition-shadow group"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={`${r.brand} ${r.model}`}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-[24px] font-bold text-white/10">
                        {r.brand.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] mb-0.5">
                      {r.brand}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1a1814] truncate">
                      {r.model}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Watches */}
        {relatedFamilies.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Related Watches
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedFamilies.map((r) => (
                <Link
                  key={r.id}
                  href={`/watch/${r.slug}`}
                  className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] shadow-[0_2px_12px_rgba(26,24,20,0.03)] overflow-hidden hover:shadow-[0_4px_20px_rgba(26,24,20,0.08)] transition-shadow group"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={`${r.brand} ${r.model}`}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-[24px] font-bold text-white/10">
                        {r.brand.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] mb-0.5">
                      {r.brand}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1a1814] truncate">
                      {r.model}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

/* ================================================================
   LEGACY PAGE (single reference, no family)
   ================================================================ */

async function renderLegacyPage(watch: {
  id: number;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  sizeMm: number | null;
  movement: string | null;
  material: string | null;
  color: string | null;
  category: string | null;
  braceletType: string | null;
  shape: string | null;
  waterResistanceM: number | null;
  crystal: string | null;
  caseBack: string | null;
  origin: string | null;
  imageUrl: string | null;
  isCommunitySubmitted: boolean;
  description: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const [ownCount, wantCount, collectors, wishlisters, related] = await Promise.all([
    getOwnerCount(watch.id),
    getWishlistCount(watch.id),
    getCollectors(watch.id),
    getWishlisters(watch.id),
    getRelatedWatchesLegacy(watch.id, watch.brand),
  ]);

  // Look up parent family
  let parentFamily: { slug: string; brand: string; model: string } | null = null;
  if (watch.familyId) {
    const db = getDb();
    const [fam] = await db.select({ slug: schema.watchFamilies.slug, brand: schema.watchFamilies.brand, model: schema.watchFamilies.model })
      .from(schema.watchFamilies).where(eq(schema.watchFamilies.id, watch.familyId)).limit(1);
    if (fam) parentFamily = fam;
  }

  const { userId: viewerClerkId } = await auth();
  const isSignedIn = !!viewerClerkId;

  const bezelType = (watch.bezelType as string | null | undefined) ?? null;

  // Mirror the fields in EditReferenceModal so "what you see" = "what you can edit"
  const specs = [
    { label: "Movement", value: watch.movement },
    { label: "Size", value: watch.sizeMm ? `${watch.sizeMm}mm` : null },
    { label: "Category", value: watch.category },
    { label: "Dial", value: watch.color },
    { label: "Material", value: watch.material },
    { label: "Bracelet", value: watch.braceletType },
    { label: "Bezel", value: bezelType },
    { label: "Shape", value: watch.shape },
    { label: "Origin", value: watch.origin },
    { label: "Crystal", value: watch.crystal },
    { label: "Water Resistance", value: watch.waterResistanceM ? `${watch.waterResistanceM}m` : null },
    { label: "Case Back", value: watch.caseBack },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Watch Header */}
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          {/* Image */}
          <div className="relative w-full sm:w-[280px] h-[280px] rounded-[20px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {watch.imageUrl ? (
              <img
                src={watch.imageUrl}
                alt={`${watch.brand} ${watch.model}`}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="text-center">
                <span className="text-[48px] font-bold text-white/10">
                  {watch.brand.charAt(0)}
                </span>
              </div>
            )}
            {isSignedIn && (
              <CatalogImageUpload
                referenceId={watch.id}
                currentImageUrl={watch.imageUrl}
                brand={watch.brand}
                model={watch.model}
                size="hero"
              />
            )}
          </div>

          {/* Text */}
          <div className="flex-1">
            {/* Parent family link */}
            {parentFamily && (
              <Link
                href={`/watch/${parentFamily.slug}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors mb-3"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                All {parentFamily.brand} {parentFamily.model} variations
              </Link>
            )}

            <p className="text-[11px] uppercase tracking-[3px] font-medium text-[rgba(26,24,20,0.4)] mb-2">
              {watch.brand}
            </p>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1a1814] leading-tight mb-2 font-serif">
              {watch.model}
            </h1>
            {watch.reference && (
              <p className="text-[14px] font-mono text-[rgba(26,24,20,0.35)] mb-3">
                {watch.reference}
              </p>
            )}

            {/* Actions for signed-in users */}
            {isSignedIn && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <AddToCollectionButton
                  watch={{
                    id: watch.id,
                    brand: watch.brand,
                    model: watch.model,
                    reference: watch.reference,
                    category: watch.category || undefined,
                    sizeMm: watch.sizeMm || undefined,
                    movement: watch.movement || undefined,
                    origin: watch.origin || undefined,
                    crystal: watch.crystal || undefined,
                    braceletType: watch.braceletType || undefined,
                    material: watch.material || undefined,
                    color: watch.color || undefined,
                  }}
                />
                <ReferenceEditButton
                  referenceId={watch.id}
                  current={{
                    brand: watch.brand,
                    model: watch.model,
                    reference: watch.reference,
                    sizeMm: watch.sizeMm,
                    movement: watch.movement,
                    material: watch.material,
                    color: watch.color,
                    category: watch.category,
                    braceletType: watch.braceletType,
                    bezelType: watch.bezelType,
                    shape: watch.shape,
                    waterResistanceM: watch.waterResistanceM,
                    crystal: watch.crystal,
                    caseBack: watch.caseBack,
                    origin: watch.origin,
                    description: watch.description,
                    imageUrl: watch.imageUrl,
                  }}
                />
              </div>
            )}

            {/* Specs grid */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.3)] mb-0.5">
                      {spec.label}
                    </p>
                    <p className="text-[14px] font-medium text-[#1a1814] capitalize">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {watch.description && (
              <p className="mt-5 text-[14px] leading-relaxed text-[rgba(26,24,20,0.55)] font-serif italic">
                {watch.description}
              </p>
            )}

            {/* Community flag — subtle, at the bottom of the header */}
            {isSignedIn && (
              <div className="mt-6 pt-4 border-t border-[rgba(26,24,20,0.06)]">
                <FlagDeletionButton
                  referenceId={watch.id}
                  brand={watch.brand}
                  model={watch.model}
                  reference={watch.reference}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-12 pb-8 border-b border-[rgba(26,24,20,0.06)]">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#1a1814]">{ownCount}</span>
            <span className="text-[14px] text-[rgba(26,24,20,0.4)]">
              {ownCount === 1 ? "owns this" : "own this"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#1a1814]">{wantCount}</span>
            <span className="text-[14px] text-[rgba(26,24,20,0.4)]">
              {wantCount === 1 ? "wants this" : "want this"}
            </span>
          </div>
        </div>

        {/* Who Owns This */}
        {collectors.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Who Owns This
            </p>
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
              {collectors.map((c, i) => (
                <Link
                  key={c.username}
                  href={`/${c.username}`}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-[rgba(26,24,20,0.015)] transition-colors ${
                    i > 0 ? "border-t border-[rgba(26,24,20,0.06)]" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[14px] font-bold text-[rgba(26,24,20,0.3)]">
                        {(c.displayName || c.username).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1a1814] truncate">
                      {c.displayName || c.username}
                    </p>
                    {(c.caption || c.milestone) && (
                      <p className="text-[13px] text-[rgba(26,24,20,0.4)] font-serif italic truncate">
                        {c.caption ? `"${c.caption}"` : c.milestone}
                      </p>
                    )}
                  </div>

                  {c.photos && (c.photos as string[]).length > 0 && (
                    <div className="w-10 h-10 rounded-[8px] overflow-hidden flex-shrink-0">
                      <img
                        src={(c.photos as string[])[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Who Wants This */}
        {wishlisters.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Who Wants This
            </p>
            <div className="flex flex-wrap gap-2">
              {wishlisters.map((w) => (
                <Link
                  key={w.username}
                  href={`/${w.username}`}
                  className="px-4 py-2 text-[13px] font-medium text-[#8a7a5a] bg-white rounded-full border border-[rgba(26,24,20,0.06)] hover:border-[rgba(138,122,90,0.3)] transition-colors shadow-sm"
                >
                  {w.displayName || w.username}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Watches */}
        {related.length > 0 && (
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
              Related Watches
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/watch/${r.slug}`}
                  className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] shadow-[0_2px_12px_rgba(26,24,20,0.03)] overflow-hidden hover:shadow-[0_4px_20px_rgba(26,24,20,0.08)] transition-shadow group"
                >
                  <div className="aspect-square bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={`${r.brand} ${r.model}`}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-[24px] font-bold text-white/10">
                        {r.brand.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] mb-0.5">
                      {r.brand}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1a1814] truncate">
                      {r.model}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
