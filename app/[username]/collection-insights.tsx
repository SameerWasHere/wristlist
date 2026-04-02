"use client";

import { ScoreRing } from "@/components/score-ring";
import type { CollectionStatsResult, BrandBreakdownItem, TimelineStatsResult } from "@/lib/analytics";

interface CollectionInsightsProps {
  archetype: string;
  description: string;
  tags: { text: string; variant: string }[];
  score: number;
  stats: CollectionStatsResult;
  brands: BrandBreakdownItem[];
  gaps: string[];
  timeline: TimelineStatsResult;
  nbp: { brand: string; model: string; gapsFilled: number } | null;
}

function brandLoyaltyLabel(concentration: number): string {
  if (concentration > 60) return "Loyalist";
  if (concentration >= 40) return "Focused";
  return "Explorer";
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CollectionInsights({
  archetype,
  description,
  tags,
  score,
  stats,
  brands,
  gaps,
  timeline,
  nbp,
}: CollectionInsightsProps) {
  const hasTimeline =
    timeline.oldestYear !== null || timeline.mostActiveYear !== null;

  return (
    <section className="mb-14">
      <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
        Collection Insights
      </h2>

      <div className="space-y-5">
        {/* ---- Section 1: Collection Profile Card ---- */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[16px] px-5 sm:px-7 py-6">
          <p className="font-serif italic text-[22px] sm:text-[26px] font-medium text-[#8a7a5a] tracking-[-0.3px] mb-2">
            {archetype}
          </p>
          <p className="text-[13px] text-[rgba(26,24,20,0.45)] mb-4">
            {stats.watchCount} watch{stats.watchCount !== 1 ? "es" : ""}
            {stats.topOrigin && <> &middot; {capitalize(stats.topOrigin)}</>}
            {stats.topMovement && <> &middot; {capitalize(stats.topMovement)}</>}
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {stats.averageSizeMm !== null && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[rgba(26,24,20,0.03)] text-[rgba(26,24,20,0.6)] px-3 py-1.5 rounded-full">
                {stats.averageSizeMm}mm
                <span className="text-[10px] font-normal text-[rgba(26,24,20,0.35)]">
                  {stats.sizeLabel}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[rgba(26,24,20,0.03)] text-[rgba(26,24,20,0.6)] px-3 py-1.5 rounded-full">
              {stats.mechanicalPercent}%
              <span className="text-[10px] font-normal text-[rgba(26,24,20,0.35)]">
                mechanical
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[rgba(26,24,20,0.03)] text-[rgba(26,24,20,0.6)] px-3 py-1.5 rounded-full">
              {stats.waterReadyPercent}%
              <span className="text-[10px] font-normal text-[rgba(26,24,20,0.35)]">
                water-ready
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-[rgba(26,24,20,0.03)] text-[rgba(26,24,20,0.6)] px-3 py-1.5 rounded-full">
              {stats.brandCount}
              <span className="text-[10px] font-normal text-[rgba(26,24,20,0.35)]">
                brand{stats.brandCount !== 1 ? "s" : ""}
              </span>
            </span>
          </div>

          <p className="text-[13px] text-[rgba(26,24,20,0.4)] leading-relaxed mb-4 max-w-[560px]">
            {description}
          </p>

          {/* DNA tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag.text}
                  className={`text-[10px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full ${
                    tag.variant === "primary"
                      ? "bg-[rgba(138,122,90,0.1)] text-[#8a7a5a]"
                      : "bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.4)]"
                  }`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          )}

          {/* Diversity score small */}
          <div className="flex items-center gap-3 pt-3 border-t border-[rgba(26,24,20,0.05)]">
            <ScoreRing score={score} size={44} />
            <span className="text-[11px] text-[rgba(26,24,20,0.35)] font-medium">
              Diversity Score
            </span>
          </div>
        </div>

        {/* ---- Section 2: By the Numbers ---- */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[16px] px-5 sm:px-7 py-5">
          <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            By the Numbers
          </p>
          <div className="space-y-3">
            <StatRow
              icon="&#9201;"
              label={`${stats.watchCount} watches across ${stats.brandCount} brand${stats.brandCount !== 1 ? "s" : ""}`}
            />
            {stats.averageSizeMm !== null && (
              <StatRow
                icon="&#9711;"
                label={`${stats.averageSizeMm}mm average case size`}
                context={stats.sizeLabel}
              />
            )}
            <StatRow
              icon="&#9881;"
              label={`${stats.mechanicalPercent}% mechanical`}
              context={stats.mechanicalPercent >= 80 ? "purist" : stats.mechanicalPercent >= 50 ? "mostly mechanical" : "mixed power"}
            />
            <StatRow
              icon="&#127754;"
              label={`${stats.waterReadyPercent}% water-ready`}
              context="200m+"
            />
            {stats.topCategory && (
              <StatRow
                icon="&#9733;"
                label={`Top category: ${capitalize(stats.topCategory)}`}
              />
            )}
            {stats.topOrigin && (
              <StatRow
                icon="&#127760;"
                label={`Top origin: ${capitalize(stats.topOrigin)}`}
              />
            )}
            {stats.complicationsList.length > 0 && (
              <StatRow
                icon="&#8853;"
                label={`Complications: ${stats.complicationsList.map(capitalize).join(", ")}`}
              />
            )}
          </div>
        </div>

        {/* ---- Section 3: Your Brands ---- */}
        {brands.length > 0 && (
          <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[16px] px-5 sm:px-7 py-5">
            <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
              Your Brands
            </p>
            <div className="space-y-2.5">
              {brands.map((b) => (
                <div key={b.brand} className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold tracking-tight w-[100px] sm:w-[140px] truncate flex-shrink-0">
                    {b.brand}
                  </span>
                  <div className="flex-1 h-[8px] rounded-full bg-[rgba(26,24,20,0.04)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#8a7a5a] transition-all"
                      style={{ width: `${Math.max(b.percent, 4)}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-[rgba(26,24,20,0.4)] font-medium w-8 text-right flex-shrink-0">
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[rgba(26,24,20,0.35)] mt-4 pt-3 border-t border-[rgba(26,24,20,0.05)]">
              Brand Loyalty:{" "}
              <span className="font-semibold text-[#8a7a5a]">
                {brandLoyaltyLabel(stats.brandConcentration)}
              </span>
            </p>
          </div>
        )}

        {/* ---- Section 4: Your Collection Could Use ---- */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[16px] px-5 sm:px-7 py-5">
          <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            Your Collection Could Use
          </p>
          {gaps.length > 0 ? (
            <div className="space-y-2">
              {gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 bg-[rgba(26,24,20,0.015)] rounded-[12px]"
                >
                  <span className="text-[14px] text-[rgba(26,24,20,0.15)] flex-shrink-0 mt-0.5">
                    +
                  </span>
                  <p className="text-[13px] text-[rgba(26,24,20,0.55)] leading-relaxed">
                    {gap}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[rgba(26,24,20,0.4)] italic">
              Your collection is well-rounded!
            </p>
          )}
          {nbp && nbp.gapsFilled > 0 && (
            <div className="mt-4 pt-3 border-t border-[rgba(26,24,20,0.05)]">
              <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.25)] font-semibold mb-1">
                Your Next Move
              </p>
              <p className="text-[14px] font-semibold tracking-tight">
                <span className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.3)] font-bold mr-2">
                  {nbp.brand}
                </span>
                {nbp.model}
              </p>
              <p className="text-[12px] text-[rgba(26,24,20,0.4)] mt-0.5">
                Fills {nbp.gapsFilled} gap{nbp.gapsFilled !== 1 ? "s" : ""} in your collection
              </p>
            </div>
          )}
        </div>

        {/* ---- Section 5: Your Journey ---- */}
        {hasTimeline && (
          <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[16px] px-5 sm:px-7 py-5">
            <p className="text-[11px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
              Your Journey
            </p>
            <div className="space-y-3">
              {timeline.oldestYear !== null && (
                <StatRow
                  icon="&#128197;"
                  label={`Collecting since ${timeline.oldestYear}`}
                  context={
                    timeline.totalYears !== null
                      ? `${timeline.totalYears} year${timeline.totalYears !== 1 ? "s" : ""}`
                      : undefined
                  }
                />
              )}
              {timeline.watchesPerYear !== null && (
                <StatRow
                  icon="&#128200;"
                  label={`${timeline.watchesPerYear} watches per year`}
                />
              )}
              {timeline.mostActiveYear && (
                <StatRow
                  icon="&#11088;"
                  label={`Most active: ${timeline.mostActiveYear.year}`}
                  context={`${timeline.mostActiveYear.count} watch${timeline.mostActiveYear.count !== 1 ? "es" : ""}`}
                />
              )}
              {timeline.latestAddition && (
                <StatRow
                  icon="&#10024;"
                  label={`Latest: ${timeline.latestAddition.brand} ${timeline.latestAddition.model}`}
                  context={String(timeline.latestAddition.year)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatRow({
  icon,
  label,
  context,
}: {
  icon: string;
  label: string;
  context?: string;
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className="text-[14px] flex-shrink-0 leading-none"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
      <span className="text-[13px] text-[rgba(26,24,20,0.65)] leading-snug">
        {label}
      </span>
      {context && (
        <span className="text-[11px] text-[rgba(26,24,20,0.3)] font-medium">
          {context}
        </span>
      )}
    </div>
  );
}
