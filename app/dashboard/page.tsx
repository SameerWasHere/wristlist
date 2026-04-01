import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { Nav } from "@/components/nav";
import { ScoreRing } from "@/components/score-ring";
import { DnaTags } from "@/components/dna-tags";
import { WatchGrid } from "@/components/watch-grid";
import { getDb, schema } from "@/lib/db";
import {
  diversityScore,
  gapAnalysis,
  personality,
  nextBestPurchase,
  type AnalyticsWatch,
} from "@/lib/analytics";
import { DashboardSearch } from "./dashboard-search";

export const metadata: Metadata = {
  title: "Dashboard — WristList",
  description: "Your watch collection at a glance.",
};

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

function gapColor(current: number, total: number): string {
  const pct = current / total;
  if (pct < 0.3) return "#DC2626";
  if (pct <= 0.6) return "#B8860B";
  return "#059669";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const db = getDb();

  // Get user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  // Fetch collection and wishlist
  const collectionRows = user
    ? await db
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
        )
    : [];

  const wishlistRows = user
    ? await db
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
        )
    : [];

  // Convert to analytics format
  const collectionAnalytics = collectionRows.map((r) => toAnalyticsWatch(r.watch));
  const wishlistAnalytics = wishlistRows.map((r) => toAnalyticsWatch(r.watch));

  // Run analytics
  const score = diversityScore(collectionAnalytics);
  const dna = personality(collectionAnalytics);
  const gaps = gapAnalysis(collectionAnalytics, wishlistAnalytics);
  const nbp = nextBestPurchase(collectionAnalytics, wishlistAnalytics);

  // Top 3 worst gaps
  const topGaps = [...gaps]
    .sort((a, b) => (a.owned.length / a.total) - (b.owned.length / b.total))
    .slice(0, 3);

  // Watch grid format
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

  const totalValue = collectionForGrid.reduce((s, w) => s + w.price, 0);
  const topNbp = nbp[0];
  const isEmpty = collectionRows.length === 0 && wishlistRows.length === 0;

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-8" />

        {/* Compact Score Bar */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] px-4 sm:px-6 py-4 mb-10 flex flex-wrap items-center gap-4 sm:gap-6">
          <ScoreRing score={score} size={44} />
          <div className="flex items-center gap-4 sm:gap-8 text-[13px]">
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Owned</span>{" "}
              <span className="font-bold tracking-tight">{collectionRows.length}</span>
            </div>
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Value</span>{" "}
              <span className="font-bold tracking-tight">
                ${totalValue >= 1000 ? `${Math.round(totalValue / 1000)}k` : totalValue}
              </span>
            </div>
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Wishlist</span>{" "}
              <span className="font-bold tracking-tight">{wishlistRows.length}</span>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <section className="mb-14">
            <div className="border border-[rgba(26,24,20,0.08)] border-dashed rounded-[20px] py-16 px-8 text-center">
              <p className="text-[24px] font-light tracking-tight mb-2">
                Start your{" "}
                <span className="font-serif italic font-medium text-[#8a7a5a]">collection</span>
              </p>
              <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-6 max-w-md mx-auto">
                Search for a watch below to add it to your collection or wishlist. Your diversity score, DNA, and recommendations will appear as you add watches.
              </p>
            </div>
          </section>
        )}

        {/* Search - always visible */}
        <section className="mb-14">
          <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            Add a Watch
          </h2>
          <DashboardSearch />
        </section>

        {/* My Collection */}
        {collectionRows.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
              <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
                My Collection
              </h2>
              <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
                {collectionRows.length} pieces
              </span>
            </div>
            <WatchGrid watches={collectionForGrid} />
          </section>
        )}

        {/* DNA Tags */}
        {dna.tags.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
              Collector DNA
            </h2>
            <p className="text-[13px] text-[rgba(26,24,20,0.4)] mb-4 font-serif italic">
              {dna.archetype}
            </p>
            <DnaTags tags={dna.tags.map(t => ({ text: t.text, primary: t.variant === "primary" }))} />
          </section>
        )}

        {/* Your Next Move */}
        {topNbp && topNbp.gapsFilled > 0 && (
          <section className="mb-14">
            <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
              Your Next Move
            </h2>
            <div
              className="rounded-[20px] px-6 py-5 border"
              style={{
                background: "linear-gradient(135deg, rgba(5,150,105,0.04) 0%, rgba(5,150,105,0.02) 100%)",
                borderColor: "rgba(5,150,105,0.12)",
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold mb-0.5">
                    {topNbp.watch.brand}
                  </p>
                  <p className="text-[18px] font-bold tracking-[-0.3px]">{topNbp.watch.model}</p>
                  <p className="text-[13px] text-[rgba(26,24,20,0.45)] mt-1 leading-relaxed max-w-md">
                    Fills {topNbp.gapsFilled} gap{topNbp.gapsFilled !== 1 ? "s" : ""} in your collection
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[20px] font-black tracking-[-0.5px]">
                    {formatPrice(topNbp.watch.price)}
                  </p>
                  <span className="inline-block mt-1.5 text-[9px] font-bold text-[#059669] bg-[rgba(5,150,105,0.08)] px-2.5 py-1 rounded-full">
                    Best value on your wishlist
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Collection Gaps */}
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
                      <span className="text-[13px] font-semibold tracking-tight">{gap.label}</span>
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
              {user && (
                <Link
                  href={`/${user.username}`}
                  className="inline-block mt-2 text-[12px] font-semibold text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
                >
                  See full analysis &rarr;
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
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
