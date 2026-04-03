"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AddWatchModal } from "@/components/add-watch-modal";
import type { WatchData } from "@/components/add-watch-modal";

interface AddToCollectionButtonProps {
  watch: WatchData;
}

export function AddToCollectionButton({ watch }: AddToCollectionButtonProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (!isSignedIn) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add to My Collection
      </button>

      <AddWatchModal
        watch={open ? watch : null}
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
