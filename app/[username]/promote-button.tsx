"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromoteWatchModal } from "@/components/promote-watch-modal";

interface PromoteButtonProps {
  userWatchId: number;
  brand: string;
  model: string;
  reference: string;
  category?: string;
  sizeMm?: number;
  movement?: string;
  origin?: string;
  wishlistNote?: string;
}

export function PromoteButton({
  userWatchId,
  brand,
  model,
  reference,
  category,
  sizeMm,
  movement,
  origin,
  wishlistNote,
}: PromoteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#8a7a5a] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-[#6b5b3a] transition-colors flex-shrink-0"
      >
        Got It!
      </button>

      <PromoteWatchModal
        open={open}
        onClose={() => {
          setOpen(false);
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
        wishlistNote={wishlistNote}
      />
    </>
  );
}
