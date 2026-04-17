"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

export interface CatalogFamily {
  id: number;
  slug: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  variationCount: number;
  collectorCount: number;
  topCategory: string | null;
  topOrigin: string | null;
  avgPrice: number | null;
}

const CATEGORIES = ["All", "Diver", "Pilot", "Dress", "Field", "Chronograph", "Digital", "GMT"] as const;
const ORIGINS = ["Swiss", "Japanese", "German", "American"] as const;
interface PriceTierDef {
  label: string;
  min?: number;
  max?: number;
}

const PRICE_TIERS: PriceTierDef[] = [
  { label: "Under $500", max: 500 },
  { label: "$500-$2k", min: 500, max: 2000 },
  { label: "$2k-$5k", min: 2000, max: 5000 },
  { label: "$5k-$10k", min: 5000, max: 10000 },
  { label: "$10k+", min: 10000 },
];

function matchesTier(price: number | null, tier: PriceTierDef | null): boolean {
  if (!tier) return true;
  if (price === null) return false;
  if (tier.min !== undefined && price < tier.min) return false;
  if (tier.max !== undefined && price >= tier.max) return false;
  return true;
}

const colorGradients: Record<string, string> = {
  black: "linear-gradient(155deg, #0a0a0a, #1a2332)",
  blue: "linear-gradient(155deg, #0a1020, #1a2332)",
  green: "linear-gradient(155deg, #0a1a0a, #1a2a1a)",
  gold: "linear-gradient(155deg, #1a1a0a, #2a2a18)",
  default: "linear-gradient(155deg, #0a0a0a, #1a1a20)",
};

