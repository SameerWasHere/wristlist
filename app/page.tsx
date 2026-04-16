import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { TopList } from "@/components/top-list";
import { CollectorCard } from "@/components/collector-card";
import { HeroSection } from "./hero-section";
import { CtaBanner } from "./cta-banner";
import { getDb, schema } from "@/lib/db";
import { eq, sql, desc, gte } from "drizzle-orm";
import { personality, diversityScore, type AnalyticsWatch } from "@/lib/analytics";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Data fetching — all from real DB, no hardcoded anything
// ---------------------------------------------------------------------------

async function getTopLists() {
  try {
    const db = getDb();

    const collected = await db
      .select({
        watchId: schema.watchReferences.id,
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        reference: schema.watchReferences.reference,
        category: schema.watchReferences.category,
        sizeMm: schema.watchReferences.sizeMm,
        imageUrl: schema.watchReferences.imageUrl,
        count: sql<number>`count(${schema.userWatches.id})::int`,
      })
      .from(schema.userWatches)
      .innerJoin(schema.watchReferences, eq(schema.userWatches.watchReferenceId, schema.watchReferences.id))
      .where(eq(schema.userWatches.status, "collection"))
      .groupBy(schema.watchReferences.id)
      .orderBy(desc(sql`count(${schema.userWatches.id})`))
      .limit(3);

    const wishlisted = await db
      .select({
        watchId: schema.watchReferences.id,
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        reference: schema.watchReferences.reference,
        category: schema.watchReferences.category,
        sizeMm: schema.watchReferences.sizeMm,
        imageUrl: schema.watchReferences.imageUrl,
        count: sql<number>`count(${schema.userWatches.id})::int`,
      })
      .from(schema.userWatches)
      .innerJoin(schema.watchReferences, eq(schema.userWatches.watchReferenceId, schema.watchReferences.id))
      .where(eq(schema.userWatches.status, "wishlist"))
      .groupBy(schema.watchReferences.id)
      .orderBy(desc(sql`count(${schema.userWatches.id})`))
      .limit(3);

    const toItems = (rows: typeof collected) =>
      rows.map((w, i) => ({
        rank: i + 1,
        name: `${w.brand} ${w.model}`,
        detail: [w.reference, w.category, w.sizeMm ? `${w.sizeMm}mm` : null].filter(Boolean).join(" · "),
        count: w.count,
        brand: w.brand,
        initial: w.brand.charAt(0),
        imageUrl: w.imageUrl,
      }));

    return { mostCollected: toItems(collected), mostWishlisted: toItems(wishlisted) };
  } catch {
    return { mostCollected: [], mostWishlisted: [] };
  }
}

async function getFeaturedCollectors() {
  try {
    const db = getDb();

    const usersWithCounts = await db
      .select({
        userId: schema.users.id,
        username: schema.users.username,
        displayName: schema.users.displayName,
        count: sql<number>`count(${schema.userWatches.id})::int`,
      })
      .from(schema.users)
      .innerJoin(schema.userWatches, eq(schema.users.id, schema.userWatches.userId))
      .where(eq(schema.userWatches.status, "collection"))
      .groupBy(schema.users.id)
      .orderBy(desc(sql`count(${schema.userWatches.id})`))
      .limit(6);

    const collectors = await Promise.all(
      usersWithCounts.map(async (u) => {
        const watches = await db
          .select({ watch: schema.watchReferences })
          .from(schema.userWatches)
          .innerJoin(schema.watchReferences, eq(schema.userWatches.watchReferenceId, schema.watchReferences.id))
          .where(eq(schema.userWatches.userId, u.userId));

        const analyticsWatches: AnalyticsWatch[] = watches.map((r) => ({
          movement: r.watch.movement || "",
          category: r.watch.category || "",
          material: r.watch.material || "",
          bezel_type: r.watch.bezelType || "",
          bracelet_type: r.watch.braceletType || "",
          shape: r.watch.shape || "",
          color: r.watch.color || "",
          crystal: r.watch.crystal || "",
          origin: r.watch.origin || "",
          case_back: r.watch.caseBack || "",
          water_resistance_m: r.watch.waterResistanceM || 0,
          price: r.watch.retailPrice || 0,
          brand: r.watch.brand,
          model: r.watch.model,
        }));

        const dna = personality(analyticsWatches);
        const score = diversityScore(analyticsWatches);

        return {
          name: u.displayName || u.username,
          archetype: dna.archetype,
          watchCount: u.count,
          score,
          tags: dna.tags.slice(0, 3).map((t) => t.text),
          href: `/${u.username}`,
        };
      })
    );

    return collectors;
  } catch {
    return [];
  }
}

