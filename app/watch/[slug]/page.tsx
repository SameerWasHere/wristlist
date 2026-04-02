import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { getDb, schema } from "@/lib/db";
import { eq, sql, and, or, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getWatchBySlug(slug: string) {
  const db = getDb();

  const [watch] = await db
    .select()
    .from(schema.watchReferences)
    .where(eq(schema.watchReferences.slug, slug))
    .limit(1);

  return watch || null;
}

async function getOwnerCount(watchId: number) {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.userWatches)
    .where(
      and(
        eq(schema.userWatches.watchReferenceId, watchId),
        eq(schema.userWatches.status, "collection")
      )
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
        eq(schema.userWatches.status, "wishlist")
      )
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
        eq(schema.userWatches.status, "collection")
      )
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
        eq(schema.userWatches.status, "wishlist")
      )
    );
}

async function getRelatedWatches(watchId: number, brand: string, category: string | null) {
  const db = getDb();

  const conditions = category
    ? or(
        and(eq(schema.watchReferences.brand, brand), ne(schema.watchReferences.id, watchId)),
        and(eq(schema.watchReferences.category, category), ne(schema.watchReferences.id, watchId))
      )
    : and(eq(schema.watchReferences.brand, brand), ne(schema.watchReferences.id, watchId));

  return db
    .select({
      id: schema.watchReferences.id,
      slug: schema.watchReferences.slug,
      brand: schema.watchReferences.brand,
      model: schema.watchReferences.model,
      reference: schema.watchReferences.reference,
      category: schema.watchReferences.category,
      imageUrl: schema.watchReferences.imageUrl,
    })
    .from(schema.watchReferences)
    .where(conditions!)
    .limit(4);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const watch = await getWatchBySlug(slug);
  if (!watch) {
    return { title: "Watch Not Found | WristList" };
  }
  return {
    title: `${watch.brand} ${watch.model} | WristList`,
    description: `${watch.brand} ${watch.model} ${watch.reference} — see who owns it, who wants it, and explore specs on WristList.`,
  };
}

export default async function WatchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const watch = await getWatchBySlug(slug);

  if (!watch) {
    notFound();
  }

  const [ownCount, wantCount, collectors, wishlisters, related] = await Promise.all([
    getOwnerCount(watch.id),
    getWishlistCount(watch.id),
    getCollectors(watch.id),
    getWishlisters(watch.id),
    getRelatedWatches(watch.id, watch.brand, watch.category),
  ]);

  const specs = [
    { label: "Movement", value: watch.movement },
    { label: "Size", value: watch.sizeMm ? `${watch.sizeMm}mm` : null },
    { label: "Category", value: watch.category },
    { label: "Origin", value: watch.origin },
    { label: "Crystal", value: watch.crystal },
    { label: "Bracelet", value: watch.braceletType },
    { label: "Water Resistance", value: watch.waterResistanceM ? `${watch.waterResistanceM}m` : null },
    { label: "Material", value: watch.material },
    { label: "Case Back", value: watch.caseBack },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Watch Header */}
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          {/* Image */}
          <div className="w-full sm:w-[280px] h-[280px] rounded-[20px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[3px] font-medium text-[rgba(26,24,20,0.4)] mb-2">
              {watch.brand}
            </p>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1a1814] leading-tight mb-2 font-serif">
              {watch.model}
            </h1>
            {watch.reference && (
              <p className="text-[14px] font-mono text-[rgba(26,24,20,0.35)] mb-6">
                {watch.reference}
              </p>
            )}

            {/* Specs grid */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.3)] mb-0.5">
                      {spec.label}
                    </p>
                    <p className="text-[14px] font-medium text-[#1a1814]">
                      {spec.value}
                    </p>
                  </div>
                ))}
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
                    {(c.caption || c.milestone) && (
                      <p className="text-[13px] text-[rgba(26,24,20,0.4)] font-serif italic truncate">
                        {c.caption ? `"${c.caption}"` : c.milestone}
                      </p>
                    )}
                  </div>

                  {/* Photo thumbnail if exists */}
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

      {/* Footer */}
      <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 text-center">
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