export function CatalogGrid({ families }: { families: CatalogFamily[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeOrigin, setActiveOrigin] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<PriceTierDef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // When the user is actively searching, hit the unified API so refs,
  // nicknames, and descriptions all match — not just brand/model. Results
  // come back ranked by relevance with the matched variation attached.
  const [searchMatchedIds, setSearchMatchedIds] = useState<Set<number> | null>(null);
  const [matchedOrder, setMatchedOrder] = useState<number[]>([]);
  const [matchedVariantByFamily, setMatchedVariantByFamily] = useState<
    Map<number, { reference: string; variantName: string | null; imageUrl: string | null }>
  >(new Map());
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchMatchedIds(null);
      setMatchedOrder([]);
      setMatchedVariantByFamily(new Map());
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/watches/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        const famResults: Array<{
          id: number;
          matchedBy?: string;
          matchedVariant?: { reference: string; variantName: string | null; imageUrl: string | null } | null;
        }> = data.families ?? [];
        const ids = new Set(famResults.map((f) => f.id));
        const order = famResults.map((f) => f.id);
        const variantMap = new Map<
          number,
          { reference: string; variantName: string | null; imageUrl: string | null }
        >();
        for (const f of famResults) {
          if (
            f.matchedVariant &&
            (f.matchedBy === "reference" || f.matchedBy === "variantName")
          ) {
            variantMap.set(f.id, f.matchedVariant);
          }
        }
        setSearchMatchedIds(ids);
        setMatchedOrder(order);
        setMatchedVariantByFamily(variantMap);
      } catch {
        // Fall back to local-only filtering on error
        setSearchMatchedIds(null);
        setMatchedOrder([]);
        setMatchedVariantByFamily(new Map());
      } finally {
        setSearchLoading(false);
      }
    }, 200);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Extract unique brands sorted alphabetically
  const brands = useMemo(() => {
    const set = new Set(families.map((f) => f.brand));
    return Array.from(set).sort();
  }, [families]);

  const filtered = useMemo(() => {
    // Step 1: pure filter (category / origin / brand / price tier)
    const byFilters = families.filter((f) => {
      if (activeCategory !== "All" && f.topCategory?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      if (activeOrigin && f.topOrigin?.toLowerCase() !== activeOrigin.toLowerCase()) return false;
      if (activeBrand && f.brand !== activeBrand) return false;
      if (!matchesTier(f.avgPrice, activeTier)) return false;
      return true;
    });

    // Step 2: no query → return all filtered families
    if (!searchMatchedIds) {
      return byFilters;
    }

    // Step 3: with query, keep only families in the API result set and
    // preserve the API's relevance order.
    const inSearch = byFilters.filter((f) => searchMatchedIds.has(f.id));
    inSearch.sort((a, b) => matchedOrder.indexOf(a.id) - matchedOrder.indexOf(b.id));
    return inSearch;
  }, [families, activeCategory, activeOrigin, activeBrand, activeTier, searchMatchedIds, matchedOrder]);

  const activeFilterCount = [
    activeCategory !== "All" ? 1 : 0,
    activeOrigin ? 1 : 0,
    activeBrand ? 1 : 0,
    activeTier ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(26,24,20,0.2)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search watches..."
            className="w-full pl-10 pr-4 py-3 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[14px] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-[14px] text-[13px] font-medium transition-colors flex-shrink-0 ${
            activeFilterCount > 0
              ? "bg-[#8a7a5a] text-white"
              : "bg-white border border-[rgba(26,24,20,0.08)] text-[rgba(26,24,20,0.5)] hover:border-[rgba(26,24,20,0.15)]"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeCategory !== "All" && (
            <button onClick={() => setActiveCategory("All")} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(138,122,90,0.1)] text-[#8a7a5a]">
              {activeCategory} <span className="text-[rgba(138,122,90,0.4)]">&times;</span>
            </button>
          )}
          {activeOrigin && (
            <button onClick={() => setActiveOrigin(null)} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(138,122,90,0.1)] text-[#8a7a5a]">
              {activeOrigin} <span className="text-[rgba(138,122,90,0.4)]">&times;</span>
            </button>
          )}
          {activeTier && (
            <button onClick={() => setActiveTier(null)} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(138,122,90,0.1)] text-[#8a7a5a]">
              {activeTier.label} <span className="text-[rgba(138,122,90,0.4)]">&times;</span>
            </button>
          )}
          {activeBrand && (
            <button onClick={() => setActiveBrand(null)} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(138,122,90,0.1)] text-[#8a7a5a]">
              {activeBrand} <span className="text-[rgba(138,122,90,0.4)]">&times;</span>
            </button>
          )}
          <button
            onClick={() => { setActiveCategory("All"); setActiveOrigin(null); setActiveBrand(null); setActiveTier(null); }}
            className="text-[11px] text-[rgba(26,24,20,0.3)] hover:text-[rgba(26,24,20,0.5)] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter panel (collapsible) */}
      {filtersOpen && (
        <div className="bg-white border border-[rgba(26,24,20,0.08)] rounded-[16px] p-5 mb-6 space-y-5">
          {/* Type */}
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-[#8a7a5a] text-white"
                      : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.08)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Origin */}
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">Origin</p>
            <div className="flex flex-wrap gap-1.5">
              {ORIGINS.map((origin) => (
                <button
                  key={origin}
                  onClick={() => setActiveOrigin(activeOrigin === origin ? null : origin)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeOrigin === origin
                      ? "bg-[#8a7a5a] text-white"
                      : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.08)]"
                  }`}
                >
                  {origin}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">Price Range</p>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  onClick={() => setActiveTier(activeTier?.label === tier.label ? null : tier)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    activeTier?.label === tier.label
                      ? "bg-[#8a7a5a] text-white"
                      : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.08)]"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          {brands.length > 1 && (
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">Brand</p>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                      activeBrand === brand
                        ? "bg-[#8a7a5a] text-white"
                        : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.08)]"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-[rgba(26,24,20,0.3)]">
          {filtered.length} {filtered.length === 1 ? "watch" : "watches"}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[rgba(26,24,20,0.1)] rounded-[20px] py-16 px-8 text-center">
          <p className="text-[18px] font-light text-foreground mb-2">No watches found</p>
          <p className="text-[13px] text-[rgba(26,24,20,0.35)]">
            Try adjusting your filters or search.
          </p>
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {filtered.map((f) => (
            <FamilyCard
              key={f.id}
              family={f}
              matchedVariant={matchedVariantByFamily.get(f.id) ?? null}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FamilyCard({
  family: f,
  matchedVariant,
}: {
  family: CatalogFamily;
  matchedVariant?: { reference: string; variantName: string | null; imageUrl: string | null } | null;
}) {
  const initial = f.brand.charAt(0);
  const tierLabel = f.avgPrice
    ? f.avgPrice < 500 ? "Entry" : f.avgPrice < 2000 ? "Mid" : f.avgPrice < 5000 ? "Premium" : f.avgPrice < 10000 ? "Luxury" : "Ultra"
    : null;

  return (
    <Link
      href={`/watch/${f.slug}`}
      className="bg-white rounded-[16px] overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.1)] transition-all duration-300 no-underline text-inherit group border border-[rgba(26,24,20,0.04)]"
    >
      {/* Image — prefer the matched variant's image when the search matched
          a specific ref or nickname, so "Batman" surfaces the Batman dial. */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden"
        style={{ background: colorGradients.default }}
      >
        {(matchedVariant?.imageUrl || f.imageUrl) ? (
          <img
            src={matchedVariant?.imageUrl || f.imageUrl!}
            alt={`${f.brand} ${f.model}`}
            className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/[0.04] text-[72px] font-bold font-serif">{initial}</span>
          </div>
        )}

        {/* Tier badge */}
        {tierLabel && (
          <span className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white/70 backdrop-blur-sm">
            {tierLabel}
          </span>
        )}

        {/* Match badge — shows why this card appeared when search matched a ref/nickname */}
        {matchedVariant?.variantName && (
          <span className="absolute bottom-3 left-3 text-[10px] font-serif italic font-medium px-2 py-0.5 rounded-full bg-[#8a7a5a]/95 text-white">
            &ldquo;{matchedVariant.variantName}&rdquo;
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-[9px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] font-semibold">
          {f.brand}
        </p>
        <p className="text-[14px] font-bold text-foreground tracking-tight mt-0.5 truncate">
          {f.model}
        </p>
        {matchedVariant && (
          <p className="text-[10px] font-mono text-[rgba(26,24,20,0.35)] truncate mt-0.5">
            {matchedVariant.reference}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {f.topCategory && (
            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.4)]">
              {f.topCategory}
            </span>
          )}
          {f.collectorCount > 0 && (
            <span className="text-[10px] text-[rgba(26,24,20,0.25)]">
              {f.collectorCount} collector{f.collectorCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
