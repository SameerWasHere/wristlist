import { Nav } from "@/components/nav";
import { TopList } from "@/components/top-list";
import { CollectorCard } from "@/components/collector-card";
import { CtaBanner } from "@/components/cta-banner";
// Watch tools moved to /tools page
import { HeroSection } from "./hero-section";
import { getDb, schema } from "@/lib/db";
import { eq, sql, desc } from "drizzle-orm";
import { personality, diversityScore, type AnalyticsWatch } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Data fetching — all from real DB, no hardcoded anything
// ---------------------------------------------------------------------------

async function getTopLists() {
  try {
    const db = getDb();

    // Most collected: watches with the most user_watches entries where status = 'collection'
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
      .limit(5);

    // Most wishlisted: watches with the most user_watches entries where status = 'wishlist'
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
      .limit(5);

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

    // Get users who have at least 1 watch, ordered by most watches
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

    // For each user, get their watches and run analytics
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
        status: schema.userWatches.status,
        caption: schema.userWatches.caption,
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
      .limit(8);

    return recent.map((r) => {
      const name = r.userName || r.username;
      const action = r.status === "collection" ? "added" : "wishlisted";
      const watch = `${r.brand} ${r.model}`;
      const ago = timeAgo(r.dateAdded);
      return {
        user: name,
        username: r.username,
        initial: name.charAt(0),
        action,
        watch,
        slug: r.slug,
        caption: r.caption,
        imageUrl: r.imageUrl,
        time: ago,
      };
    });
  } catch {
    return [];
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

// Tools section is now a live component (WatchToolsLive)

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  const [{ mostCollected, mostWishlisted }, collectors, activity] = await Promise.all([
    getTopLists(),
    getFeaturedCollectors(),
    getRecentActivity(),
  ]);

  const hasTopLists = mostCollected.length > 0 || mostWishlisted.length > 0;
  const hasCollectors = collectors.length > 0;
  const hasActivity = activity.length > 0;

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      {/* Hero */}
      <HeroSection />

      {/* Top Lists — only shows if real users have added watches */}
      {hasTopLists && (
        <section id="top-lists" className="max-w-[960px] mx-auto px-4 sm:px-6 py-16 scroll-mt-16">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
            Top Lists
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mostCollected.length > 0 && (
              <TopList title="Most Collected" subtitle="Watches owned by the most collectors" items={mostCollected} />
            )}
            {mostWishlisted.length > 0 && (
              <TopList title="Most Wishlisted" subtitle="The watches everyone wants next" items={mostWishlisted} />
            )}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
        <CtaBanner />
      </section>

      {/* Featured Collectors — only shows if real users exist */}
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

      {/* Recent Activity — only shows if real activity exists */}
      {hasActivity && (
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-6">
            Recent Activity
          </p>
          <div className="flex flex-col gap-4">
            {activity.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-4 sm:p-5"
              >
                {/* Header: who did what */}
                <div className="flex items-center gap-3 mb-2">
                  <a href={`/${item.username}`} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1814] to-[#2a2a30] flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-bold text-white/70">{item.initial}</span>
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground">
                      <a href={`/${item.username}`} className="font-semibold hover:text-[#8a7a5a] transition-colors">{item.user}</a>{" "}
                      <span className="text-[rgba(26,24,20,0.4)]">{item.action}</span>{" "}
                      <a href={`/watch/${item.slug}`} className="font-medium text-[#8a7a5a] hover:underline">{item.watch}</a>
                    </p>
                  </div>
                  <span className="text-[11px] text-[rgba(26,24,20,0.25)] flex-shrink-0">{item.time}</span>
                </div>
                {/* Caption */}
                {item.caption && (
                  <p className="text-[13px] text-[rgba(26,24,20,0.55)] mb-2 ml-12">&ldquo;{item.caption}&rdquo;</p>
                )}
                {/* Watch thumbnail */}
                {item.imageUrl && (
                  <a href={`/watch/${item.slug}`} className="block ml-12 mt-1">
                    <div className="w-full max-w-[200px] h-[100px] rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] overflow-hidden">
                      <img src={item.imageUrl} alt={item.watch} className="w-full h-full object-contain p-3" />
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[15px] font-light tracking-[4px] uppercase text-foreground">
            <strong className="font-bold">WRIST</strong>LIST
          </p>
          <p className="text-[14px] font-serif italic text-[rgba(26,24,20,0.3)] mt-2">
            Every collection tells a story.
          </p>
        </div>
      </footer>
    </div>
  );
}
