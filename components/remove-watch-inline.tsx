"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface RemoveWatchInlineProps {
  userWatchId: number;
}

export function RemoveWatchInline({ userWatchId }: RemoveWatchInlineProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function startConfirm() {
    setConfirming(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setConfirming(false), 3000);
  }

  function cancelConfirm() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
  }

  async function handleRemove() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
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

  if (removing) {
    return (
      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block text-[rgba(26,24,20,0.15)]" />
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <span className="text-[10px] font-semibold text-[#DC2626] mr-0.5">Remove?</span>
        <button
          onClick={handleRemove}
          className="w-7 h-7 flex items-center justify-center rounded-full text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)] transition-colors"
          title="Confirm remove"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button
          onClick={cancelConfirm}
          className="w-7 h-7 flex items-center justify-center rounded-full text-[rgba(26,24,20,0.3)] hover:bg-[rgba(26,24,20,0.06)] transition-colors"
          title="Cancel"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startConfirm}
      title="Remove from collection"
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[rgba(26,24,20,0.15)] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
