import { TimelineEntry } from "./timeline-entry";

interface TimelineWatch {
  brand: string;
  model: string;
  reference: string;
  category: string;
  movement: string;
  sizeMm: number;
  origin: string;
  caption?: string;
  milestone?: string;
  acquiredYear?: number;
  modelYear?: number;
  photos?: string[];
  imageUrl?: string;
  slug: string;
  color?: string;
  modifications?: string[];
}

interface CollectionTimelineProps {
  watches: TimelineWatch[];
}

export function CollectionTimeline({ watches }: CollectionTimelineProps) {
  // Group by acquiredYear, most recent first
  const groups = new Map<string, TimelineWatch[]>();

  const dated = watches
    .filter((w) => w.acquiredYear)
    .sort((a, b) => (b.acquiredYear! - a.acquiredYear!));

  const undated = watches.filter((w) => !w.acquiredYear);

  // Build year groups preserving order
  for (const watch of dated) {
    const key = String(watch.acquiredYear);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(watch);
  }

  if (undated.length > 0) {
    groups.set("Undated", undated);
  }

  const groupKeys = Array.from(groups.keys());

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute left-[16px] sm:left-[20px] top-0 bottom-0 w-px"
        style={{ background: "rgba(138,122,90,0.18)" }}
      />

      <div className="flex flex-col gap-10">
        {groupKeys.map((yearLabel) => (
          <div key={yearLabel} className="relative">
            {/* Year label row */}
            <div className="flex items-center gap-3 mb-5 relative z-[1]">
              {/* Dot on the line */}
              <div className="w-[33px] sm:w-[41px] flex-shrink-0 flex items-center justify-center">
                <div
                  className="w-[9px] h-[9px] rounded-full border-2 border-[#8a7a5a] bg-[#f6f4ef]"
                />
              </div>

              {/* Year text + line */}
              <span className="text-[13px] font-bold text-foreground/60 tracking-tight flex-shrink-0">
                {yearLabel}
              </span>
              <div className="flex-1 h-px bg-[rgba(26,24,20,0.08)]" />
            </div>

            {/* Watches in this year */}
            <div className="pl-[33px] sm:pl-[41px] flex flex-col gap-5">
              {groups.get(yearLabel)!.map((watch) => (
                <TimelineEntry
                  key={`${watch.slug}-${watch.reference}`}
                  {...watch}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
