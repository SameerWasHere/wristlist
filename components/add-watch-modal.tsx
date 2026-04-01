"use client";

import { useState, useEffect, useCallback } from "react";

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
  watch: WatchData;
  open: boolean;
  onClose: () => void;
}

export function AddWatchModal({ watch, open, onClose }: AddWatchModalProps) {
  const [status, setStatus] = useState<"collection" | "wishlist">("collection");
  const [modelYear, setModelYear] = useState("");
  const [modInput, setModInput] = useState("");
  const [mods, setMods] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setAnimating(true);
      // Small delay so the element renders at its start position before transitioning
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

  const [saving, setSaving] = useState(false);

  const handleAdd = useCallback(async () => {
    const label = status === "collection" ? "collection" : "wishlist";
    const endpoint = status === "collection" ? "/api/collection" : "/api/wishlist";

    // If we have a watch reference ID, persist to DB
    if (watch.id) {
      setSaving(true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchReferenceId: watch.id,
            modelYear: modelYear ? parseInt(modelYear) : undefined,
            modifications: mods.length > 0 ? mods : undefined,
          }),
        });
        if (res.status === 409) {
          setToast(`${watch.brand} ${watch.model} is already in your ${label}`);
          setTimeout(() => setToast(null), 3000);
          setSaving(false);
          return;
        }
        if (!res.ok) {
          setToast("Sign in to save watches to your collection");
          setTimeout(() => setToast(null), 3000);
          setSaving(false);
          return;
        }
      } catch {
        // Fall through to toast
      }
      setSaving(false);
    }

    setToast(`Added ${watch.brand} ${watch.model} to your ${label}!`);
    setTimeout(() => {
      setToast(null);
    }, 3000);
    onClose();
    // Reset form
    setStatus("collection");
    setModelYear("");
    setMods([]);
    setModInput("");
  }, [status, watch.brand, watch.model, watch.id, modelYear, mods, onClose]);

  if (!animating && !open) return null;

  const specs = [
    watch.category,
    watch.sizeMm ? `${watch.sizeMm}mm` : null,
    watch.movement,
    watch.origin,
    watch.crystal,
    watch.braceletType,
    watch.material,
  ].filter(Boolean);

  const buttonLabel =
    status === "collection" ? "Add to Collection" : "Add to Wishlist";

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

          <div className="px-6 pb-8 pt-2">
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

            {/* Watch header */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.4)] mb-1">
                {watch.brand}
              </p>
              <h2 className="text-[24px] font-bold text-[#1a1814] leading-tight mb-1">
                {watch.model}
              </h2>
              <p className="text-[13px] font-mono text-[rgba(26,24,20,0.35)]">
                {watch.reference}
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

            {/* Divider */}
            <div className="border-t border-[rgba(26,24,20,0.06)] mb-6" />

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

            {/* Model Year */}
            <div className="mb-5">
              <label className="text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-2 block">
                Model Year{" "}
                <span className="text-[rgba(26,24,20,0.25)]">(optional)</span>
              </label>
              <input
                type="number"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                placeholder="e.g. 2024"
                min={1900}
                max={2099}
                className="w-full px-4 py-2.5 text-[14px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]"
              />
            </div>

            {/* Modifications */}
            <div className="mb-8">
              <label className="text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-2 block">
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
                  className="flex-1 px-4 py-2.5 text-[14px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]"
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
              className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200"
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
