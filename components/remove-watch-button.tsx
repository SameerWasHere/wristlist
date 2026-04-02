"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface RemoveWatchButtonProps {
  userWatchId: number;
  type: "collection" | "wishlist";
}

export function RemoveWatchButton({ userWatchId, type }: RemoveWatchButtonProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove this watch from your ${type}?`)) return;
    setRemoving(true);
    try {
      const endpoint = type === "collection" ? "/api/collection" : "/api/wishlist";
      const res = await fetch(endpoint, {
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
      title={`Remove from ${type}`}
      className="w-6 h-6 flex items-center justify-center rounded-full text-[rgba(26,24,20,0.2)] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors disabled:opacity-30"
    >
      {removing ? (
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </button>
  );
}
