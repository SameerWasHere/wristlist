"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { PhotoUpload } from "@/components/photo-upload";

export interface WatchData {
  id?: number;
  brand: string;
  model: string;
  reference: string;
  category?: string;
  sizeMm?: number;
  movement?: string;
  origin?: string;
  crystal?: string;
  braceletType?: string;
  material?: string;
  color?: string;
}

interface AddWatchModalProps {
  watch: WatchData | null;
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = ["diver", "pilot", "dress", "field", "chronograph", "digital", "gmt"];
const MOVEMENTS = ["automatic", "quartz", "battery", "solar", "manual wind"];
const ORIGINS = ["Swiss", "Japanese", "German", "American", "Chinese"];

export function AddWatchModal({ watch, open, onClose }: AddWatchModalProps) {
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const [status, setStatus] = useState<"collection" | "wishlist">("collection");
  const [modelYear, setModelYear] = useState("");
  const [acquiredMonth, setAcquiredMonth] = useState("");
  const [acquiredDay, setAcquiredDay] = useState("");
  const [acquiredYear, setAcquiredYear] = useState("");
  const [milestone, setMilestone] = useState("");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [modInput, setModInput] = useState("");
  const [mods, setMods] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Manual entry fields
  const [manualBrand, setManualBrand] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualReference, setManualReference] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [manualMovement, setManualMovement] = useState("");
  const [manualSizeMm, setManualSizeMm] = useState("");
  const [manualOrigin, setManualOrigin] = useState("");
  const [creatingWatch, setCreatingWatch] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleAddMod = useCallback(() => {
    const trimmed = modInput.trim();
    if (trimmed && !mods.includes(trimmed)) {
      setMods((prev) => [...prev, trimmed]);
    }
    setModInput("");
  }, [modInput, mods]);

  const removeMod = useCallback((mod: string) => {
    setMods((prev) => prev.filter((m) => m !== mod));
  }, []);

  const resetForm = useCallback(() => {
    setStatus("collection");
    setModelYear("");
    setAcquiredMonth("");
    setAcquiredDay("");
    setAcquiredYear("");
    setMilestone("");
    setCaption("");
    setPhotos([]);
    setMods([]);
    setModInput("");
    setManualMode(false);
    setManualBrand("");
    setManualModel("");
    setManualReference("");
    setManualCategory("");
    setManualMovement("");
    setManualSizeMm("");
    setManualOrigin("");
  }, []);

  const [saving, setSaving] = useState(false);

