"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  slug: string;
  brand: string;
  model: string;
  reference?: string;
  imageUrl?: string | null;
}

interface FamilyResult {
  slug: string;
  brand: string;
  model: string;
  imageUrl?: string | null;
  variationCount?: number;
}

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [families, setFamilies] = useState<FamilyResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setFamilies([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/watches/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setFamilies(data.families || []);
        setResults(data.results || []);
        setOpen(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const navigate = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/watch/${slug}`);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = families.length > 0 || results.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mx-auto mt-8">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(26,24,20,0.25)]"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search watches, brands, models..."
          className="w-full pl-11 pr-4 py-3.5 text-[15px] bg-white border border-[rgba(26,24,20,0.1)] rounded-full shadow-[0_2px_12px_rgba(26,24,20,0.06)] focus:outline-none focus:border-[rgba(138,122,90,0.4)] focus:shadow-[0_4px_20px_rgba(26,24,20,0.1)] transition-all placeholder:text-[rgba(26,24,20,0.3)]"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] border border-[rgba(26,24,20,0.08)] shadow-[0_8px_40px_rgba(26,24,20,0.12)] overflow-hidden z-50 max-h-[360px] overflow-y-auto">
          {/* Families */}
          {families.map((f) => (
            <button
              key={`family-${f.slug}`}
              onClick={() => navigate(f.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(26,24,20,0.02)] transition-colors text-left border-b border-[rgba(26,24,20,0.04)] last:border-b-0"
            >
              <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {f.imageUrl ? (
                  <img src={f.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-white/20 text-[14px] font-bold">{f.brand.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] font-medium">{f.brand}</p>
                <p className="text-[14px] font-semibold text-[#1a1814] truncate">{f.model}</p>
              </div>
              {f.variationCount && f.variationCount > 1 && (
                <span className="text-[11px] text-[rgba(26,24,20,0.3)] flex-shrink-0">
                  {f.variationCount} variations
                </span>
              )}
            </button>
          ))}

          {/* Individual references (if no family match) */}
          {results.filter(r => !families.some(f => f.brand === r.brand && f.model === r.model)).slice(0, 5).map((r) => (
            <button
              key={`ref-${r.slug}`}
              onClick={() => navigate(r.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(26,24,20,0.02)] transition-colors text-left border-b border-[rgba(26,24,20,0.04)] last:border-b-0"
            >
              <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-white/20 text-[14px] font-bold">{r.brand.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.35)] font-medium">{r.brand}</p>
                <p className="text-[14px] font-semibold text-[#1a1814] truncate">{r.model}</p>
              </div>
              {r.reference && (
                <span className="text-[11px] font-mono text-[rgba(26,24,20,0.25)] flex-shrink-0">
                  {r.reference}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && !hasResults && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] border border-[rgba(26,24,20,0.08)] shadow-[0_8px_40px_rgba(26,24,20,0.12)] p-6 text-center z-50">
          <p className="text-[13px] text-[rgba(26,24,20,0.4)]">
            No watches found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
