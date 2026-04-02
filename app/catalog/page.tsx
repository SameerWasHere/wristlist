import { Nav } from "@/components/nav";
import { getDb, schema } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { CatalogGrid } from "./catalog-grid";
import type { CatalogFamily } from "./catalog-grid";
import Link from "next/link";

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

export default async function CatalogPage() {
  const families = await getCatalogFamilies();

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-12">
        {/* Page title */}
        <h1 className="font-serif italic text-[28px] sm:text-[36px] text-foreground tracking-tight mb-1">
          Discover
        </h1>
        <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-8">
          Browse {families.length} watches across {new Set(families.map(f => f.brand)).size} brands.
        </p>

        <CatalogGrid families={families} />

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
