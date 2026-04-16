import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, sql, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ScoreRing } from "@/components/score-ring";
import { DnaTags } from "@/components/dna-tags";
import { CollectionTimeline } from "@/components/collection-timeline";
import { FollowButton } from "@/components/follow-button";
import { RemoveWatchButton } from "@/components/remove-watch-button";
import { EditableProfileHeader } from "./edit-profile-header";
import { ProfileSearch } from "./profile-search";
import { CollectionInsights } from "./collection-insights";
import { WishlistEditButton } from "./wishlist-edit-button";
import { PromoteButton } from "./promote-button";
import { SortableWishlist } from "./sortable-wishlist";
import { getDb, schema } from "@/lib/db";
import {
  diversityScore,
  gapAnalysis,
  personality,
  nextBestPurchase,
  collectionStats,
  brandBreakdown,
  collectionGapsHuman,
  timelineStats,
  type AnalyticsWatch,
  type ExtendedWatch,
} from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function toAnalyticsWatch(w: {
  movement: string | null;
  category: string | null;
  material: string | null;
  bezelType: string | null;
  braceletType: string | null;
  shape: string | null;
  color: string | null;
  crystal: string | null;
  origin: string | null;
  caseBack: string | null;
  waterResistanceM: number | null;
  retailPrice: number | null;
  brand: string;
  model: string;
}): AnalyticsWatch {
  return {
    movement: w.movement || "",
    category: w.category || "",
    material: w.material || "",
    bezel_type: w.bezelType || "",
    bracelet_type: w.braceletType || "",
    shape: w.shape || "",
    color: w.color || "",
    crystal: w.crystal || "",
    origin: w.origin || "",
    case_back: w.caseBack || "",
    water_resistance_m: w.waterResistanceM || 0,
    price: w.retailPrice || 0,
    brand: w.brand,
    model: w.model,
  };
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getProfileData(username: string) {
  const db = getDb();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!user) return null;

  const collectionRows = await db
    .select({
      id: schema.userWatches.id,
      modelYear: schema.userWatches.modelYear,
      modifications: schema.userWatches.modifications,
      acquiredYear: schema.userWatches.acquiredYear,
      acquiredDate: schema.userWatches.acquiredDate,
      milestone: schema.userWatches.milestone,
      caption: schema.userWatches.caption,
      photos: schema.userWatches.photos,
      notes: schema.userWatches.notes,
      watch: schema.watchReferences,
    })
    .from(schema.userWatches)
    .innerJoin(
      schema.watchReferences,
      eq(schema.userWatches.watchReferenceId, schema.watchReferences.id)
    )
    .where(
      and(
        eq(schema.userWatches.userId, user.id),
        eq(schema.userWatches.status, "collection")
      )
    );

  const wishlistRows = await db
    .select({
      id: schema.userWatches.id,
      notes: schema.userWatches.notes,
      caption: schema.userWatches.caption,
      milestone: schema.userWatches.milestone,
      modelYear: schema.userWatches.modelYear,
      acquiredYear: schema.userWatches.acquiredYear,
      acquiredDate: schema.userWatches.acquiredDate,
      modifications: schema.userWatches.modifications,
      photos: schema.userWatches.photos,
      watch: schema.watchReferences,
    })
    .from(schema.userWatches)
    .innerJoin(
      schema.watchReferences,
      eq(schema.userWatches.watchReferenceId, schema.watchReferences.id)
    )
    .where(
      and(
        eq(schema.userWatches.userId, user.id),
        eq(schema.userWatches.status, "wishlist")
      )
    )
    .orderBy(schema.userWatches.position);

  // Follower count
  let followerCount = 0;
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followingId, user.id));
    followerCount = Number(result?.count ?? 0);
  } catch {
    // follows table may not exist yet
  }

  // Catalog contributions
  let catalogCreated = 0;
  let catalogEditsCount = 0;
  let recentContributions: Array<{
    action: string;
    targetType: string;
    watchName: string;
    createdAt: Date;
  }> = [];

  try {
    const [createdResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(
        and(
          eq(schema.catalogEdits.userId, user.id),
          eq(schema.catalogEdits.action, "create"),
        ),
      );
    catalogCreated = createdResult?.count ?? 0;

    const [editsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.catalogEdits)
      .where(eq(schema.catalogEdits.userId, user.id));
    catalogEditsCount = editsResult?.count ?? 0;

    const recentRows = await db
      .select({
        action: schema.catalogEdits.action,
        targetType: schema.catalogEdits.targetType,
        targetId: schema.catalogEdits.targetId,
        createdAt: schema.catalogEdits.createdAt,
      })
      .from(schema.catalogEdits)
      .where(eq(schema.catalogEdits.userId, user.id))
      .orderBy(desc(schema.catalogEdits.createdAt))
      .limit(5);

    recentContributions = await Promise.all(
      recentRows.map(async (r) => {
        let watchName = "";
        try {
          if (r.targetType === "family") {
            const [f] = await db
              .select({ brand: schema.watchFamilies.brand, model: schema.watchFamilies.model })
              .from(schema.watchFamilies)
              .where(eq(schema.watchFamilies.id, r.targetId))
              .limit(1);
            if (f) watchName = `${f.brand} ${f.model}`;
          } else {
            const [ref] = await db
              .select({ brand: schema.watchReferences.brand, model: schema.watchReferences.model })
              .from(schema.watchReferences)
              .where(eq(schema.watchReferences.id, r.targetId))
              .limit(1);
            if (ref) watchName = `${ref.brand} ${ref.model}`;
          }
        } catch {
          // ignore
        }
        return { action: r.action, targetType: r.targetType, watchName, createdAt: r.createdAt };
      }),
    );
  } catch {
    // catalogEdits table may not exist yet
  }

  const collectionAnalytics = collectionRows.map((r) =>
    toAnalyticsWatch(r.watch)
  );
  const wishlistAnalytics = wishlistRows.map((r) =>
    toAnalyticsWatch(r.watch)
  );

  // Extended watches for new analytics
  const collectionExtended: ExtendedWatch[] = collectionRows.map((r) => ({
    ...toAnalyticsWatch(r.watch),
    sizeMm: r.watch.sizeMm ?? undefined,
    complications: (r.watch.complications as string[] | null) ?? undefined,
    acquiredYear: r.acquiredYear ?? undefined,
    acquiredDate: r.acquiredDate ?? undefined,
  }));

  const score = diversityScore(collectionAnalytics);
  const dna = personality(collectionAnalytics);
  const nbp = nextBestPurchase(collectionAnalytics, wishlistAnalytics);
  const gaps = gapAnalysis(collectionAnalytics, wishlistAnalytics);

  // New analytics
  const cStats = collectionStats(collectionExtended);
  const cBrands = brandBreakdown(collectionExtended);
  const wishlistExtended: ExtendedWatch[] = wishlistRows.map((r) => ({
    ...toAnalyticsWatch(r.watch),
    sizeMm: r.watch.sizeMm ?? undefined,
    complications: (r.watch.complications as string[] | null) ?? undefined,
  }));
  const cGapsHuman = collectionGapsHuman(collectionExtended, wishlistExtended);
  const cTimeline = timelineStats(collectionExtended);

  // Top 3 worst gaps (by coverage % ascending)
  const topGaps = [...gaps]
    .sort(
      (a, b) =>
        a.owned.length / a.total - b.owned.length / b.total
    )
    .slice(0, 3);

  // Timeline-ready collection data
  const collectionForTimeline = collectionRows.map((r) => ({
    brand: r.watch.brand,
    model: r.watch.model,
    reference: r.watch.reference,
    category: r.watch.category || "",
    movement: r.watch.movement || "",
    sizeMm: r.watch.sizeMm || 40,
    origin: r.watch.origin || "",
    caption: r.caption || undefined,
    milestone: r.milestone || undefined,
    acquiredYear: r.acquiredYear || undefined,
    acquiredDate: r.acquiredDate || undefined,
    modelYear: r.modelYear || undefined,
    photos: (r.photos as string[] | null) || undefined,
    imageUrl: r.watch.imageUrl || undefined,
    slug: r.watch.slug,
    color: r.watch.color || "default",
    modifications: (r.modifications as string[] | null) || undefined,
    userWatchId: r.id,
    originNote: r.notes || undefined,
  }));

  // Simple wishlist for compact display (visitor)
  const wishlistCompact = wishlistRows.map((r) => ({
    brand: r.watch.brand,
    model: r.watch.model,
    notes: r.notes || undefined,
  }));

  // Wishlist ordered by user's position (drag order), enriched with gap data
  const rankedWishlist = wishlistRows.map((r, i) => {
    // Find gap count for this watch from NBP data
    const nbpItem = nbp.find(
      (n) => n.watch.brand === r.watch.brand && n.watch.model === r.watch.model
    );
    return {
      rank: i + 1,
      userWatchId: r.id,
      brand: r.watch.brand,
      model: r.watch.model,
      reference: r.watch.reference || "",
      category: r.watch.category || undefined,
      sizeMm: r.watch.sizeMm || undefined,
      movement: r.watch.movement || undefined,
      origin: r.watch.origin || undefined,
      caption: r.caption || undefined,
      milestone: r.milestone || undefined,
      modelYear: r.modelYear || undefined,
      acquiredYear: r.acquiredYear || undefined,
      modifications: (r.modifications as string[] | null) || undefined,
      photos: (r.photos as string[] | null) || undefined,
      gapsFilled: nbpItem?.gapsFilled ?? 0,
      slug: r.watch.slug || undefined,
      imageUrl: r.watch.imageUrl || undefined,
    };
  });

  return {
    user,
    collectionRows,
    wishlistRows,
    score,
    dna,
    nbp,
    gaps,
    topGaps,
    cStats,
    cBrands,
    cGapsHuman,
    cTimeline,
    collectionForTimeline,
    wishlistCompact,
    rankedWishlist,
    followerCount,
    catalogCreated,
    catalogEditsCount,
    recentContributions,
  };
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileData(username);

  if (!data) {
    return {
      title: "Collector not found — WristList",
      description: "This collector profile does not exist.",
    };
  }

  const displayName = data.user.displayName || data.user.username;
  const archetype = data.dna.archetype;
  const description = data.dna.description;

  return {
    title: `${displayName}'s Collection — WristList`,
    description: `${archetype}. ${description}`,
    openGraph: {
      title: `${displayName}'s Watch Collection`,
      description: `${archetype}. ${description}`,
      url: `https://wristlist.com/${username}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfileData(username);

  if (!data) {
    notFound();
  }

  const {
    user,
    collectionRows,
    wishlistRows,
    score,
    dna,
    nbp,
    topGaps,
    cStats,
    cBrands,
    cGapsHuman,
    cTimeline,
    collectionForTimeline,
    wishlistCompact,
    rankedWishlist,
    followerCount,
    catalogCreated,
    catalogEditsCount,
    recentContributions,
  } = data;

  // Check if the logged-in user is viewing their own profile
  const { userId: viewerClerkId } = await auth();
  const isOwner = viewerClerkId ? user.clerkId === viewerClerkId : false;

  const displayName = user.displayName || user.username;
  const hasWatches = collectionRows.length > 0 || wishlistRows.length > 0;
  const initial = displayName.charAt(0).toUpperCase();
  const topNbp = nbp[0] ?? null;

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-10" />

        {/* -- Profile Header ------------------------------------------- */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-10">
          {/* Left: name, bio, etc -- editable for owner */}
          {isOwner ? (
            <EditableProfileHeader
              username={user.username}
              displayName={displayName}
              bio={user.bio || ""}
              collectingSince={user.collectingSince || undefined}
              avatarUrl={user.avatarUrl || undefined}
            />
          ) : (
            <div className="flex items-start gap-4 flex-1">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full object-cover flex-shrink-0 border border-[rgba(26,24,20,0.08)]"
                />
              ) : (
                <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1a1814] to-[#2a2a30] text-white font-bold text-[20px] sm:text-[24px]">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-[22px] sm:text-[28px] font-black tracking-tighter leading-none mb-0.5">
                  {displayName}
                </h1>
                <p className="text-[13px] text-[rgba(26,24,20,0.35)] mb-2">
                  @{user.username}
                  {user.collectingSince && (
                    <> &middot; Collecting since {user.collectingSince}</>
                  )}
                </p>
                {user.bio && (
                  <p className="text-[14px] text-[rgba(26,24,20,0.55)] leading-relaxed max-w-[420px]">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Follow button -- only for visitors */}
          {!isOwner && (
            <div className="flex-shrink-0 flex items-start">
              <FollowButton
                userId={user.id}
                isFollowing={false}
                followerCount={followerCount}
              />
            </div>
          )}
        </div>

        {/* DNA tags removed — now shown in Collection Insights card */}

        {/* Add Watch button rendered inside collection header below */}

        {/* -- Empty State ---------------------------------------------- */}
        {!hasWatches && (
          <section className="mb-14">
            <div className="border border-[rgba(26,24,20,0.08)] border-dashed rounded-[20px] py-16 px-8 text-center">
              <p className="text-[28px] sm:text-[32px] font-light tracking-tight mb-3">
                <span className="font-serif italic font-medium text-[#8a7a5a]">
                  {isOwner ? "Start your collection" : "No watches yet"}
                </span>
              </p>
              <p className="text-[15px] text-[rgba(26,24,20,0.4)] mb-6 max-w-md mx-auto leading-relaxed">
                {isOwner
                  ? "Add your first watch to start building your collection."
                  : `${displayName} hasn\u0027t added any watches yet. Check back soon!`}
              </p>
              {isOwner && <ProfileSearch />}
            </div>
          </section>
        )}

        {/* -- The Collection (Timeline) -------------------------------- */}
        {(collectionRows.length > 0 || isOwner) && (
          <section className="mb-14">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Collection
                <span className="ml-2 text-[rgba(26,24,20,0.2)] font-medium normal-case tracking-normal">
                  {collectionRows.length} piece{collectionRows.length !== 1 ? "s" : ""}
                </span>
              </h2>
              {isOwner && collectionRows.length > 0 && <ProfileSearch />}
            </div>
            {collectionRows.length > 0 ? (
              <CollectionTimeline
                watches={collectionForTimeline}
                isOwner={isOwner}
              />
            ) : isOwner ? (
              <div className="border border-dashed border-[rgba(26,24,20,0.1)] rounded-[20px] py-12 text-center">
                <p className="text-[15px] text-[rgba(26,24,20,0.3)] mb-3">
                  Your collection is empty
                </p>
                <p className="text-[13px] text-[rgba(26,24,20,0.25)]">
                  Use the search above to add your first watch
                </p>
              </div>
            ) : null}
          </section>
        )}

        {/* -- The Wishlist --------------------------------------------- */}
        {/* Owner view: draggable, with gap counts and action buttons */}
        {isOwner && rankedWishlist.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Wishlist
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {rankedWishlist.length} piece
                {rankedWishlist.length !== 1 ? "s" : ""} &middot; drag to reorder
              </span>
            </div>

            <SortableWishlist items={rankedWishlist} isOwner={true} />
          </section>
        )}

        {/* Visitor view: compact read-only wishlist */}
        {!isOwner && wishlistCompact.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Wishlist
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {wishlistCompact.length} piece
                {wishlistCompact.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {wishlistCompact.map((w, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-3 px-4 py-3 bg-white border border-[rgba(26,24,20,0.06)] rounded-[14px]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.3)] font-bold">
                      {w.brand}
                    </span>
                    <span className="mx-2 text-[rgba(26,24,20,0.15)]">
                      /
                    </span>
                    <span className="text-[14px] font-semibold tracking-[-0.2px]">
                      {w.model}
                    </span>
                  </div>
                  {w.notes && (
                    <p className="text-[12px] text-[rgba(26,24,20,0.35)] italic flex-shrink-0 max-w-[200px] truncate">
                      {w.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -- Collection Insights (owner only) ------------------------ */}
        {hasWatches && (
          <CollectionInsights
            archetype={dna.archetype}
            description={dna.description}
            tags={dna.tags.map((t) => ({ text: t.text, variant: t.variant }))}
            score={score}
            stats={cStats}
            brands={cBrands}
            gaps={cGapsHuman}
            timeline={cTimeline}
            nbp={
              topNbp
                ? {
                    brand: topNbp.watch.brand,
                    model: topNbp.watch.model,
                    gapsFilled: topNbp.gapsFilled,
                  }
                : null
            }
          />
        )}

        {/* -- Catalog Contributions ----------------------------------- */}
        {catalogEditsCount > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                Catalog Contributions
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {catalogCreated} created &middot; {catalogEditsCount - catalogCreated} edit{catalogEditsCount - catalogCreated !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {recentContributions.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-[rgba(26,24,20,0.06)] rounded-[14px]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1814] truncate">
                      {c.action === "create" ? "Created" : "Edited"}{" "}
                      <span className="font-semibold">{c.watchName || "a watch"}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-[rgba(26,24,20,0.3)] flex-shrink-0">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* -- Collector DNA (subtle bottom section, visitor view) ------- */}
        {!isOwner && hasWatches && (
          <section className="mb-14">
            <div className="border border-[rgba(26,24,20,0.06)] rounded-[20px] px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={score} size={80} label="Diversity" />
              <div className="text-center sm:text-left">
                <p className="font-serif italic text-[18px] font-medium text-[rgba(26,24,20,0.7)] tracking-[-0.3px] mb-1">
                  {dna.archetype}
                </p>
                <p className="text-[13px] text-[rgba(26,24,20,0.4)] leading-relaxed max-w-[400px]">
                  {dna.description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* -- CTA Banner (visitor only) -------------------------------- */}
        {!isOwner && (
          <section className="mb-4">
            <div className="border border-[rgba(26,24,20,0.06)] rounded-[24px] py-12 px-8 text-center">
              <h2 className="text-[28px] font-light tracking-[-0.5px]">
                <span className="font-serif italic font-medium">
                  What&apos;s{" "}
                  <span className="text-[#8a7a5a]">your</span>
                </span>{" "}
                collector DNA?
              </h2>
              <p className="text-[13px] text-[rgba(26,24,20,0.4)] mt-3 max-w-md mx-auto leading-relaxed">
                Every collection tells a story. Build yours on WristList and
                discover your diversity score, your blind spots, and what to buy
                next.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 px-9 py-3.5 bg-[#1a1814] text-[#f6f4ef] text-[12px] font-bold rounded-full hover:translate-y-[-2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.2)] transition-all tracking-[0.5px]"
              >
                Create Your WristList
              </Link>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
}