async function getRecentActivity() {
  try {
    const db = getDb();

    const recent = await db
      .select({
        userName: schema.users.displayName,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
        status: schema.userWatches.status,
        caption: schema.userWatches.caption,
        photos: schema.userWatches.photos,
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        slug: schema.watchReferences.slug,
        imageUrl: schema.watchReferences.imageUrl,
        dateAdded: schema.userWatches.dateAdded,
      })
      .from(schema.userWatches)
      .innerJoin(schema.users, eq(schema.userWatches.userId, schema.users.id))
      .innerJoin(schema.watchReferences, eq(schema.userWatches.watchReferenceId, schema.watchReferences.id))
      .orderBy(desc(schema.userWatches.dateAdded))
      .limit(12);

    return recent.map((r) => {
      const name = r.userName || r.username;
      const action = r.status === "collection" ? "added" : "wishlisted";
      const watch = `${r.brand} ${r.model}`;
      const ago = timeAgo(r.dateAdded);
      const userPhoto = r.photos && r.photos.length > 0 ? r.photos[0] : null;
      return {
        user: name,
        username: r.username,
        avatarUrl: r.avatarUrl,
        initial: name.charAt(0),
        action,
        watch,
        slug: r.slug,
        caption: r.caption,
        imageUrl: userPhoto || r.imageUrl,
        time: ago,
      };
    });
  } catch {
    return [];
  }
}

async function getTrendingWatches() {
  try {
    const db = getDb();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await db
      .select({
        watchId: schema.watchReferences.id,
        brand: schema.watchReferences.brand,
        model: schema.watchReferences.model,
        slug: schema.watchReferences.slug,
        imageUrl: schema.watchReferences.imageUrl,
        count: sql<number>`count(${schema.userWatches.id})::int`,
      })
      .from(schema.userWatches)
      .innerJoin(schema.watchReferences, eq(schema.userWatches.watchReferenceId, schema.watchReferences.id))
      .where(gte(schema.userWatches.dateAdded, sevenDaysAgo))
      .groupBy(schema.watchReferences.id)
      .orderBy(desc(sql`count(${schema.userWatches.id})`))
      .limit(5);

    return trending;
  } catch {
    return [];
  }
}

