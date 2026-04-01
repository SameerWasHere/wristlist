"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AddWatchModal } from "@/components/add-watch-modal";
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
}

// Popular watches fetched from DB on mount (no more hardcoded data)

interface WatchSearchProps {
  onAdd?: (watch: SearchResult) => void;
  onWatchAdded?: () => void;
}

export function WatchSearch({ onAdd, onWatchAdded }: WatchSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [popularWatches, setPopularWatches] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalWatch, setModalWatch] = useState<WatchData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
        // Try to get the user's owned watch reference IDs
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
        setPopularWatches(data.results ?? []);
      } catch {
        // silently fail
      }
    }
    loadPopular();
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/watches/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? data ?? []);
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
    onAdd?.(watch);
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

  return (
    <>
      <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
        {/* Search input */}
        <div className="relative">
          {/* Magnifying glass icon */}
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
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search any watch... Rolex Submariner, Omega Speedmaster..."
            className="w-full pl-10 sm:pl-14 pr-4 sm:pr-5 py-3.5 sm:py-4 text-[16px] bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:ring-1 focus:ring-[rgba(138,122,90,0.4)] transition-colors placeholder:text-[rgba(26,24,20,0.25)]"
          />
          {isLoading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-[16px] shadow-[0_12px_48px_rgba(26,24,20,0.12)] border border-[rgba(26,24,20,0.06)] z-50 overflow-hidden">
            {results.map((result, i) => {
              const initial = result.brand.charAt(0).toUpperCase();
              return (
                <div key={`${result.reference}-${i}`}>
                  {i > 0 && <div className="mx-4 border-t border-[rgba(26,24,20,0.06)]" />}
                  <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                    {/* Thumb */}
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0">
                      <span className="text-white/30 text-[14px] font-bold">{initial}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {result.brand} {result.model}
                      </p>
                      <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                        {[result.reference, result.category, result.movement]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {/* Add button */}
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
            {/* Footer — request form */}
            <div className="border-t border-[rgba(26,24,20,0.06)] px-5 py-3">
              {requestSubmitted ? (
                <p className="text-[12px] text-[#8a7a5a] font-medium text-center">
                  Request submitted! We&apos;ll review it soon.
                </p>
              ) : showRequestForm ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!requestBrand.trim() || !requestModel.trim()) return;
                    setRequestSubmitting(true);
                    try {
                      const res = await fetch("/api/watch-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          brand: requestBrand.trim(),
                          model: requestModel.trim(),
                        }),
                      });
                      if (res.ok) {
                        setRequestSubmitted(true);
                        setShowRequestForm(false);
                      }
                    } catch {
                      // silently fail
                    } finally {
                      setRequestSubmitting(false);
                    }
                  }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-[12px] text-[rgba(26,24,20,0.5)] font-medium mb-1">
                    Request a watch to be added
                  </p>
                  <input
                    type="text"
                    placeholder="Brand (e.g. Omega)"
                    value={requestBrand}
                    onChange={(e) => setRequestBrand(e.target.value)}
                    className="w-full px-3 py-2 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[10px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Model (e.g. Seamaster 300)"
                    value={requestModel}
                    onChange={(e) => setRequestModel(e.target.value)}
                    className="w-full px-3 py-2 text-[16px] border border-[rgba(26,24,20,0.1)] rounded-[10px] bg-[#f6f4ef] focus:outline-none focus:border-[rgba(138,122,90,0.4)] transition-all"
                    required
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={requestSubmitting}
                      className="flex-1 py-2 text-[12px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {requestSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-4 py-2 text-[12px] font-medium text-[rgba(26,24,20,0.4)] hover:text-[rgba(26,24,20,0.6)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="text-[12px] text-[#8a7a5a] font-medium hover:underline"
                  >
                    Don&apos;t see your watch? Request it
                  </button>
                </div>
              )}
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
          {popularWatches.map((watch, i) => {
            const initial = watch.brand.charAt(0).toUpperCase();
            return (
              <div key={watch.reference}>
                {i > 0 && (
                  <div className="mx-5 border-t border-[rgba(26,24,20,0.06)]" />
                )}
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
                  {/* Thumb */}
                  <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {watch.imageUrl ? (
                      <img src={watch.imageUrl} alt={`${watch.brand} ${watch.model}`} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white/30 text-[15px] font-bold">{initial}</span>
                    )}
                  </div>
                  {/* Info */}
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
                  {/* Add button */}
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

      {/* Add Watch Modal */}
      {modalWatch && (
        <AddWatchModal
          watch={modalWatch}
          open={modalOpen}
          onClose={() => {
            closeModal();
            onWatchAdded?.();
          }}
        />
      )}
    </>
  );
}
