"use client";

import { useState } from "react";
import { ScoreRing } from "@/components/score-ring";

interface GapData {
  dimension: string;
  label: string;
  owned: string[];
  total: number;
}

interface NbpData {
  brand: string;
  model: string;
  gapsFilled: number;
}

interface CollectionInsightsProps {
  score: number;
  topNbp: NbpData | null;
  topGaps: GapData[];
}

function gapColor(current: number, total: number): string {
  const pct = current / total;
  if (pct < 0.3) return "#DC2626";
  if (pct <= 0.6) return "#B8860B";
  return "#059669";
}

export function CollectionInsights({ score, topNbp, topGaps }: CollectionInsightsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-14">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)] group"
      >
        <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
          Collection Insights
        </h2>
        <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium group-hover:text-[rgba(26,24,20,0.4)] transition-colors">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="space-y-6">
          {/* Diversity Score */}
          <div className="border border-[rgba(26,24,20,0.06)] rounded-[20px] px-6 py-6 flex items-center gap-6">
            <ScoreRing score={score} size={72} label="Diversity" />
            <div>
              <p className="text-[15px] font-semibold tracking-tight mb-1">
                Diversity Score
              </p>
              <p className="text-[13px] text-[rgba(26,24,20,0.4)] leading-relaxed">
                Coverage across movement, category, origin, color, shape, crystal, bracelet, and case back.
              </p>
            </div>
          </div>

          {/* Your Next Move */}
          {topNbp && topNbp.gapsFilled > 0 && (
            <div
              className="rounded-[20px] px-6 py-5 border"
              style={{
                background: "linear-gradient(135deg, rgba(5,150,105,0.04) 0%, rgba(5,150,105,0.02) 100%)",
                borderColor: "rgba(5,150,105,0.12)",
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-1">
                    Your Next Move
                  </p>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold mb-0.5">
                    {topNbp.brand}
                  </p>
                  <p className="text-[18px] font-bold tracking-[-0.3px]">
                    {topNbp.model}
                  </p>
                  <p className="text-[13px] text-[rgba(26,24,20,0.45)] mt-1">
                    Fills {topNbp.gapsFilled} gap{topNbp.gapsFilled !== 1 ? "s" : ""} in your collection
                  </p>
                </div>
                <span className="inline-block text-[9px] font-bold text-[#059669] bg-[rgba(5,150,105,0.08)] px-2.5 py-1 rounded-full flex-shrink-0">
                  Best next add
                </span>
              </div>
            </div>
          )}

          {/* Top Gaps */}
          {topGaps.length > 0 && (
            <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] px-4 sm:px-6 py-5 space-y-4">
              <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold">
                Top Gaps
              </p>
              {topGaps.map((gap) => {
                const pct = (gap.owned.length / gap.total) * 100;
                const color = gapColor(gap.owned.length, gap.total);
                return (
                  <div key={gap.dimension}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[13px] font-semibold tracking-tight">
                        {gap.label}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color }}>
                        {gap.owned.length}/{gap.total}
                      </span>
                    </div>
                    <div className="h-[6px] rounded-full bg-[rgba(26,24,20,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
