"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RemoveWatchInlineProps {
  userWatchId: number;
}

export function RemoveWatchInline({ userWatchId }: RemoveWatchInlineProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this watch from your collection?")) return;
    setRemoving(true);
    try {
      const res = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWatchId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      title="Remove from collection"
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[rgba(26,24,20,0.15)] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors disabled:opacity-30"
    >
      {removing ? (
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block" />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
}
