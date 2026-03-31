"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SearchResult {
  brand: string;
  model: string;
  reference: string;
  category?: string;
  movement?: string;
  sizeMm?: number;
}

interface WatchSearchProps {
  onAdd?: (watch: SearchResult) => void;
}

export function WatchSearch({ onAdd }: WatchSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className="relative">
        {/* Magnifying glass icon */}
        <svg
          className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(26,24,20,0.25)]"
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
          className="w-full pl-14 pr-5 py-4 text-[16px] bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:ring-1 focus:ring-[rgba(138,122,90,0.4)] transition-colors placeholder:text-[rgba(26,24,20,0.25)]"
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
                <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[rgba(26,24,20,0.02)] transition-colors">
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
                    onClick={() => onAdd?.(result)}
                    className="flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold text-[#8a7a5a] bg-[#f5f0e3] rounded-full hover:bg-[#ebe4d0] transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
          {/* Footer */}
          <div className="border-t border-[rgba(26,24,20,0.06)] px-5 py-3 text-center">
            <button className="text-[12px] text-[#8a7a5a] font-medium hover:underline">
              Don&apos;t see your watch? Request it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