  const handleAdd = useCallback(async () => {
    // Determine which watch we're adding
    let watchToAdd = watch;
    const label = status === "collection" ? "collection" : "wishlist";
    const endpoint = status === "collection" ? "/api/collection" : "/api/wishlist";

    if (!isSignedIn) {
      onClose();
      clerk.openSignIn({
        fallbackRedirectUrl: window.location.pathname,
      });
      return;
    }

    // If manual mode, first create the watch reference
    if (manualMode) {
      if (!manualBrand.trim() || !manualModel.trim()) {
        setToast("Brand and Model are required");
        setTimeout(() => setToast(null), 3000);
        return;
      }

      setCreatingWatch(true);
      try {
        const res = await fetch("/api/watches/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: manualBrand.trim(),
            model: manualModel.trim(),
            reference: manualReference.trim() || undefined,
            category: manualCategory || undefined,
            movement: manualMovement || undefined,
            sizeMm: manualSizeMm ? parseFloat(manualSizeMm) : undefined,
            origin: manualOrigin || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Failed to create watch" }));
          setToast(data.error || "Failed to create watch");
          setTimeout(() => setToast(null), 3000);
          setCreatingWatch(false);
          return;
        }

        const data = await res.json();
        watchToAdd = data.watch;
      } catch {
        setToast("Something went wrong. Please try again.");
        setTimeout(() => setToast(null), 3000);
        setCreatingWatch(false);
        return;
      }
      setCreatingWatch(false);
    }

    // Now add to collection/wishlist
    if (watchToAdd?.id) {
      setSaving(true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchReferenceId: watchToAdd.id,
            modelYear: modelYear ? parseInt(modelYear) : undefined,
            acquiredDate: acquiredYear ? `${acquiredYear}-${(acquiredMonth || "01").padStart(2, "0")}-${(acquiredDay || "01").padStart(2, "0")}` : undefined,
            milestone: milestone || undefined,
            caption: caption || undefined,
            photos: photos.length > 0 ? photos : undefined,
            modifications: mods.length > 0 ? mods : undefined,
          }),
        });
        if (res.status === 409) {
          const brandName = watchToAdd.brand || manualBrand;
          const modelName = watchToAdd.model || manualModel;
          setToast(`${brandName} ${modelName} is already in your ${label}`);
          setTimeout(() => setToast(null), 3000);
          setSaving(false);
          return;
        }
        if (res.status === 403) {
          const data = await res.json();
          if (data.redirect) {
            onClose();
            window.location.href = data.redirect;
            return;
          }
        }
        if (!res.ok) {
          setToast("Something went wrong. Please try again.");
          setTimeout(() => setToast(null), 3000);
          setSaving(false);
          return;
        }
      } catch {
        setToast("Something went wrong. Please try again.");
        setTimeout(() => setToast(null), 3000);
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    const brandName = watchToAdd?.brand || manualBrand;
    const modelName = watchToAdd?.model || manualModel;
    setToast(`Added ${brandName} ${modelName} to your ${label}!`);
    setTimeout(() => {
      setToast(null);
    }, 3000);
    onClose();
    resetForm();
  }, [status, watch, modelYear, acquiredYear, milestone, caption, photos, mods, onClose, isSignedIn, clerk, manualMode, manualBrand, manualModel, manualReference, manualCategory, manualMovement, manualSizeMm, manualOrigin, resetForm]);

  if (!animating && !open) return null;

  // When in manual mode and no watch prop, show manual form
  const showManualForm = manualMode && !watch;

  const displayWatch = watch;

  const specs = displayWatch
    ? [
        displayWatch.category,
        displayWatch.sizeMm ? `${displayWatch.sizeMm}mm` : null,
        displayWatch.movement,
        displayWatch.origin,
        displayWatch.crystal,
        displayWatch.braceletType,
        displayWatch.material,
      ].filter(Boolean)
    : [];

  const buttonLabel = !isSignedIn
    ? "Sign in to Add"
    : saving || creatingWatch
      ? "Saving..."
      : status === "collection"
        ? "Add to Collection"
        : "Add to Wishlist";

  const inputClass =
    "w-full px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]";

  const selectClass =
    "w-full px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors text-[#1a1814] appearance-none";

  const labelClass = "text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-2 block";

  return (
    <>
      {/* Portal-like fixed overlay */}
      <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: animating || open ? "auto" : "none" }}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            opacity: visible ? 1 : 0,
          }}
          onClick={onClose}
        />

        {/* Modal sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out"
          style={{
            transform: visible ? "translateY(0)" : "translateY(100%)",
          }}
        >
          {/* Drag indicator */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
          </div>

          <div className="px-4 sm:px-6 pb-8 pt-2">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(26,24,20,0.04)] hover:bg-[rgba(26,24,20,0.08)] transition-colors"
                aria-label="Close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ---- Watch Header or Manual Form ---- */}
            {showManualForm ? (
              <>
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.4)] mb-1">
                    Community Submission
                  </p>
                  <h2 className="text-[24px] font-bold text-[#1a1814] leading-tight mb-1">
                    Add Your Watch
                  </h2>
                  <p className="text-[13px] text-[rgba(26,24,20,0.4)]">
                    Fill in what you know -- we&apos;ll add it to the catalog.
                  </p>
                </div>

                {/* Manual entry fields */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>
                      Brand <span className="text-[#8a7a5a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualBrand}
                      onChange={(e) => setManualBrand(e.target.value)}
                      placeholder="e.g. Omega"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Model <span className="text-[#8a7a5a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualModel}
                      onChange={(e) => setManualModel(e.target.value)}
                      placeholder="e.g. Seamaster"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={labelClass}>
                    Reference <span className="text-[rgba(26,24,20,0.25)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="e.g. 210.30.42.20.06.001"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Movement</label>
                    <select
                      value={manualMovement}
                      onChange={(e) => setManualMovement(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {MOVEMENTS.map((m) => (
                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className={labelClass}>Size (mm)</label>
                    <input
                      type="number"
                      value={manualSizeMm}
                      onChange={(e) => setManualSizeMm(e.target.value)}
                      placeholder="e.g. 42"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Origin</label>
                    <select
                      value={manualOrigin}
                      onChange={(e) => setManualOrigin(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {ORIGINS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Back link */}
                <button
                  onClick={() => setManualMode(false)}
                  className="text-[13px] text-[#8a7a5a] hover:underline mb-4 block"
                >
                  &larr; Back to search
                </button>

                <div className="border-t border-[rgba(26,24,20,0.06)] mb-6" />
              </>
            ) : displayWatch ? (
              <>
                {/* Watch header */}
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.4)] mb-1">
                    {displayWatch.brand}
                  </p>
                  <h2 className="text-[24px] font-bold text-[#1a1814] leading-tight mb-1">
                    {displayWatch.model}
                  </h2>
                  <p className="text-[13px] font-mono text-[rgba(26,24,20,0.35)]">
                    {displayWatch.reference}
                  </p>
                </div>

                {/* Specs tags */}
                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {specs.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1.5 text-[11px] font-medium rounded-[8px] bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Manual entry link */}
                <button
                  onClick={() => {
                    setManualMode(true);
                    // Clear the watch prop by closing and re-opening in manual mode
                  }}
                  className="text-[13px] text-[#8a7a5a] hover:underline mb-4 block"
                >
                  Don&apos;t see your watch? Add it manually
                </button>

                <div className="border-t border-[rgba(26,24,20,0.06)] mb-6" />
              </>
            ) : (
              <>
                {/* No watch selected — prompt manual entry */}
                <div className="mb-6">
                  <h2 className="text-[24px] font-bold text-[#1a1814] leading-tight mb-1">
                    Add a Watch
                  </h2>
                  <p className="text-[13px] text-[rgba(26,24,20,0.4)]">
                    Search for a watch or add one manually.
                  </p>
                </div>

                <button
                  onClick={() => setManualMode(true)}
                  className="w-full py-3 text-[14px] font-semibold text-[#8a7a5a] bg-[rgba(138,122,90,0.08)] rounded-[12px] hover:bg-[rgba(138,122,90,0.12)] transition-colors mb-6"
                >
                  Don&apos;t see your watch? Add it manually
                </button>

                <div className="border-t border-[rgba(26,24,20,0.06)] mb-6" />
              </>
            )}

            {/* Personalize section */}
            <p className="text-[11px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.3)] mb-4">
              Personalize
            </p>

            {/* Collection / Wishlist segmented control */}
            <div className="mb-5">
              <label className="text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-2 block">
                Add to
              </label>
              <div className="flex bg-[rgba(26,24,20,0.04)] rounded-full p-1">
                <button
                  onClick={() => setStatus("collection")}
                  className={`flex-1 text-[13px] font-semibold py-2 rounded-full transition-all duration-200 ${
                    status === "collection"
                      ? "bg-gradient-to-b from-[#f5f0e3] to-[#ebe4d0] text-[#8a7a5a] shadow-sm"
                      : "text-[rgba(26,24,20,0.35)] hover:text-[rgba(26,24,20,0.5)]"
                  }`}
                >
                  Collection
                </button>
                <button
                  onClick={() => setStatus("wishlist")}
                  className={`flex-1 text-[13px] font-semibold py-2 rounded-full transition-all duration-200 ${
                    status === "wishlist"
                      ? "bg-gradient-to-b from-[#f5f0e3] to-[#ebe4d0] text-[#8a7a5a] shadow-sm"
                      : "text-[rgba(26,24,20,0.35)] hover:text-[rgba(26,24,20,0.5)]"
                  }`}
                >
                  Wishlist
                </button>
              </div>
            </div>

            {/* Photo upload */}
            <div className="mb-5">
              <label className={labelClass}>
                Photos{" "}
                <span className="text-[rgba(26,24,20,0.25)]">(optional, up to 3)</span>
              </label>
              <PhotoUpload
                onUpload={(urls) => setPhotos(urls)}
                maxPhotos={3}
              />
            </div>

            {/* Caption */}
            <div className="mb-5">
              <label className={labelClass}>
                Caption{" "}
                <span className="text-[rgba(26,24,20,0.25)]">(optional)</span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="My daily driver, grail achieved..."
                className={inputClass}
              />
            </div>

            {/* Year fields side by side */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className={labelClass}>
                  Model Year
                </label>
                <input
                  type="number"
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value)}
                  placeholder="e.g. 2024"
                  min={1900}
                  max={2099}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Date Acquired */}
            <div className="mb-5">
              <label className={labelClass}>
                Date Acquired <span className="text-[rgba(26,24,20,0.2)] normal-case tracking-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={acquiredMonth}
                  onChange={(e) => setAcquiredMonth(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Month</option>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                    <option key={m} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
                <select
                  value={acquiredDay}
                  onChange={(e) => setAcquiredDay(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={acquiredYear}
                  onChange={(e) => setAcquiredYear(e.target.value)}
                  placeholder="Year"
                  min={1900}
                  max={2099}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Milestone / Story */}
            <div className="mb-5">
              <label className={labelClass}>
                The Story{" "}
                <span className="text-[rgba(26,24,20,0.25)]">(optional)</span>
              </label>
              <input
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="Wedding gift, first promotion, birthday treat..."
                className={inputClass}
              />
            </div>

            {/* Modifications */}
            <div className="mb-8">
              <label className={labelClass}>
                Modifications{" "}
                <span className="text-[rgba(26,24,20,0.25)]">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modInput}
                  onChange={(e) => setModInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMod();
                    }
                  }}
                  placeholder="e.g. aftermarket bezel"
                  className="flex-1 px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]"
                />
                <button
                  onClick={handleAddMod}
                  className="px-4 py-2.5 text-[13px] font-semibold text-[#8a7a5a] bg-[rgba(26,24,20,0.04)] rounded-[12px] hover:bg-[rgba(26,24,20,0.08)] transition-colors"
                >
                  Add
                </button>
              </div>
              {mods.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mods.map((mod) => (
                    <span
                      key={mod}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-[8px] bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)]"
                    >
                      {mod}
                      <button
                        onClick={() => removeMod(mod)}
                        className="hover:text-[rgba(26,24,20,0.8)] transition-colors"
                        aria-label={`Remove ${mod}`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={saving || creatingWatch}
              className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-[#1a1814] text-white text-[14px] font-medium rounded-full shadow-[0_8px_32px_rgba(26,24,20,0.2)] animate-fade-in-up"
          style={{
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {toast}
        </div>
      )}

      {/* Inline keyframes for the toast */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
