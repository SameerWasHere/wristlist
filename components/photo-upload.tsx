"use client";

import { useState, useRef, useCallback } from "react";

interface PhotoUploadProps {
  onUpload: (urls: string[]) => void;
  maxPhotos?: number;
}

interface UploadedPhoto {
  url: string;
  preview: string;
}

interface UploadingPhoto {
  file: File;
  preview: string;
  progress: number;
}

export function PhotoUpload({ onUpload, maxPhotos = 3 }: PhotoUploadProps) {
  const [uploaded, setUploaded] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState<UploadingPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = maxPhotos - uploaded.length - uploading.length;

  const uploadFile = useCallback(
    async (file: File) => {
      const preview = URL.createObjectURL(file);
      const entry: UploadingPhoto = { file, preview, progress: 0 };

      setUploading((prev) => [...prev, entry]);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();

        setUploading((prev) => prev.filter((p) => p.preview !== preview));
        setUploaded((prev) => {
          const next = [...prev, { url: data.url, preview }];
          // Fire callback with all URLs
          onUpload(next.map((p) => p.url));
          return next;
        });
      } catch (err: unknown) {
        setUploading((prev) => prev.filter((p) => p.preview !== preview));
        URL.revokeObjectURL(preview);
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      }
    },
    [onUpload]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Images must be under 5MB");
          continue;
        }
        uploadFile(file);
      }
    },
    [remaining, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removePhoto = useCallback(
    (index: number) => {
      setUploaded((prev) => {
        const next = prev.filter((_, i) => i !== index);
        URL.revokeObjectURL(prev[index].preview);
        onUpload(next.map((p) => p.url));
        return next;
      });
    },
    [onUpload]
  );

  return (
    <div>
      {/* Previews row */}
      {(uploaded.length > 0 || uploading.length > 0) && (
        <div className="flex gap-3 mb-3">
          {uploaded.map((photo, i) => (
            <div
              key={photo.url}
              className="relative w-[88px] h-[88px] rounded-[12px] overflow-hidden border border-[rgba(26,24,20,0.08)] bg-[rgba(26,24,20,0.02)]"
            >
              <img
                src={photo.preview}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-[rgba(26,24,20,0.6)] text-white hover:bg-[rgba(26,24,20,0.8)] transition-colors"
                aria-label={`Remove photo ${i + 1}`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {uploading.map((photo) => (
            <div
              key={photo.preview}
              className="relative w-[88px] h-[88px] rounded-[12px] overflow-hidden border border-[rgba(26,24,20,0.08)] bg-[rgba(26,24,20,0.02)]"
            >
              <img
                src={photo.preview}
                alt="Uploading"
                className="w-full h-full object-cover opacity-50"
              />
              {/* Spinner overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#8a7a5a] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone (only if room for more) */}
      {remaining > 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-[rgba(26,24,20,0.08)] rounded-[16px] px-4 py-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-[rgba(138,122,90,0.4)] hover:bg-[rgba(138,122,90,0.02)] group"
        >
          {/* Upload icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[rgba(26,24,20,0.15)] group-hover:text-[#8a7a5a] transition-colors mb-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p className="text-[13px] text-[rgba(26,24,20,0.35)] group-hover:text-[rgba(26,24,20,0.5)] transition-colors">
            {uploaded.length === 0
              ? "Tap to add photos"
              : `Add ${remaining} more`}
          </p>
          <p className="text-[11px] text-[rgba(26,24,20,0.2)] mt-0.5">
            JPG, PNG up to 5MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[12px] text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
