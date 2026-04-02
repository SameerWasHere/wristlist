"use client";

import { useState, useEffect } from "react";

interface Variation {
  id: number;
  brand: string;
  model: string;
  reference: string;
  sizeMm?: number | null;
  movement?: string | null;
  material?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  collectorCount: number;
}

interface VariationPickerProps {
  familyId: number;
  familyBrand: string;
  familyModel: string;
  onSelect: (variation: Variation) => void;
  onManualEntry: () => void;
  onBack: () => void;
}

export function VariationPicker({
  familyId,
  familyBrand,
  familyModel,
  onSelect,
  onManualEntry,
  onBack,
}: VariationPickerProps) {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/watches/variations?familyId=${familyId}`);
        if (res.ok) {
          const data = await res.json();
          setVariations(data.variations ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [familyId]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={onBack}
          className="text-[13px] text-[#8a7a5a] hover:underline mb-3 block"
        >
          &larr; Back to search
        </button>
        <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.4)] mb-1">
          {familyBrand}
        </p>
        <h3 className="text-[22px] font-bold text-[#1a1814] leading-tight font-serif">
          {familyModel}
        </h3>
        <p className="text-[13px] text-[rgba(26,24,20,0.4)] mt-1">
          Which variation do you have?
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
        </div>
      )}

      {/* Variations list */}
      {!loading && variations.length > 0 && (
        <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] shadow-[0_4px_24px_rgba(26,24,20,0.04)] overflow-hidden mb-4">
          {variations.map((v, i) => (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[rgba(26,24,20,0.02)] transition-colors ${
                i > 0 ? "border-t border-[rgba(26,24,20,0.06)]" : ""
              }`}
            >
              {/* Thumb */}
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {v.imageUrl ? (
                  <img
                    src={v.imageUrl}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-white/20 text-[11px] font-bold font-mono">
                    {v.reference?.slice(0, 4) || v.brand.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1a1814] truncate">
                  {v.reference || v.model}
                </p>
                <p className="text-[11px] text-[rgba(26,24,20,0.4)] truncate">
                  {[
                    v.material,
                    v.sizeMm ? `${v.sizeMm}mm` : null,
                    v.movement,
                    v.color,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/* Collector count */}
              {v.collectorCount > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-[rgba(26,24,20,0.5)]">
                    {v.collectorCount}
                  </p>
                  <p className="text-[9px] text-[rgba(26,24,20,0.3)]">
                    {v.collectorCount === 1 ? "collector" : "collectors"}
                  </p>
                </div>
              )}

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-[rgba(26,24,20,0.2)] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Manual entry option */}
      <button
        onClick={onManualEntry}
        className="w-full py-3 text-[13px] font-medium text-[#8a7a5a] bg-[rgba(138,122,90,0.06)] rounded-[12px] hover:bg-[rgba(138,122,90,0.1)] transition-colors"
      >
        My variation isn&apos;t listed -- add it manually
      </button>
    </div>
  );
}
