"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CatalogImageUploadProps {
  referenceId: number;
  currentImageUrl?: string | null;
  brand: string;
  model: string;
}

export function CatalogImageUpload({ referenceId, currentImageUrl, brand, model }: CatalogImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Images must be under 10MB");
        return;
      }

      setError(null);
      setUploading(true);
      setShowGuidance(false);
      setPreview(URL.createObjectURL(file));

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
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [referenceId, router],
  );

  const hasImage = !!currentImageUrl;

  return (
    <div className="relative">
      {/* Upload area */}
      <button
        type="button"
        onClick={() => {
          if (uploading) return;
          setShowGuidance(true);
        }}
        className={`w-full rounded-[16px] overflow-hidden transition-all ${
          hasImage
            ? "group relative"
            : "border-2 border-dashed border-[rgba(26,24,20,0.1)] hover:border-[rgba(138,122,90,0.3)] bg-[rgba(26,24,20,0.02)] hover:bg-[rgba(138,122,90,0.03)]"
        }`}
      >
        {uploading ? (
          /* Uploading state */
          <div className="aspect-[4/3] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex flex-col items-center justify-center gap-2">
            {preview && (
              <img src={preview} alt="Processing" className="absolute inset-0 w-full h-full object-contain p-4 opacity-30" />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#8a7a5a] border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] text-white/50 font-medium">Removing background...</p>
            </div>
          </div>
        ) : hasImage ? (
          /* Has image — show with update overlay */
          <div className="aspect-[4/3] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] relative">
            <img src={currentImageUrl!} alt={`${brand} ${model}`} className="w-full h-full object-contain p-4" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-[11px] text-white/80 font-medium">Update Image</span>
              </div>
            </div>
          </div>
        ) : (
          /* No image — show upload prompt */
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 py-6 px-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(26,24,20,0.15)]">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p className="text-[12px] font-medium text-[rgba(26,24,20,0.3)]">Add catalog image</p>
            <p className="text-[10px] text-[rgba(26,24,20,0.2)] text-center leading-relaxed">
              Help the community by adding an image
            </p>
          </div>
        )}
      </button>

      {/* Guidance modal */}
      {showGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowGuidance(false)} />
          <div className="relative bg-white rounded-[20px] p-6 shadow-[0_12px_48px_rgba(26,24,20,0.15)] w-full max-w-[380px]">
            <h3 className="text-[16px] font-bold mb-4">Upload Catalog Image</h3>

            <div className="space-y-3 mb-5">
              <div className="flex gap-3 items-start">
                <span className="text-[16px] flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[13px] text-[rgba(26,24,20,0.6)]">
                  <strong className="text-[#1a1814]">Clear, front-facing shot</strong> of the watch dial
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[16px] flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[13px] text-[rgba(26,24,20,0.6)]">
                  <strong className="text-[#1a1814]">Plain background</strong> — white, solid color, or on a flat surface
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[16px] flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[13px] text-[rgba(26,24,20,0.6)]">
                  <strong className="text-[#1a1814]">Watch centered</strong> in the frame, not cropped
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-[16px] flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[13px] text-[rgba(26,24,20,0.6)]">
                  <strong className="text-[#1a1814]">High resolution</strong> — the clearer the better
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[rgba(26,24,20,0.3)] mb-5 leading-relaxed">
              We&apos;ll automatically remove the background to create a clean, standardized catalog image.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGuidance(false);
                  inputRef.current?.click();
                }}
                className="flex-1 py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
              >
                Choose Photo
              </button>
              <button
                onClick={() => setShowGuidance(false)}
                className="px-4 py-3 text-[13px] font-medium text-[rgba(26,24,20,0.4)] hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
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
        <p className="text-[11px] text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
