"use client";

import { useState } from "react";
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
}

const CATEGORIES = [
  "All",
  "Diver",
  "Pilot",
  "Dress",
  "Field",
  "Chronograph",
  "Digital",
  "GMT",
] as const;

const ORIGINS = [
  "Swiss",
  "Japanese",
  "German",
  "American",
] as const;

export function CatalogGrid({ families }: { families: CatalogFamily[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeOrigin, setActiveOrigin] = useState<string | null>(null);

  const filtered = families.filter((f) => {
    if (activeCategory !== "All" && f.topCategory?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    if (activeOrigin && f.topOrigin?.toLowerCase() !== activeOrigin.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[#8a7a5a] text-white"
                : "bg-[rgba(26,24,20,0.05)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.1)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {ORIGINS.map((origin) => (
          <button
            key={origin}
            onClick={() =>
              setActiveOrigin(activeOrigin === origin ? null : origin)
            }
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeOrigin === origin
                ? "bg-[#8a7a5a] text-white"
                : "bg-[rgba(26,24,20,0.05)] text-[rgba(26,24,20,0.5)] hover:bg-[rgba(26,24,20,0.1)]"
            }`}
          >
            {origin}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-8 sm:p-12 text-center">
          <p className="text-[18px] font-bold text-foreground mb-2">
            No watches found
          </p>
          <p className="text-[14px] text-[rgba(26,24,20,0.4)] max-w-sm mx-auto">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((f) => (
            <Link
              key={f.id}
              href={`/watch/${f.slug}`}
              className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.1)] transition-all duration-300 no-underline text-inherit group"
            >
              {/* Image area - 3:2 aspect ratio */}
              <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] overflow-hidden">
                {f.imageUrl ? (
                  <img
                    src={f.imageUrl}
                    alt={`${f.brand} ${f.model}`}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 text-[36px] font-bold">
                      {f.brand.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium">
                  {f.brand}
                </p>
                <p className="text-[14px] font-semibold text-foreground mt-0.5 truncate">
                  {f.model}
                </p>
                <p className="text-[11px] text-[rgba(26,24,20,0.35)] mt-1.5">
                  {f.variationCount} {f.variationCount === 1 ? "variation" : "variations"} &middot;{" "}
                  {f.collectorCount} {f.collectorCount === 1 ? "collector" : "collectors"}
                </p>
                <span className="inline-block mt-3 text-[12px] font-medium text-[#8a7a5a] group-hover:translate-x-1 transition-transform duration-200">
                  View &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
