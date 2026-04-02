import { Nav } from "@/components/nav";
import { getDb, schema } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { CatalogGrid } from "./catalog-grid";
import type { CatalogFamily } from "./catalog-grid";
import Link from "next/link";

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

export const dynamic = "force-dynamic";

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

async function getCatalogFamilies(): Promise<CatalogFamily[]> {
  try {
    const db = getDb();
    const collectionExists = hasCollectionField();

    // Build select fields dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectFields: Record<string, any> = {
      id: schema.watchFamilies.id,
      slug: schema.watchFamilies.slug,
      brand: schema.watchFamilies.brand,
      model: schema.watchFamilies.model,
      imageUrl: schema.watchFamilies.imageUrl,
      variationCount: sql<number>`count(distinct ${schema.watchReferences.id})::int`,
      collectorCount: sql<number>`count(distinct case when ${schema.userWatches.status} = 'collection' then ${schema.userWatches.userId} end)::int`,
      topCategory: sql<string | null>`mode() within group (order by ${schema.watchReferences.category})`,
      topOrigin: sql<string | null>`mode() within group (order by ${schema.watchReferences.origin})`,
      avgPrice: sql<number | null>`avg(${schema.watchReferences.retailPrice})::int`,
    };

    if (collectionExists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectFields.collection = (schema.watchFamilies as any).collection;
    }

    // Get all families with variation count, collector count, and most common category/origin
    const rows = await db
      .select(selectFields)
      .from(schema.watchFamilies)
      .leftJoin(
        schema.watchReferences,
        eq(schema.watchFamilies.id, schema.watchReferences.familyId),
      )
      .leftJoin(
        schema.userWatches,
        eq(schema.watchReferences.id, schema.userWatches.watchReferenceId),
      )
      .groupBy(
        schema.watchFamilies.id,
        ...(collectionExists
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? [(schema.watchFamilies as any).collection]
          : []),
      )
      .orderBy(
        desc(
          sql`count(distinct case when ${schema.userWatches.status} = 'collection' then ${schema.userWatches.userId} end)`,
        ),
      );

    return rows.map((r) => ({
      ...r,
      collection: collectionExists ? (r as Record<string, unknown>).collection as string | null ?? null : null,
    })) as CatalogFamily[];
  } catch {
    return [];
  }
}

async function getCatalogStats() {
  try {
    const db = getDb();
    const [contributorResult] = await db
      .select({ count: sql<number>`count(distinct ${schema.catalogEdits.userId})::int` })
      .from(schema.catalogEdits);

    const recentEdits = await db
      .select({
        id: schema.catalogEdits.id,
        action: schema.catalogEdits.action,
        targetType: schema.catalogEdits.targetType,
        targetId: schema.catalogEdits.targetId,
        fieldChanged: schema.catalogEdits.fieldChanged,
        createdAt: schema.catalogEdits.createdAt,
        username: schema.users.username,
        displayName: schema.users.displayName,
      })
      .from(schema.catalogEdits)
      .innerJoin(schema.users, eq(schema.catalogEdits.userId, schema.users.id))
      .orderBy(desc(schema.catalogEdits.createdAt))
      .limit(5);

    // Enrich with watch names
    const enriched = await Promise.all(
      recentEdits.map(async (edit) => {
        let watchName = "";
        try {
          const db2 = getDb();
          if (edit.targetType === "family") {
            const [f] = await db2
              .select({ brand: schema.watchFamilies.brand, model: schema.watchFamilies.model })
              .from(schema.watchFamilies)
              .where(eq(schema.watchFamilies.id, edit.targetId))
              .limit(1);
            if (f) watchName = `${f.brand} ${f.model}`;
          } else {
            const [r] = await db2
              .select({ brand: schema.watchReferences.brand, model: schema.watchReferences.model })
              .from(schema.watchReferences)
              .where(eq(schema.watchReferences.id, edit.targetId))
              .limit(1);
            if (r) watchName = `${r.brand} ${r.model}`;
          }
        } catch {
          // ignore
        }
        return { ...edit, watchName };
      }),
    );

    return {
      contributorCount: contributorResult?.count ?? 0,
      recentEdits: enriched,
    };
  } catch {
    return { contributorCount: 0, recentEdits: [] };
  }
}

export default async function CatalogPage() {
  const [families, stats] = await Promise.all([
    getCatalogFamilies(),
    getCatalogStats(),
  ]);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-12">
        {/* Page title */}
        <h1 className="font-serif italic text-[28px] sm:text-[36px] text-foreground tracking-tight mb-1">
          Discover
        </h1>
        <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-8">
          {families.length} watches cataloged by {stats.contributorCount} contributor{stats.contributorCount !== 1 ? "s" : ""} across {new Set(families.map(f => f.brand)).size} brands.
        </p>

        <CatalogGrid families={families} />

        {/* Recently Updated */}
        {stats.recentEdits.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
              Recently Updated
            </h2>
            <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] shadow-[0_2px_12px_rgba(26,24,20,0.03)] overflow-hidden">
              {stats.recentEdits.map((edit, i) => (
                <div
                  key={edit.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i > 0 ? "border-t border-[rgba(26,24,20,0.06)]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1814] truncate">
                      <Link href={`/${edit.username}`} className="font-semibold hover:text-[#8a7a5a]">
                        @{edit.username}
                      </Link>{" "}
                      {edit.action === "create" ? "added" : "edited"}{" "}
                      <span className="font-medium">{edit.watchName || "a watch"}</span>
                      {edit.action === "edit" && edit.fieldChanged && (
                        <span className="text-[rgba(26,24,20,0.4)]"> ({edit.fieldChanged})</span>
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] text-[rgba(26,24,20,0.3)] flex-shrink-0">
                    {timeAgo(edit.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA at bottom */}
        <div className="mt-12 text-center">
          <Link
            href="/profile"
            className="inline-block px-6 py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
          >
            Don&apos;t see your watch? Add it
          </Link>
        </div>
      </section>

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
