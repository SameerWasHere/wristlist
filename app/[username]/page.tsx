import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { Nav } from "@/components/nav";
import { ScoreRing } from "@/components/score-ring";
import { DnaTags } from "@/components/dna-tags";
import { StatsBar } from "@/components/stats-bar";
import { WatchGrid } from "@/components/watch-grid";
import { getDb, schema } from "@/lib/db";
import {
  diversityScore,
  gapAnalysis,
  personality,
  nextBestPurchase,
  radarData,
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function padRank(n: number): string {
  return String(n).padStart(2, "0");
}

function gapColor(current: number, total: number): string {
  const pct = current / total;
  if (pct < 0.3) return "#DC2626";
  if (pct <= 0.6) return "#B8860B";
  return "#059669";
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

  const collectionAnalytics = collectionRows.map((r) => toAnalyticsWatch(r.watch));
  const wishlistAnalytics = wishlistRows.map((r) => toAnalyticsWatch(r.watch));

  const score = diversityScore(collectionAnalytics);
  const dna = personality(collectionAnalytics);
  const gaps = gapAnalysis(collectionAnalytics, wishlistAnalytics);
  const nbp = nextBestPurchase(collectionAnalytics, wishlistAnalytics);
  const radar = radarData(collectionAnalytics, wishlistAnalytics);

  // Projected score (collection + wishlist combined)
  const projectedScore = diversityScore([...collectionAnalytics, ...wishlistAnalytics]);

  const collectionForGrid = collectionRows.map((r) => ({
    brand: r.watch.brand,
    model: r.watch.model,
    reference: r.watch.reference,
    category: r.watch.category || "",
    sizeMm: r.watch.sizeMm || 40,
    movement: r.watch.movement || "",
    price: r.watch.retailPrice || 0,
    color: r.watch.color || "black",
    imageUrl: r.watch.imageUrl || undefined,
  }));

  // Top 3 worst gaps
  const topGaps = [...gaps]
    .sort((a, b) => (a.owned.length / a.total) - (b.owned.length / b.total))
    .slice(0, 3);

  return {
    user,
    collectionRows,
    wishlistRows,
    collectionAnalytics,
    wishlistAnalytics,
    score,
    projectedScore,
    dna,
    gaps,
    topGaps,
    nbp,
    radar,
    collectionForGrid,
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
    projectedScore,
    dna,
    topGaps,
    nbp,
    collectionForGrid,
  } = data;

  const displayName = user.displayName || user.username;
  const hasWatches = collectionRows.length > 0 || wishlistRows.length > 0;

  // Stats bar — omit value on public profiles (privacy)
  const stats = [
    { label: "Watches", value: String(collectionRows.length), accent: "#6b5b3a" },
    {
      label: "Categories",
      value: `${new Set(collectionForGrid.map((w) => w.category.toLowerCase()).filter(Boolean)).size}/7`,
    },
    { label: "On the List", value: String(wishlistRows.length), accent: "#8a7a5a" },
  ];

  // Wishlist ranked by gaps filled
  const rankedWishlist = nbp.map((item, i) => ({
    rank: i + 1,
    brand: item.watch.brand,
    model: item.watch.model,
    price: item.watch.price,
    gapsFilled: item.gapsFilled,
    bestValue: i === 0 && item.gapsFilled > 0,
  }));

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-10" />

        {/* ── Profile Hero ────────────────────────────────── */}
        <div className="flex flex-col-reverse items-center text-center sm:flex-row sm:items-start sm:text-left gap-10 mb-12">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
              The collection of
            </p>
            <h1 className="text-[32px] sm:text-[42px] font-black tracking-tighter leading-none mb-1">
              {displayName}
            </h1>
            <p className="text-[13px] text-[rgba(26,24,20,0.35)] mb-4">
              @{user.username}
              {user.collectingSince && (
                <> &middot; Collecting since {user.collectingSince}</>
              )}
            </p>

            <p className="font-serif italic text-[20px] font-medium text-[rgba(26,24,20,0.7)] tracking-[-0.3px] mb-1.5">
              {dna.archetype}
            </p>
            <p className="text-[14px] text-[rgba(26,24,20,0.4)] leading-[1.7] max-w-[420px] sm:max-w-[420px] mx-auto sm:mx-0">
              {dna.description}
            </p>

            {dna.tags.length > 0 && (
              <div className="mt-5 flex justify-center sm:justify-start">
                <DnaTags
                  tags={dna.tags.map((t) => ({
                    text: t.text,
                    primary: t.variant === "primary",
                  }))}
                />
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex flex-col items-center">
            <ScoreRing score={score} size={120} label="Diversity" />
            {wishlistRows.length > 0 && (
              <p className="text-[10px] text-[rgba(26,24,20,0.3)] font-medium mt-3">
                {projectedScore} with wishlist
              </p>
            )}
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────── */}
        {hasWatches && (
          <div className="mb-12">
            <StatsBar stats={stats} />
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────── */}
        {!hasWatches && (
          <section className="mb-14">
            <div className="border border-[rgba(26,24,20,0.08)] border-dashed rounded-[20px] py-16 px-8 text-center">
              <p className="text-[24px] font-light tracking-tight mb-2">
                <span className="font-serif italic font-medium text-[#8a7a5a]">
                  No watches yet
                </span>
              </p>
              <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-2 max-w-md mx-auto">
                {displayName} hasn&apos;t added any watches yet. Check back soon!
              </p>
            </div>
          </section>
        )}

        {/* ── The Collection ──────────────────────────────── */}
        {collectionRows.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Collection
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {collectionRows.length} piece{collectionRows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <WatchGrid watches={collectionForGrid} />
          </section>
        )}

        {/* ── Collection Gaps ─────────────────────────────── */}
        {topGaps.length > 0 && collectionRows.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
              Collection Gaps
            </h2>
            <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] px-4 sm:px-6 py-5 space-y-4">
              {topGaps.map((gap) => {
                const pct = (gap.owned.length / gap.total) * 100;
                const color = gapColor(gap.owned.length, gap.total);
                return (
                  <div key={gap.dimension}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[13px] font-semibold tracking-tight">
                        {gap.label}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color }}>
                        {gap.owned.length}/{gap.total}
                      </span>
                    </div>
                    <div className="h-[6px] rounded-full bg-[rgba(26,24,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── The Wishlist ────────────────────────────────── */}
        {rankedWishlist.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                The Wishlist
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {rankedWishlist.length} piece{rankedWishlist.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {rankedWishlist.map((w) => (
                <div
                  key={w.rank}
                  className="flex gap-3 sm:gap-4 items-center px-3 sm:px-5 py-3 sm:py-4 bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] transition-all hover:translate-x-1 hover:border-[rgba(26,24,20,0.1)]"
                >
                  <span className="text-[12px] font-black text-[rgba(26,24,20,0.12)] w-5 text-center flex-shrink-0">
                    {padRank(w.rank)}
                  </span>

                  <div
                    className="w-12 h-12 rounded-[14px] flex-shrink-0 flex items-center justify-center font-black text-[18px] text-white/5"
                    style={{
                      background: "linear-gradient(145deg,#20202a,#10101a)",
                    }}
                  >
                    {w.brand.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold">
                      {w.brand}
                    </p>
                    <p className="text-[14px] font-bold tracking-[-0.2px] truncate">
                      {w.model}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-black tracking-[-0.3px]">
                      {formatPrice(w.price)}
                    </p>
                    {w.gapsFilled > 0 && (
                      <p className="text-[9px] font-bold mt-0.5 text-[#6b8f4e]">
                        Fills {w.gapsFilled} gap{w.gapsFilled !== 1 ? "s" : ""}
                        {w.bestValue && (
                          <span className="text-[#b8860b]"> &middot; Best value</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA Banner ──────────────────────────────────── */}
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

        {/* ── Footer ──────────────────────────────────────── */}
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
