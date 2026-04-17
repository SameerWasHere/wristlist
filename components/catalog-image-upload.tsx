"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CatalogImageUploadProps {
  referenceId: number;
  currentImageUrl?: string | null;
  brand: string;
  model: string;
  /**
   * `compact` (default): fits small 40–50px thumbs. Tiny camera icon in the
   * corner with no text, hover-only overlay when an image exists.
   * `hero`: fits large hero images (200px+). Visible gold "ADD" pill when
   * there's no image.
   */
  size?: "compact" | "hero";
}

export function CatalogImageUpload({ referenceId, currentImageUrl, brand, model, size = "compact" }: CatalogImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only images allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Max 10MB");
        return;
      }

      setError(null);
      setUploading(true);
      setShowGuidance(false);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("referenceId", String(referenceId));

        const res = await fetch("/api/upload-watch-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(data.error || "Upload failed");
        }

        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setUploading(false);
      }
    },
    [referenceId, router],
  );

  // Renders as a small overlay button on the thumbnail — not a separate card
  return (
    <>
      {/* Small overlay button on the thumbnail */}
      {uploading ? (
        <div className="absolute inset-0 bg-black/50 rounded-[12px] flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-[#8a7a5a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentImageUrl ? (
        // With an image — hover-only overlay, covers the whole thumb
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowGuidance(true);
          }}
          className="absolute inset-0 rounded-[inherit] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 z-10 cursor-pointer"
          title="Update image"
        >
          <svg width={size === "hero" ? 18 : 14} height={size === "hero" ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      ) : size === "hero" ? (
        // Hero with no image — prominent gold pill with "ADD" label
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowGuidance(true);
          }}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#8a7a5a] text-white hover:bg-[#7a6a4a] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.3)] z-10 cursor-pointer"
          title="Add image"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[1px]">Add</span>
        </button>
      ) : (
        // Compact thumb with no image — tiny camera icon, just a small circle
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowGuidance(true);
          }}
          className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[#8a7a5a] text-white hover:bg-[#7a6a4a] transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.3)] z-10 cursor-pointer"
          title="Add image"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      )}

      {/* Guidance modal */}
      {showGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowGuidance(false)} />
          <div className="relative bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_12px_48px_rgba(26,24,20,0.15)] w-full max-w-[360px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[15px] font-bold">
                {currentImageUrl ? "Update" : "Add"} Image
              </h3>
              <button onClick={() => setShowGuidance(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[rgba(26,24,20,0.04)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.3)]">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-[12px] text-[rgba(26,24,20,0.4)] mb-4">
              {brand} {model}
            </p>

            <div className="space-y-2.5 mb-4">
              {[
                ["Front-facing shot", "of the watch dial"],
                ["Plain background", "white or solid color"],
                ["Watch centered", "not cropped at edges"],
                ["Good lighting", "clear and sharp"],
              ].map(([bold, rest]) => (
                <div key={bold} className="flex gap-2.5 items-start">
                  <span className="text-[#8a7a5a] text-[12px] mt-0.5">✓</span>
                  <p className="text-[12px] text-[rgba(26,24,20,0.55)]">
                    <strong className="text-[#1a1814] font-medium">{bold}</strong> — {rest}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[rgba(26,24,20,0.25)] mb-4 leading-relaxed">
              We&apos;ll automatically remove the background for a clean catalog look.
            </p>

            <button
              onClick={() => {
                setShowGuidance(false);
                inputRef.current?.click();
              }}
              className="w-full py-2.5 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
            >
              Choose Photo
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="absolute -bottom-5 left-0 z-20">
          <p className="text-[10px] text-red-500 whitespace-nowrap">{error}</p>
        </div>
      )}
    </>
  );
}
