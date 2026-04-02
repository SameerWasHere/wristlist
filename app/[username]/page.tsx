import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/nav";
import { ScoreRing } from "@/components/score-ring";
import { DnaTags } from "@/components/dna-tags";
import { CollectionTimeline } from "@/components/collection-timeline";
import { FollowButton } from "@/components/follow-button";
import { EditProfileHeader } from "./edit-profile-header";
import { getDb, schema } from "@/lib/db";
import {
  diversityScore,
  personality,
  nextBestPurchase,
  type AnalyticsWatch,
} from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toAnalyticsWatch(w: {
  movement: string | null;
  category: string | null;
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
    );

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

  const collectionAnalytics = collectionRows.map((r) =>
    toAnalyticsWatch(r.watch)
  );
  const wishlistAnalytics = wishlistRows.map((r) =>
    toAnalyticsWatch(r.watch)
  );

  const score = diversityScore(collectionAnalytics);
  const dna = personality(collectionAnalytics);
  const nbp = nextBestPurchase(collectionAnalytics, wishlistAnalytics);

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
    modelYear: r.modelYear || undefined,
    photos: (r.photos as string[] | null) || undefined,
    imageUrl: r.watch.imageUrl || undefined,
    slug: r.watch.slug,
    color: r.watch.color || "default",
    modifications: (r.modifications as string[] | null) || undefined,
  }));

  // Simple wishlist for compact display
  const wishlistCompact = wishlistRows.map((r) => ({
    brand: r.watch.brand,
    model: r.watch.model,
    notes: r.notes || undefined,
  }));

  return {
    user,
    collectionRows,
    wishlistRows,
    score,
    dna,
    nbp,
    collectionForTimeline,
    wishlistCompact,
    followerCount,
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
    collectionForTimeline,
    wishlistCompact,
    followerCount,
  } = data;

  // Check if the logged-in user is viewing their own profile
  const { userId: viewerClerkId } = await auth();
  const isOwner = viewerClerkId ? user.clerkId === viewerClerkId : false;

  const displayName = user.displayName || user.username;
  const hasWatches = collectionRows.length > 0 || wishlistRows.length > 0;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-10" />

        {/* ── Profile Header ─────────────────────────────── */}
        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-10 mb-10">
          {/* Edit button (owner only) */}
          {isOwner && (
            <EditProfileHeader
              currentDisplayName={displayName}
              currentBio={user.bio || ""}
              currentCollectingSince={user.collectingSince || undefined}
            />
          )}

          {/* Left: Avatar + name + bio */}
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-[64px] h-[64px] rounded-full object-cover flex-shrink-0 border border-[rgba(26,24,20,0.08)]"
              />
            ) : (
              <div className="w-[64px] h-[64px] rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1a1814] to-[#2a2a30] text-white font-bold text-[24px]">
                {initial}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-[24px] sm:text-[28px] font-black tracking-tighter leading-none mb-0.5">
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
              {isOwner && !user.bio && (
                <p className="text-[13px] text-[rgba(26,24,20,0.2)] italic">
                  Add a bio — tell people about your watch journey
                </p>
              )}
            </div>
          </div>

          {/* Right: Follow button (hide on own profile) or Settings link */}
          <div className="flex-shrink-0 flex items-start gap-3">
            {isOwner ? (
              <Link
                href="/settings"
                className="px-5 py-2 text-[12px] font-semibold border border-[rgba(26,24,20,0.12)] rounded-full text-[rgba(26,24,20,0.5)] hover:border-[rgba(26,24,20,0.25)] hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            ) : (
              <FollowButton
                userId={user.id}
                isFollowing={false}
                followerCount={followerCount}
              />
            )}
          </div>
        </div>

        {/* ── DNA Tags (subtle) ──────────────────────────── */}
        {dna.tags.length > 0 && (
          <div className="mb-10">
            <DnaTags
              tags={dna.tags.map((t) => ({
                text: t.text,
                primary: t.variant === "primary",
              }))}
            />
          </div>
        )}

        {/* ── Empty State ────────────────────────────────── */}
        {!hasWatches && (
          <section className="mb-14">
            <div className="border border-[rgba(26,24,20,0.08)] border-dashed rounded-[20px] py-16 px-8 text-center">
              <p className="text-[24px] font-light tracking-tight mb-2">
                <span className="font-serif italic font-medium text-[#8a7a5a]">
                  No watches yet
                </span>
              </p>
              <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-2 max-w-md mx-auto">
                {displayName} hasn&apos;t added any watches yet. Check back
                soon!
              </p>
            </div>
          </section>
        )}

        {/* ── The Collection (Timeline) ──────────────────── */}
        {(collectionRows.length > 0 || isOwner) && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-6 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Collection
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                  {collectionRows.length} piece
                  {collectionRows.length !== 1 ? "s" : ""}
                </span>
                {isOwner && (
                  <Link
                    href="/dashboard"
                    className="text-[11px] font-semibold text-[#8a7a5a] hover:underline"
                  >
                    + Add watch
                  </Link>
                )}
              </div>
            </div>
            {collectionRows.length > 0 ? (
              <CollectionTimeline watches={collectionForTimeline} />
            ) : isOwner ? (
              <div className="border border-dashed border-[rgba(26,24,20,0.1)] rounded-[20px] py-12 text-center">
                <p className="text-[15px] text-[rgba(26,24,20,0.3)] mb-3">Your collection is empty</p>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
                >
                  Add your first watch
                </Link>
              </div>
            ) : null}
          </section>
        )}

        {/* ── The Wishlist (Compact) ─────────────────────── */}
        {wishlistCompact.length > 0 && (
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

        {/* ── Collector DNA (subtle bottom section) ──────── */}
        {hasWatches && (
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

        {/* ── CTA Banner ─────────────────────────────────── */}
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

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="text-center py-8">
          <p className="text-[13px] font-light tracking-[4px] uppercase text-[rgba(26,24,20,0.2)]">
            <strong className="font-bold">WRIST</strong>LIST
          </p>
          <p className="text-[11px] text-[rgba(26,24,20,0.15)] mt-2 font-serif italic">
            Every collection tells a story.
          </p>
        </footer>
      </div>
    </div>
  );
}
