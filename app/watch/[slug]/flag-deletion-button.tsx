"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface FlagDeletionButtonProps {
  referenceId: number;
  brand: string;
  model: string;
  reference: string;
}

const SUGGESTED_REASONS = [
  "Duplicate of another reference",
  "Wrong brand or model",
  "Fake / spam entry",
  "Never actually existed",
  "Other",
];

export function FlagDeletionButton({ referenceId, brand, model, reference }: FlagDeletionButtonProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Mount animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auto-close after success
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => {
      setOpen(false);
      // Reset everything after close animation
      setTimeout(() => {
        setSubmitted(false);
        setReason("");
        setSelectedSuggestion(null);
      }, 300);
    }, 1800);
    return () => clearTimeout(t);
  }, [submitted]);

  function openModal() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setError(null);
    setOpen(true);
  }

  async function handleSubmit() {
    const finalReason = selectedSuggestion === "Other" || !selectedSuggestion
      ? reason.trim()
      : selectedSuggestion + (reason.trim() ? ` — ${reason.trim()}` : "");

    if (finalReason.length < 3) {
      setError("Please add a few words of explanation");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/catalog/references/${referenceId}/flag-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit flag");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit flag");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[rgba(26,24,20,0.4)] hover:text-[#DC2626] transition-colors"
        title="Flag this variant for deletion review"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        Flag for deletion
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6"
          style={{ pointerEvents: "auto" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              opacity: visible ? 1 : 0,
            }}
            onClick={() => !submitting && setOpen(false)}
          />

          {/* Sheet/Dialog */}
          <div
            className="relative w-full sm:max-w-[480px] bg-[#f6f4ef] rounded-t-[24px] sm:rounded-[24px] shadow-[0_-8px_40px_rgba(26,24,20,0.15)] sm:shadow-[0_20px_60px_rgba(26,24,20,0.25)] transition-all duration-300 ease-out"
            style={{
              transform: visible ? "translateY(0)" : "translateY(100%)",
              opacity: visible ? 1 : 0,
            }}
          >
            {/* Drag indicator (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
            </div>

            <div className="px-5 sm:px-6 py-6">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8a7a5a]/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a7a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-[#1a1814] mb-1">Flag submitted</p>
                  <p className="text-[13px] text-[rgba(26,24,20,0.5)]">
                    We&apos;ll review this entry soon.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-[18px] font-bold text-[#1a1814] mb-1">
                    Flag for deletion
                  </h2>
                  <p className="text-[13px] text-[rgba(26,24,20,0.55)] mb-5">
                    {brand} {model} <span className="font-mono text-[rgba(26,24,20,0.35)]">{reference}</span>
                  </p>

                  <p className="text-[11px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium mb-2">
                    Why should this be deleted?
                  </p>
                  <div className="flex flex-col gap-1.5 mb-4">
                    {SUGGESTED_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedSuggestion(r)}
                        className={`text-left text-[13px] px-3 py-2 rounded-[10px] border transition-colors ${
                          selectedSuggestion === r
                            ? "border-[#8a7a5a] bg-[rgba(138,122,90,0.08)] text-[#1a1814]"
                            : "border-[rgba(26,24,20,0.08)] bg-white text-[rgba(26,24,20,0.65)] hover:border-[rgba(138,122,90,0.3)]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <label className="block text-[11px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.4)] font-medium mb-2">
                    {selectedSuggestion === "Other" ? "Details" : "More details (optional)"}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain briefly so a reviewer can verify..."
                    rows={3}
                    maxLength={500}
                    className="w-full text-[14px] px-3 py-2.5 rounded-[10px] border border-[rgba(26,24,20,0.1)] bg-white focus:outline-none focus:border-[#8a7a5a] resize-none"
                  />

                  {error && (
                    <p className="mt-3 text-[12px] font-medium text-[#DC2626]">{error}</p>
                  )}

                  <p className="mt-4 text-[11px] text-[rgba(26,24,20,0.4)] leading-relaxed">
                    Flags are reviewed by the WristList team. Nothing is deleted immediately.
                  </p>

                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                      className="flex-1 text-[14px] font-medium py-2.5 rounded-full border border-[rgba(26,24,20,0.1)] text-[rgba(26,24,20,0.5)] hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 text-[14px] font-semibold py-2.5 rounded-full bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {submitting ? "Submitting..." : "Submit flag"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
