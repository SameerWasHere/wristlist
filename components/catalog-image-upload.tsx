"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CatalogImageUploadProps {
  referenceId: number;
  currentImageUrl?: string | null;
}

export function CatalogImageUpload({ referenceId, currentImageUrl }: CatalogImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

        // Success -- refresh the page to show the new image
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

  // If there's already an image, show a compact update button
  if (hasImage && !uploading && !preview) {
    return (
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[rgba(26,24,20,0.5)] rounded-[12px] z-10"
          aria-label="Update catalog image"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
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
          <p className="text-[11px] text-red-500 mt-1 absolute -bottom-5 left-0 whitespace-nowrap">{error}</p>
        )}
      </div>
    );
  }

  // No image yet or currently uploading -- show the placeholder / uploading state
  return (
    <div className="relative">
      {uploading ? (
        <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Uploading" className="w-full h-full object-contain p-1 opacity-40" />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#8a7a5a] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : !hasImage ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-11 h-11 rounded-[12px] border border-dashed border-[rgba(26,24,20,0.12)] flex items-center justify-center hover:border-[rgba(138,122,90,0.4)] hover:bg-[rgba(138,122,90,0.03)] transition-all group"
          title="Add catalog image. We'll automatically remove the background."
          aria-label="Add catalog image"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[rgba(26,24,20,0.2)] group-hover:text-[#8a7a5a] transition-colors"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      ) : null}

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
        <p className="text-[11px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
