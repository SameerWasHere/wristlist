"use client";

import { useState, useMemo } from "react";
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
  { label: "$500–$2k", min: 500, max: 2000 },
  { label: "$2k–$5k", min: 2000, max: 5000 },
  { label: "$5k–$10k", min: 5000, max: 10000 },
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

  // Extract unique brands sorted alphabetically
  const brands = useMemo(() => {
    const set = new Set(families.map((f) => f.brand));
    return Array.from(set).sort();
  }, [families]);

  const filtered = families.filter((f) => {
    if (activeCategory !== "All" && f.topCategory?.toLowerCase() !== activeCategory.toLowerCase()) return false;
    if (activeOrigin && f.topOrigin?.toLowerCase() !== activeOrigin.toLowerCase()) return false;
    if (activeBrand && f.brand !== activeBrand) return false;
    if (!matchesTier(f.avgPrice, activeTier)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.brand.toLowerCase().includes(q) && !f.model.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const activeFilterCount = [
    activeCategory !== "All" ? 1 : 0,
    activeOrigin ? 1 : 0,
    activeBrand ? 1 : 0,
    activeTier ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by brand or model..."
          className="w-full px-4 py-3 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[14px] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]"
        />
      </div>

      {/* Filter rows */}
      <div className="space-y-3 mb-8">
        {/* Category */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold self-center mr-1 w-[60px] flex-shrink-0">Type</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#8a7a5a] text-white"
                  : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.45)] hover:bg-[rgba(26,24,20,0.08)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Origin */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold self-center mr-1 w-[60px] flex-shrink-0">Origin</span>
          {ORIGINS.map((origin) => (
            <button
              key={origin}
              onClick={() => setActiveOrigin(activeOrigin === origin ? null : origin)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                activeOrigin === origin
                  ? "bg-[#8a7a5a] text-white"
                  : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.45)] hover:bg-[rgba(26,24,20,0.08)]"
              }`}
            >
              {origin}
            </button>
          ))}
        </div>

        {/* Price tier */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold self-center mr-1 w-[60px] flex-shrink-0">Price</span>
          {PRICE_TIERS.map((tier) => (
            <button
              key={tier.label}
              onClick={() => setActiveTier(activeTier?.label === tier.label ? null : tier)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                activeTier?.label === tier.label
                  ? "bg-[#8a7a5a] text-white"
                  : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.45)] hover:bg-[rgba(26,24,20,0.08)]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Brand */}
        {brands.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold self-center mr-1 w-[60px] flex-shrink-0">Brand</span>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeBrand === brand
                    ? "bg-[#8a7a5a] text-white"
                    : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.45)] hover:bg-[rgba(26,24,20,0.08)]"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setActiveCategory("All");
              setActiveOrigin(null);
              setActiveBrand(null);
              setActiveTier(null);
              setSearchQuery("");
            }}
            className="text-[11px] font-medium text-[#8a7a5a] hover:underline"
          >
            Clear all filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[12px] text-[rgba(26,24,20,0.3)] mb-4">
        {filtered.length} {filtered.length === 1 ? "watch" : "watches"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[rgba(26,24,20,0.1)] rounded-[20px] py-16 px-8 text-center">
          <p className="text-[18px] font-light text-foreground mb-2">No watches found</p>
          <p className="text-[13px] text-[rgba(26,24,20,0.35)]">
            Try adjusting your filters or search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {filtered.map((f) => {
            const initial = f.brand.charAt(0);
            const tierLabel = f.avgPrice
              ? f.avgPrice < 500 ? "Entry" : f.avgPrice < 2000 ? "Mid" : f.avgPrice < 5000 ? "Premium" : f.avgPrice < 10000 ? "Luxury" : "Ultra"
              : null;

            return (
              <Link
                key={f.id}
                href={`/watch/${f.slug}`}
                className="bg-white rounded-[16px] overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.1)] transition-all duration-300 no-underline text-inherit group border border-[rgba(26,24,20,0.04)]"
              >
                {/* Image */}
                <div
                  className="relative w-full aspect-[4/3] overflow-hidden"
                  style={{ background: colorGradients.default }}
                >
                  {f.imageUrl ? (
                    <img
                      src={f.imageUrl}
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
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <p className="text-[9px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] font-semibold">
                    {f.brand}
                  </p>
                  <p className="text-[14px] font-bold text-foreground tracking-tight mt-0.5 truncate">
                    {f.model}
                  </p>
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
          })}
        </div>
      )}
    </>
  );
}