async function getCatalogStats() {
  try {
    const db = getDb();
    const [watchCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.watchReferences);
    const [brandCount] = await db.select({ count: sql<number>`count(distinct brand)::int` }).from(schema.watchReferences);
    const [collectorCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
    return {
      watches: watchCount?.count ?? 0,
      brands: brandCount?.count ?? 0,
      collectors: collectorCount?.count ?? 0,
    };
  } catch {
    return { watches: 0, brands: 0, collectors: 0 };
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  // Auth check for hero CTA
  const { userId: clerkId } = await auth();
  const isSignedIn = !!clerkId;

  let profileUrl = "/sign-in";
  if (clerkId) {
    try {
      const db = getDb();
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkId))
        .limit(1);
      if (user) profileUrl = `/${user.username}`;
    } catch {
      profileUrl = "/dashboard";
    }
  }

  const [{ mostCollected, mostWishlisted }, collectors, activity, trending, stats] = await Promise.all([
    getTopLists(),
    getFeaturedCollectors(),
    getRecentActivity(),
    getTrendingWatches(),
    getCatalogStats(),
  ]);

  const hasTopLists = mostCollected.length > 0 || mostWishlisted.length > 0;
  const hasCollectors = collectors.length > 0;
  const hasActivity = activity.length > 0;
  const hasTrending = trending.length > 0;

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      {/* Hero */}
      <HeroSection profileUrl={isSignedIn ? profileUrl : undefined} stats={stats} />

      {/* 1. Trending Watches — only show when there's data */}
      {hasTrending && (
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
            Trending This Week
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x">
            {trending.map((w) => (
              <Link
                key={w.watchId}
                href={`/watch/${w.slug}`}
                className="snap-start flex-shrink-0 bg-white rounded-[16px] shadow-[0_1px_4px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden w-[200px] sm:w-[220px] hover:shadow-[0_4px_20px_rgba(26,24,20,0.1)] hover:border-[rgba(26,24,20,0.1)] transition-all duration-300 no-underline text-inherit group"
              >
                <div className="w-full h-[140px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] overflow-hidden">
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt={`${w.brand} ${w.model}`} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/15 text-[32px] font-bold font-serif">{w.brand.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] font-medium truncate">{w.brand}</p>
                  <p className="text-[14px] font-semibold text-foreground truncate mt-0.5">{w.model}</p>
                  <p className="text-[11px] text-[#8a7a5a] font-medium mt-1.5">{w.count} {w.count === 1 ? "add" : "adds"} this week</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. Featured Collectors — social proof */}
      {hasCollectors && (
        <section id="collectors" className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16 scroll-mt-16">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
            Collectors
          </p>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x">
            {collectors.map((c) => (
              <div key={c.name} className="snap-start flex-shrink-0">
                <CollectorCard
                  name={c.name}
                  archetype={c.archetype}
                  watchCount={c.watchCount}
                  score={c.score}
                  value=""
                  tags={c.tags}
                  href={c.href}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Top Lists */}
      {hasTopLists && (
        <section id="top-lists" className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16 scroll-mt-16">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
            Top Lists
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mostCollected.length > 0 && (
              <TopList title="Most Collected" subtitle="Owned by the most collectors" items={mostCollected} />
            )}
            {mostWishlisted.length > 0 && (
              <TopList title="Most Wishlisted" subtitle="On everyone's radar" items={mostWishlisted} />
            )}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/catalog"
              className="text-[13px] font-medium text-[#8a7a5a] hover:underline"
            >
              Browse full catalog &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* 4. Recent Activity — the feed */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
          Recent Activity
        </p>
        {hasActivity ? (
          <div className="flex flex-col gap-4">
            {activity.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] shadow-[0_1px_4px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-4 sm:p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/${item.username}`} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1814] to-[#2a2a30] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.user} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px] font-bold text-white/70">{item.initial}</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground">
                      <Link href={`/${item.username}`} className="font-semibold hover:text-[#8a7a5a] transition-colors">{item.user}</Link>{" "}
                      <span className="text-[rgba(26,24,20,0.4)]">{item.action}</span>{" "}
                      <Link href={`/watch/${item.slug}`} className="font-medium text-[#8a7a5a] hover:underline">{item.watch}</Link>
                    </p>
                  </div>
                  <span className="text-[11px] text-[rgba(26,24,20,0.25)] flex-shrink-0">{item.time}</span>
                </div>
                {item.caption && (
                  <p className="text-[13px] text-[rgba(26,24,20,0.55)] mb-2 ml-12 font-serif italic">&ldquo;{item.caption}&rdquo;</p>
                )}
                {item.imageUrl && (
                  <Link href={`/watch/${item.slug}`} className="block ml-12 mt-1">
                    <div className="w-full max-w-[200px] h-[100px] rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] overflow-hidden">
                      <img src={item.imageUrl} alt={item.watch} className="w-full h-full object-contain p-3" />
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] p-10 text-center">
            <p className="text-[16px] font-serif italic text-[rgba(26,24,20,0.45)] mb-2">
              Be the first to share your collection
            </p>
            <p className="text-[13px] text-[rgba(26,24,20,0.3)] mb-5 max-w-sm mx-auto">
              Add watches to your profile and your activity will show up here for the community to see.
            </p>
            <Link
              href="/catalog"
              className="inline-block px-6 py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
            >
              Browse the Catalog
            </Link>
          </div>
        )}
      </section>

      {/* 5. CTA Banner — for non-signed-in visitors */}
      {!isSignedIn && <CtaBanner />}

      <Footer />
    </div>
  );
}
