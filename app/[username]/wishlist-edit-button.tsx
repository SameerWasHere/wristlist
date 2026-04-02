"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditWatchModal } from "@/components/edit-watch-modal";

interface WishlistEditButtonProps {
  userWatchId: number;
  brand: string;
  model: string;
  reference: string;
  category?: string;
  sizeMm?: number;
  movement?: string;
  origin?: string;
  caption?: string;
  milestone?: string;
  modelYear?: number;
  acquiredYear?: number;
  modifications?: string[];
  photos?: string[];
}

export function WishlistEditButton({
  userWatchId,
  brand,
  model,
  reference,
  category,
  sizeMm,
  movement,
  origin,
  caption,
  milestone,
  modelYear,
  acquiredYear,
  modifications,
  photos,
}: WishlistEditButtonProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors flex-shrink-0"
        title="Edit this watch"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.2)]">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

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
        currentModifications={modifications}
        currentPhotos={photos}
        currentStatus="wishlist"
      />
    </>
  );
}
