"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AddWatchModal } from "@/components/add-watch-modal";
import { VariationPicker } from "@/components/variation-picker";
import { AddToCatalogModal } from "@/components/add-to-catalog-modal";
import type { WatchData } from "@/components/add-watch-modal";

interface SearchResult {
  id?: number;
  brand: string;
  model: string;
  reference: string;
  category?: string;
  movement?: string;
  sizeMm?: number;
  origin?: string;
  crystal?: string;
  braceletType?: string;
  material?: string;
  color?: string;
  imageUrl?: string | null;
  familyId?: number | null;
  isCommunitySubmitted?: boolean;
}

interface FamilyResult {
  id: number;
  slug: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  variationCount: number;
}

interface WatchSearchProps {
  onAdd?: (watch: SearchResult) => void;
  onWatchAdded?: () => void;
}

export function WatchSearch({ onAdd, onWatchAdded }: WatchSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [familyResults, setFamilyResults] = useState<FamilyResult[]>([]);
  const [popularFamilies, setPopularFamilies] = useState<FamilyResult[]>([]);
  const [popularWatches, setPopularWatches] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalWatch, setModalWatch] = useState<WatchData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Variation picker state
  const [pickerFamily, setPickerFamily] = useState<FamilyResult | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Catalog modal state
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestBrand, setRequestBrand] = useState("");
  const [requestModel, setRequestModel] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch popular watches from DB on mount, excluding user's owned watches
  useEffect(() => {
    async function loadPopular() {
      try {
        let excludeIds: number[] = [];
        try {
          const colRes = await fetch("/api/collection");
          if (colRes.ok) {
            const colData = await colRes.json();
            const watches = colData.watches ?? [];
            excludeIds = watches
              .map((w: { watch?: { id?: number } }) => w.watch?.id)
              .filter((id: number | undefined): id is number => typeof id === "number");
          }
        } catch {
          // Not signed in or error — no exclusions
        }

        const params = new URLSearchParams({ popular: "true" });
        if (excludeIds.length > 0) {
          params.set("excludeIds", excludeIds.join(","));
        }
        const res = await fetch(`/api/watches/search?${params.toString()}`);
        const data = await res.json();

        // Use families if available, otherwise fall back to results
        if (data.families && data.families.length > 0) {
          setPopularFamilies(data.families);
          setPopularWatches([]);
        } else {
          setPopularWatches(data.results ?? []);
          setPopularFamilies([]);
        }
      } catch {
        // silently fail
      }
    }
    loadPopular();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setFamilyResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/watches/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? data.variations ?? []);
        setFamilyResults(data.families ?? []);
        setIsOpen(true);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  }

  function openModal(watch: SearchResult) {
    setModalWatch(watch);
    setModalOpen(true);
    setIsOpen(false);
    setShowPicker(false);
    setPickerFamily(null);
    onAdd?.(watch);
  }

  function handleFamilySelect(family: FamilyResult) {
    setIsOpen(false);
    // If family has only 1 variation, skip picker (we'll try to load and check)
    if (family.variationCount <= 1) {
      // Fetch the single variation and open modal directly
      fetch(`/api/watches/variations?familyId=${family.id}`)
        .then((r) => r.json())
        .then((data) => {
          const variations = data.variations ?? [];
          if (variations.length === 1) {
            openModal(variations[0]);
          } else {
            // Show picker anyway (0 or 2+ variations)
            setPickerFamily(family);
            setShowPicker(true);
          }
        })
        .catch(() => {
          // Fallback: show picker
          setPickerFamily(family);
          setShowPicker(true);
        });
    } else {
      setPickerFamily(family);
      setShowPicker(true);
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // If showing variation picker, render that instead of results
  if (showPicker && pickerFamily) {
    return (
      <>
        <div className="w-full max-w-2xl mx-auto">
          <VariationPicker
            familyId={pickerFamily.id}
            familyBrand={pickerFamily.brand}
            familyModel={pickerFamily.model}
            onSelect={(variation) => {
              openModal({
                id: variation.id,
                brand: variation.brand,
                model: variation.model,
                reference: variation.reference,
                movement: variation.movement || undefined,
                sizeMm: variation.sizeMm || undefined,
                material: variation.material || undefined,
                color: variation.color || undefined,
                imageUrl: variation.imageUrl,
              });
            }}
            onManualEntry={() => {
              // Open modal in manual mode with brand/model pre-filled
              setModalWatch(null);
              setModalOpen(true);
              setShowPicker(false);
              setPickerFamily(null);
            }}
            onBack={() => {
              setShowPicker(false);
              setPickerFamily(null);
            }}
          />
        </div>

        {/* Add Watch Modal for manual entry */}
        <AddWatchModal
          watch={modalWatch}
          open={modalOpen}
          onClose={() => {
            closeModal();
            onWatchAdded?.();
          }}
        />
      </>
    );
  }

  const hasSearchResults = familyResults.length > 0 || results.length > 0;

  return (
    <>
      <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-[rgba(26,24,20,0.25)]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => hasSearchResults && setIsOpen(true)}
            placeholder="Search any watch... Rolex Submariner, Omega Speedmaster..."
            className="w-full pl-10 sm:pl-14 pr-4 sm:pr-5 py-3.5 sm:py-4 text-[16px] bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:ring-1 focus:ring-[rgba(138,122,90,0.4)] transition-colors placeholder:text-[rgba(26,24,20,0.25)]"
          />
          {isLoading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {isOpen && hasSearchResults && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-[16px] shadow-[0_12px_48px_rgba(26,24,20,0.12)] border border-[rgba(26,24,20,0.06)] z-50 overflow-hidden">
            {/* Family results */}
            {familyResults.map((family, i) => (
              <div key={`family-${family.id}`}>
                {i > 0 && <div className="mx-4 border-t border-[rgba(26,24,20,0.06)]" />}
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                  {/* Thumb */}
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {family.imageUrl ? (
                      <img src={family.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white/30 text-[14px] font-bold">
                        {family.brand.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate">
                      {family.brand} {family.model}
                    </p>
                    <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                      {family.variationCount} {family.variationCount === 1 ? "variation" : "variations"}
                    </p>
                  </div>
                  {/* Add button */}
                  <button
                    onClick={() => handleFamilySelect(family)}
                    className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}

            {/* Divider between families and variations */}
            {familyResults.length > 0 && results.length > 0 && (
              <div className="mx-4 border-t border-[rgba(26,24,20,0.06)]" />
            )}

            {/* Individual variation results */}
            {results.map((result, i) => {
              const initial = result.brand.charAt(0).toUpperCase();
              // Skip variations that belong to a family already shown
              const familyIds = new Set(familyResults.map((f) => f.id));
              if (result.familyId && familyIds.has(result.familyId)) return null;

              return (
                <div key={`ref-${result.id || result.reference}-${i}`}>
                  {(i > 0 || familyResults.length > 0) && (
                    <div className="mx-4 border-t border-[rgba(26,24,20,0.06)]" />
                  )}
                  <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0">
                      <span className="text-white/30 text-[14px] font-bold">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {result.brand} {result.model}
                      </p>
                      <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                        {result.isCommunitySubmitted && (
                          <span title="Community submitted" className="mr-1">&#128101;</span>
                        )}
                        {[result.reference, result.category, result.movement]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(result)}
                      className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Footer — add to catalog CTA */}
            <div className="border-t border-[rgba(26,24,20,0.06)] px-5 py-3">
              <div className="text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setCatalogOpen(true);
                  }}
                  className="text-[13px] font-medium text-[#8a7a5a] hover:underline"
                >
                  Can&apos;t find your watch? <span className="font-semibold">Add it to the catalog</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Browse Popular Watches */}
      <div className="w-full max-w-2xl mx-auto mt-10">
        <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
          Browse Popular Watches
        </p>
        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] overflow-hidden">
          {/* Family-based popular */}
          {popularFamilies.map((family, i) => (
            <div key={`pop-family-${family.id}`}>
              {i > 0 && (
                <div className="mx-5 border-t border-[rgba(26,24,20,0.06)]" />
              )}
              <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {family.imageUrl ? (
                    <img src={family.imageUrl} alt={`${family.brand} ${family.model}`} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-white/30 text-[15px] font-bold">
                      {family.brand.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">
                    {family.brand} {family.model}
                  </p>
                  <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                    {family.variationCount} {family.variationCount === 1 ? "variation" : "variations"}
                  </p>
                </div>
                <button
                  onClick={() => handleFamilySelect(family)}
                  className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}

          {/* Legacy popular watches (fallback) */}
          {popularWatches.map((watch, i) => {
            const initial = watch.brand.charAt(0).toUpperCase();
            return (
              <div key={watch.reference}>
                {(i > 0 || popularFamilies.length > 0) && (
                  <div className="mx-5 border-t border-[rgba(26,24,20,0.06)]" />
                )}
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                  <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {watch.imageUrl ? (
                      <img src={watch.imageUrl} alt={`${watch.brand} ${watch.model}`} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white/30 text-[15px] font-bold">{initial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground truncate">
                      {watch.brand} {watch.model}
                    </p>
                    <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                      {[
                        watch.reference,
                        watch.category,
                        watch.sizeMm ? `${watch.sizeMm}mm` : null,
                        watch.movement,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => openModal(watch)}
                    className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Can't find" prompt when search is active but few/no results */}
      {query.length >= 2 && !isLoading && !hasSearchResults && !isOpen && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div className="bg-[rgba(138,122,90,0.04)] border border-[rgba(138,122,90,0.12)] rounded-[16px] px-5 py-4 text-center">
            <p className="text-[14px] text-[rgba(26,24,20,0.6)] mb-2">
              No watches found for &quot;{query}&quot;
            </p>
            <button
              onClick={() => setCatalogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add it to the catalog
            </button>
          </div>
        </div>
      )}

      {/* Add Watch Modal */}
      {modalWatch !== undefined && (
        <AddWatchModal
          watch={modalWatch}
          open={modalOpen}
          onClose={() => {
            closeModal();
            onWatchAdded?.();
          }}
        />
      )}

      {/* Add to Catalog Modal */}
      <AddToCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        initialBrand={query.split(" ")[0] || ""}
        initialModel={query.split(" ").slice(1).join(" ") || ""}
        onCreated={(watchReferenceId) => {
          setCatalogOpen(false);
          // Open the add-to-collection modal with the new watch
          // We need to fetch the watch data first
          fetch(`/api/watches/search?q=${watchReferenceId}`)
            .then((r) => r.json())
            .then((data) => {
              const variations = data.variations ?? data.results ?? [];
              const match = variations.find(
                (v: SearchResult) => v.id === watchReferenceId,
              );
              if (match) {
                openModal(match);
              } else {
                // Fallback: just open modal, refresh will pick it up
                onWatchAdded?.();
              }
            })
            .catch(() => {
              onWatchAdded?.();
            });
        }}
      />
    </>
  );
}
