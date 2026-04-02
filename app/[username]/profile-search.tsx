"use client";

import { useState } from "react";
import { WatchSearch } from "@/components/watch-search";
import { useRouter } from "next/navigation";

export function ProfileSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Add Watch button */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Watch
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/25"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#f6f4ef] rounded-[24px] shadow-[0_20px_60px_rgba(26,24,20,0.2)] w-full max-w-[600px] max-h-[80vh] overflow-y-auto p-5 sm:p-6">
            {/* Close button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold">Add a Watch</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(26,24,20,0.06)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.4)]">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <WatchSearch
              onWatchAdded={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
