"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RemoveWatchInline } from "@/components/remove-watch-inline";
import { EditWatchModal } from "@/components/edit-watch-modal";

const colorGradients: Record<string, string> = {
  black: "linear-gradient(135deg, #0a0a0a, #1a2332)",
  blue: "linear-gradient(135deg, #0a1020, #1a2332)",
  green: "linear-gradient(135deg, #0a1a0a, #1a2a1a)",
  gold: "linear-gradient(135deg, #1a1a0a, #2a2a18)",
  silver: "linear-gradient(135deg, #1a1a1a, #2a2a2e)",
  white: "linear-gradient(135deg, #1a1a1e, #2a2a30)",
  brown: "linear-gradient(135deg, #1a1008, #2a1c10)",
  pink: "linear-gradient(135deg, #2a1a20, #1a1018)",
  default: "linear-gradient(135deg, #0a0a0a, #1a1a20)",
};

interface TimelineEntryProps {
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
  acquiredDate?: string; // "YYYY-MM-DD"
  modelYear?: number;
  photos?: string[];
  imageUrl?: string;
  slug: string;
  color?: string;
  modifications?: string[];
  isOwner?: boolean;
  userWatchId?: number;
  status?: "collection" | "wishlist";
  originNote?: string;
}

export function TimelineEntry({
  brand,
  model,
  reference,
  category,
  movement,
  sizeMm,
  origin,
  caption,
  milestone,
  acquiredYear,
  acquiredDate,
  modelYear,
  photos,
  imageUrl,
  slug,
  color = "default",
  modifications,
  isOwner,
  userWatchId,
  status = "collection",
  originNote,
}: TimelineEntryProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const gradient = colorGradients[color] || colorGradients.default;
  const initial = brand.charAt(0).toUpperCase();
  const hasUserPhoto = photos && photos.length > 0;

  const specs = [category, sizeMm ? `${sizeMm}mm` : null, movement, origin].filter(
    (s) => s && s !== "0mm"
  );

  // Format acquired date as "Month Year" (e.g. "March 2024")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let acquiredDisplay: string | null = null;
  if (acquiredDate) {
    const [y, m] = acquiredDate.split("-");
    const monthIdx = parseInt(m) - 1;
    acquiredDisplay = `Acquired ${monthNames[monthIdx] || ""} ${y}`.trim();
  } else if (acquiredYear) {
    acquiredDisplay = `Acquired ${acquiredYear}`;
  }

  const yearInfo = [
    acquiredDisplay,
    modelYear ? `${modelYear} model` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] shadow-[0_2px_12px_rgba(26,24,20,0.03)] p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Watch thumbnail — compact square */}
        <Link href={`/watch/${slug}`} className="flex-shrink-0">
          <div
            className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-[14px] overflow-hidden flex items-center justify-center"
            style={{ background: gradient }}
          >
            {hasUserPhoto ? (
              <img
                src={photos![0]}
                alt={`${brand} ${model}`}
                className="w-full h-full object-cover"
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={`${brand} ${model}`}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-white/10 text-[28px] sm:text-[32px] font-bold">
                {initial}
              </span>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Brand + Model */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/watch/${slug}`} className="group">
                <h3 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-foreground leading-snug group-hover:text-[#8a7a5a] transition-colors">
                  {brand} {model}
                </h3>
              </Link>
              <p className="text-[11px] font-mono text-[rgba(26,24,20,0.25)] tracking-wide">
                {reference}
              </p>
            </div>

            {/* Owner actions: edit + remove */}
            {isOwner && userWatchId && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
                  title="Edit this watch"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.2)]">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <RemoveWatchInline userWatchId={userWatchId} />
              </div>
            )}
          </div>

          {/* Specs inline */}
          {specs.length > 0 && (
            <p className="text-[11px] text-[rgba(26,24,20,0.35)] mt-1">
              {specs.join(" · ")}
            </p>
          )}

          {/* Year info */}
          {yearInfo && (
            <p className="text-[11px] text-[rgba(26,24,20,0.25)] mt-0.5">
              {yearInfo}
            </p>
          )}

          {/* Caption */}
          {caption && (
            <p className="text-[13px] text-[rgba(26,24,20,0.6)] mt-2 leading-relaxed">
              &ldquo;{caption}&rdquo;
            </p>
          )}

          {/* Milestone */}
          {milestone && (
            <p className="font-serif italic text-[12px] text-[#8a7a5a] mt-1">
              {milestone}
            </p>
          )}

          {/* Origin note (from wishlist) */}
          {originNote && (
            <p className="text-[11px] text-[rgba(138,122,90,0.6)] mt-1 font-serif italic">
              Originally wanted because: &ldquo;{originNote}&rdquo;
            </p>
          )}

          {/* Modifications */}
          {modifications && modifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {modifications.map((mod) => (
                <span
                  key={mod}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.4)]"
                >
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User photos — show as a row below if multiple */}
      {hasUserPhoto && photos!.length > 1 && (
        <div className="flex gap-2 mt-3 ml-[72px] sm:ml-[88px] overflow-x-auto">
          {photos!.slice(1).map((photo, i) => (
            <div key={i} className="w-[80px] h-[60px] rounded-[8px] overflow-hidden flex-shrink-0 bg-[rgba(26,24,20,0.04)]">
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {isOwner && userWatchId && (
        <EditWatchModal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            router.refresh();
          }}
          userWatchId={userWatchId}
          brand={brand}
          model={model}
          reference={reference}
          category={category}
          sizeMm={sizeMm}
          movement={movement}
          origin={origin}
          currentCaption={caption}
          currentMilestone={milestone}
          currentModelYear={modelYear}
          currentAcquiredYear={acquiredYear}
          currentAcquiredDate={acquiredDate}
          currentModifications={modifications}
          currentPhotos={photos}
          currentStatus={status}
        />
      )}
    </div>
  );
}
