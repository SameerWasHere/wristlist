"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PhotoUpload } from "@/components/photo-upload";
import { ChipPicker } from "@/components/chip-picker";
import { KNOWN } from "@/lib/known-values";

interface FuzzyMatch {
  id: number;
  slug: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  variationCount: number;
}

interface AddToCatalogModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (watchReferenceId: number) => void;
  initialBrand?: string;
  initialModel?: string;
}

type WizardStep = 1 | 2 | 3 | 4;

// Use KNOWN.material for the canonical list — no separate array needed

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function AddToCatalogModal({
  open,
  onClose,
  onCreated,
  initialBrand = "",
  initialModel = "",
}: AddToCatalogModalProps) {
  // Animation
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  // Wizard state
  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Step 1: Brand
  const [brand, setBrand] = useState(initialBrand);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);
  const brandInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Collection/Model
  const [model, setModel] = useState(initialModel);
  const [familyMatches, setFamilyMatches] = useState<FuzzyMatch[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FuzzyMatch | null>(null);
  const [isNewModel, setIsNewModel] = useState(false);

  // Step 3: Details
  const [reference, setReference] = useState("");
  const [sizeMm, setSizeMm] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [movement, setMovement] = useState("");
  const [braceletType, setBraceletType] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [shape, setShape] = useState("");
  const [crystal, setCrystal] = useState("");
  const [caseBack, setCaseBack] = useState("");
  const [bezelType, setBezelType] = useState("");
  const [waterResistanceM, setWaterResistanceM] = useState("");
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  // Step 4: Confirm (reuses the same state as the step-3 inline check)
  const [dupCheck, setDupCheck] = useState<"checking" | "found" | "not_found" | null>(null);
  const [existingRefId, setExistingRefId] = useState<number | null>(null);
  const [existingRef, setExistingRef] = useState<{
    id: number;
    slug: string;
    brand: string;
    model: string;
    reference: string;
    imageUrl: string | null;
  } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch brands on open
  useEffect(() => {
    if (open && brands.length === 0) {
      fetch("/api/catalog?brands=true")
        .then((r) => r.json())
        .then((data) => setBrands(data.brands ?? []))
        .catch(() => {});
    }
  }, [open, brands.length]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setDirection("forward");
      setBrand(initialBrand);
      setModel(initialModel);
      setReference("");
      setSizeMm("");
      setColor("");
      setMaterial("");
      setMovement("");
      setBraceletType("");
      setCategory("");
      setOrigin("");
      setShape("");
      setCrystal("");
      setCaseBack("");
      setBezelType("");
      setWaterResistanceM("");
      setImageUrl([]);
      setDescription("");
      setFamilyMatches([]);
      setSelectedFamily(null);
      setIsNewModel(false);
      setDupCheck(null);
      setExistingRefId(null);
      setExistingRef(null);
      setError(null);
    }
  }, [open, initialBrand, initialModel]);

  // Animation
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

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
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

  // Close brand dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setShowBrandDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Brand autocomplete filtering
  const handleBrandChange = useCallback(
    (val: string) => {
      setBrand(val);
      if (val.length >= 1) {
        const lower = val.toLowerCase();
        const filtered = brands.filter((b) =>
          b.toLowerCase().startsWith(lower),
        );
        setBrandSuggestions(filtered.slice(0, 8));
        setShowBrandDropdown(filtered.length > 0);
      } else {
        setBrandSuggestions([]);
        setShowBrandDropdown(false);
      }
    },
    [brands],
  );

  // Fetch families for brand when entering step 2
  useEffect(() => {
    if (step !== 2 || !brand.trim()) return;
    setFamilyLoading(true);
    fetch(`/api/catalog?fuzzy=${encodeURIComponent(brand.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        const families: FuzzyMatch[] = data.families ?? [];
        // Only show families for this brand
        const brandFamilies = families.filter(
          (f) => f.brand.toLowerCase() === brand.trim().toLowerCase(),
        );
        setFamilyMatches(brandFamilies);
      })
      .catch(() => setFamilyMatches([]))
      .finally(() => setFamilyLoading(false));
  }, [step, brand]);

  // Navigate steps
  const goTo = useCallback((target: WizardStep, dir: "forward" | "back" = "forward") => {
    setDirection(dir);
    setError(null);
    setStep(target);
  }, []);

  const selectBrand = useCallback(
    (b: string) => {
      setBrand(b);
      setShowBrandDropdown(false);
      goTo(2);
    },
    [goTo],
  );

  const selectExistingModel = useCallback(
    (match: FuzzyMatch) => {
      setSelectedFamily(match);
      setModel(match.model);
      setIsNewModel(false);
      goTo(3);
    },
    [goTo],
  );

  const selectNewModel = useCallback(() => {
    setSelectedFamily(null);
    setIsNewModel(true);
    goTo(3);
  }, [goTo]);

  // Duplicate check — fires on step 3 (debounced while typing) and step 4
  useEffect(() => {
    if (step !== 3 && step !== 4) return;
    const ref = reference.trim();
    const b = brand.trim();
    if (!ref || !b) {
      setDupCheck(null);
      setExistingRefId(null);
      setExistingRef(null);
      return;
    }
    // Debounce a bit on step 3 while the user is typing; step 4 is a single
    // confirm render, no debounce needed.
    const delay = step === 3 ? 350 : 0;
    setDupCheck("checking");
    const timer = setTimeout(() => {
      fetch(
        `/api/catalog?ref=${encodeURIComponent(ref)}&brand=${encodeURIComponent(b)}`,
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.exists && data.watchReferenceId) {
            setDupCheck("found");
            setExistingRefId(data.watchReferenceId);
            setExistingRef({
              id: data.watchReferenceId,
              slug: data.slug,
              brand: data.brand,
              model: data.model,
              reference: data.reference,
              imageUrl: data.imageUrl ?? null,
            });
          } else {
            setDupCheck("not_found");
            setExistingRef(null);
          }
        })
        .catch(() => {
          setDupCheck("not_found");
          setExistingRef(null);
        });
    }, delay);
    return () => clearTimeout(timer);
  }, [step, reference, brand]);

  // Submit: create the watch
  const handleCreate = useCallback(async () => {
    if (!brand.trim() || !model.trim() || !reference.trim()) {
      setError("Brand, model, and reference are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        brand: brand.trim(),
        model: model.trim(),
        reference: reference.trim(),
        movement: movement || undefined,
        sizeMm: sizeMm || undefined,
        material: material || undefined,
        braceletType: braceletType || undefined,
        color: color || undefined,
        category: category || undefined,
        origin: origin || undefined,
        shape: shape || undefined,
        crystal: crystal || undefined,
        caseBack: caseBack || undefined,
        bezelType: bezelType || undefined,
        waterResistanceM: waterResistanceM || undefined,
        imageUrl: imageUrl[0] || undefined,
        description: description.trim() || undefined,
      };

      if (selectedFamily) {
        body.familyId = selectedFamily.id;
      }

      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(
          data.error || "You've added 5 watches today. Try again tomorrow.",
        );
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Something went wrong" }));
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      const watchId = data.watch?.id;
      if (watchId) {
        onCreated(watchId);
      }
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    brand,
    model,
    reference,
    movement,
    sizeMm,
    material,
    braceletType,
    color,
    imageUrl,
    description,
    selectedFamily,
    onCreated,
    onClose,
  ]);

  // If dup found, add existing to collection
  const handleAddExisting = useCallback(() => {
    if (existingRefId) {
      onCreated(existingRefId);
      onClose();
    }
  }, [existingRefId, onCreated, onClose]);

  if (!animating && !open) return null;

  const inputClass =
    "w-full px-4 py-3 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]";

  const selectClass =
    "w-full px-4 py-3 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors text-[#1a1814] appearance-none";

  const labelClass =
    "text-[11px] uppercase tracking-[1.5px] font-medium text-[rgba(26,24,20,0.4)] mb-2 block";

  const stepLabels = ["Brand", "Model", "Details", "Confirm"];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6"
      style={{ pointerEvents: animating || open ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: visible ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Modal sheet — bottom-sheet on mobile, centered dialog on desktop */}
      <div
        className="relative w-full sm:max-w-[640px] bg-[#f6f4ef] rounded-t-[24px] sm:rounded-[24px] max-h-[92vh] sm:max-h-[85vh] overflow-y-auto transition-all duration-300 ease-out shadow-[0_-8px_40px_rgba(26,24,20,0.15)] sm:shadow-[0_20px_60px_rgba(26,24,20,0.25)]"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Drag indicator (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[rgba(26,24,20,0.12)]" />
        </div>

        <div className="px-4 sm:px-6 pb-8 pt-2">
          {/* Top bar: close + progress */}
          <div className="flex items-center justify-between mb-6">
            {/* Back button */}
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goTo((step - 1) as WizardStep, "back")}
                className="flex items-center gap-1 text-[13px] font-medium text-[rgba(26,24,20,0.5)] hover:text-[#1a1814] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Close */}
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

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isComplete = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? "bg-[#1a1814] text-white"
                          : isComplete
                            ? "bg-[#8a7a5a] text-white"
                            : "bg-[rgba(26,24,20,0.06)] text-[rgba(26,24,20,0.25)]"
                      }`}
                    >
                      {isComplete ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium transition-colors hidden sm:block ${
                        isActive
                          ? "text-[#1a1814]"
                          : isComplete
                            ? "text-[#8a7a5a]"
                            : "text-[rgba(26,24,20,0.2)]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`h-[1px] flex-1 transition-colors ${
                        isComplete
                          ? "bg-[#8a7a5a]"
                          : "bg-[rgba(26,24,20,0.06)]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content with transition */}
          <div
            key={step}
            className="animate-fadeSlideIn"
            style={{
              animationDirection: direction === "back" ? "reverse" : "normal",
            }}
          >
            {/* ======= STEP 1: Brand ======= */}
            {step === 1 && (
              <div>
                <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.35)] mb-1">
                  Step 1 of 4
                </p>
                <h2 className="text-[28px] font-serif italic text-[#1a1814] leading-tight mb-2">
                  What brand?
                </h2>
                <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-6">
                  Start typing to find your watch brand.
                </p>

                <div ref={brandRef}>
                  <div className="relative">
                    <input
                      ref={brandInputRef}
                      type="text"
                      value={brand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      onFocus={() => {
                        if (brand.length >= 1 && brandSuggestions.length > 0)
                          setShowBrandDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && brand.trim()) {
                          setShowBrandDropdown(false);
                          goTo(2);
                        }
                      }}
                      placeholder="e.g. Omega, Rolex, Seiko..."
                      className="w-full px-5 py-4 text-[18px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[16px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.15)]"
                      autoComplete="off"
                      autoFocus
                    />

                    {/* Autocomplete dropdown */}
                    {showBrandDropdown && brandSuggestions.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white rounded-[16px] shadow-[0_12px_48px_rgba(26,24,20,0.15)] border border-[rgba(26,24,20,0.06)] z-50 overflow-hidden max-h-[280px] overflow-y-auto">
                        {brandSuggestions.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => selectBrand(b)}
                            className="w-full text-left px-5 py-3.5 text-[15px] text-[#1a1814] hover:bg-[rgba(26,24,20,0.03)] transition-colors flex items-center justify-between"
                          >
                            <span>{b}</span>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-[rgba(26,24,20,0.15)]"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        ))}
                        {/* Not listed option */}
                        <div className="border-t border-[rgba(26,24,20,0.06)]">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBrandDropdown(false);
                              if (brand.trim()) goTo(2);
                            }}
                            className="w-full text-left px-5 py-3.5 text-[14px] text-[#8a7a5a] font-medium hover:bg-[rgba(138,122,90,0.04)] transition-colors"
                          >
                            Not listed? Use &quot;{brand}&quot;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue button */}
                {brand.trim() && !showBrandDropdown && (
                  <button
                    type="button"
                    onClick={() => goTo(2)}
                    className="w-full mt-6 py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200"
                  >
                    Continue with {brand.trim()}
                  </button>
                )}
              </div>
            )}

            {/* ======= STEP 2: Collection / Model ======= */}
            {step === 2 && (
              <div>
                <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.35)] mb-1">
                  Step 2 of 4
                </p>
                <h2 className="text-[28px] font-serif italic text-[#1a1814] leading-tight mb-2">
                  Which {brand} watch?
                </h2>
                <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-2">
                  Select the watch line from {brand}&apos;s catalog below, or add a new one if it&apos;s not listed.
                </p>
                <p className="text-[11px] text-[rgba(26,24,20,0.25)] mb-6">
                  Example: For a Rolex, you&apos;d pick &quot;Submariner&quot; — you&apos;ll add your specific reference (like 126610LN) in the next step.
                </p>

                {/* Loading */}
                {familyLoading && (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-5 h-5 border-2 border-[rgba(26,24,20,0.08)] border-t-[#8a7a5a] rounded-full animate-spin" />
                    <span className="text-[14px] text-[rgba(26,24,20,0.4)]">
                      Loading {brand} models...
                    </span>
                  </div>
                )}

                {/* Existing models — flat list, no collection grouping */}
                {!familyLoading && familyMatches.length > 0 && (
                  <div className="mb-6 bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] overflow-hidden">
                    {familyMatches.map((match, i) => (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => selectExistingModel(match)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[rgba(26,24,20,0.02)] transition-colors text-left ${
                          i > 0
                            ? "border-t border-[rgba(26,24,20,0.06)]"
                            : ""
                        }`}
                      >
                        <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {match.imageUrl ? (
                            <img
                              src={match.imageUrl}
                              alt=""
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="text-white/30 text-[14px] font-bold">
                              {match.brand.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-[#1a1814] truncate">
                            {match.model}
                          </p>
                          <p className="text-[11px] text-[rgba(26,24,20,0.35)]">
                            {match.variationCount}{" "}
                            {match.variationCount === 1
                              ? "variation"
                              : "variations"}
                          </p>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-[rgba(26,24,20,0.15)] flex-shrink-0"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* New model input */}
                {!familyLoading && (
                  <div className="bg-white rounded-[16px] border border-dashed border-[rgba(26,24,20,0.12)] p-4">
                    <p className="text-[12px] font-semibold text-[#1a1814] mb-1">
                      {familyMatches.length > 0
                        ? "Don't see it? Add a new watch line"
                        : "Add this watch line to the catalog"}
                    </p>
                    <p className="text-[11px] text-[rgba(26,24,20,0.35)] mb-3">
                      Enter the watch line name (e.g. &quot;Submariner&quot;, &quot;Speedmaster&quot;, &quot;Alpinist&quot;). Don&apos;t include the size or reference number.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && model.trim())
                            selectNewModel();
                        }}
                        placeholder="Watch line name..."
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={selectNewModel}
                        disabled={!model.trim()}
                        className="px-5 py-3 text-[14px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-[12px] hover:bg-[#2a2824] transition-colors disabled:opacity-30 flex-shrink-0"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======= STEP 3: Details ======= */}
            {step === 3 && (
              <div>
                <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.35)] mb-1">
                  Step 3 of 4
                </p>
                <h2 className="text-[28px] font-serif italic text-[#1a1814] leading-tight mb-1">
                  Specific variation
                </h2>

                {selectedFamily ? (
                  <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-2">
                    Adding a variation of{" "}
                    <span className="font-semibold text-[#1a1814]">
                      {brand} {selectedFamily.model}
                    </span>
                  </p>
                ) : (
                  <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-2">
                    Describe this specific{" "}
                    <span className="font-semibold text-[#1a1814]">
                      {brand} {model}
                    </span>
                  </p>
                )}
                <p className="text-[11px] text-[rgba(26,24,20,0.25)] mb-6">
                  Enter the reference number and specs that identify this exact watch. Different dial colors, sizes, or materials are different variations.
                </p>

                {/* Reference number - required */}
                <div className="mb-5">
                  <label className={labelClass}>
                    Reference Number <span className="text-[#8a7a5a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 126610LN, 310.30.42.50.01.001"
                    className={inputClass}
                    autoFocus
                  />

                  {/* Live duplicate check feedback */}
                  {reference.trim().length > 0 && dupCheck === "checking" && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
                      <span className="text-[11px] text-[rgba(26,24,20,0.4)]">
                        Checking the catalog...
                      </span>
                    </div>
                  )}
                  {reference.trim().length > 0 && dupCheck === "not_found" && (
                    <p className="mt-2 text-[11px] text-[#6b8f4e] font-medium">
                      ✓ This reference isn&apos;t in the catalog yet
                    </p>
                  )}
                  {dupCheck === "found" && existingRef && (
                    <div className="mt-3 p-3 rounded-[12px] bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.2)]">
                      <div className="flex items-start gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#1a1814]">
                            Already in the catalog
                          </p>
                          <p className="text-[11.5px] text-[rgba(26,24,20,0.55)] leading-snug mt-0.5">
                            A reference matching <span className="font-mono font-semibold">{existingRef.reference}</span> already exists for {existingRef.brand}.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {existingRef.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={existingRef.imageUrl} alt="" className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <span className="text-white/25 text-[9px] font-mono font-bold">
                              {existingRef.reference.slice(-3)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[#1a1814] truncate">
                            {existingRef.brand} {existingRef.model}
                          </p>
                        </div>
                        <a
                          href={`/watch/${existingRef.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="text-[11px] font-semibold text-[#8a7a5a] hover:underline whitespace-nowrap"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Identity: Size + Water Resistance */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className={labelClass}>Size (mm)</label>
                    <input
                      type="number"
                      value={sizeMm}
                      onChange={(e) => setSizeMm(e.target.value)}
                      placeholder="e.g. 41"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Water Resistance (m)</label>
                    <input
                      type="number"
                      value={waterResistanceM}
                      onChange={(e) => setWaterResistanceM(e.target.value)}
                      placeholder="e.g. 300"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Character */}
                <div className="mb-5">
                  <ChipPicker
                    label="Category"
                    options={KNOWN.category}
                    value={category || null}
                    onChange={(v) => setCategory(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Movement"
                    options={KNOWN.movement}
                    value={movement || null}
                    onChange={(v) => setMovement(v || "")}
                    formatLabel={capitalize}
                  />
                </div>

                {/* Appearance */}
                <div className="mb-5">
                  <ChipPicker
                    label="Dial Color"
                    options={KNOWN.color}
                    value={color || null}
                    onChange={(v) => setColor(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Case Shape"
                    options={KNOWN.shape}
                    value={shape || null}
                    onChange={(v) => setShape(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Crystal"
                    options={KNOWN.crystal}
                    value={crystal || null}
                    onChange={(v) => setCrystal(v || "")}
                    formatLabel={capitalize}
                  />
                </div>

                {/* Construction */}
                <div className="mb-5">
                  <ChipPicker
                    label="Case Material"
                    options={KNOWN.material}
                    value={material || null}
                    onChange={(v) => setMaterial(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Bracelet"
                    options={KNOWN.bracelet_type}
                    value={braceletType || null}
                    onChange={(v) => setBraceletType(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Case Back"
                    options={KNOWN.case_back}
                    value={caseBack || null}
                    onChange={(v) => setCaseBack(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Bezel Type"
                    options={KNOWN.bezel_type}
                    value={bezelType || null}
                    onChange={(v) => setBezelType(v || "")}
                    formatLabel={capitalize}
                  />
                </div>
                <div className="mb-5">
                  <ChipPicker
                    label="Origin"
                    options={KNOWN.origin}
                    value={origin || null}
                    onChange={(v) => setOrigin(v || "")}
                  />
                </div>

                {/* Photo */}
                <div className="mb-5">
                  <label className={labelClass}>
                    Photo{" "}
                    <span className="text-[rgba(26,24,20,0.2)]">(optional)</span>
                  </label>
                  <PhotoUpload
                    onUpload={(urls) => setImageUrl(urls)}
                    maxPhotos={1}
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className={labelClass}>
                    Description{" "}
                    <span className="text-[rgba(26,24,20,0.2)]">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any additional details..."
                    rows={2}
                    className="w-full px-4 py-3 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)] resize-none"
                  />
                </div>

                {/* Continue to confirm — disabled if a duplicate was detected */}
                <button
                  type="button"
                  onClick={() => {
                    if (!reference.trim()) {
                      setError("Reference number is required.");
                      return;
                    }
                    if (dupCheck === "found") {
                      setError("This reference already exists in the catalog. Use the existing entry instead.");
                      return;
                    }
                    goTo(4);
                  }}
                  disabled={dupCheck === "found"}
                  className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {dupCheck === "found" ? "Reference already exists" : "Review & Confirm"}
                </button>

                {/* Shortcut: jump straight to adding the existing one */}
                {dupCheck === "found" && existingRef && (
                  <button
                    type="button"
                    onClick={handleAddExisting}
                    className="w-full mt-3 py-3 text-[14px] font-semibold bg-[#8a7a5a] text-white rounded-full hover:bg-[#7a6a4a] active:scale-[0.98] transition-all duration-200"
                  >
                    Add the existing {existingRef.reference} instead
                  </button>
                )}

                {error && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-[12px]">
                    <p className="text-[13px] text-red-600">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* ======= STEP 4: Confirm ======= */}
            {step === 4 && (
              <div>
                <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.35)] mb-1">
                  Step 4 of 4
                </p>
                <h2 className="text-[28px] font-serif italic text-[#1a1814] leading-tight mb-6">
                  Confirm
                </h2>

                {/* Summary card */}
                <div className="bg-white rounded-[20px] border border-[rgba(26,24,20,0.06)] p-5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-[14px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center flex-shrink-0">
                      {imageUrl[0] ? (
                        <img
                          src={imageUrl[0]}
                          alt=""
                          className="w-full h-full object-contain p-2 rounded-[14px]"
                        />
                      ) : (
                        <span className="text-white/20 text-[20px] font-bold font-serif">
                          {brand.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.35)] mb-0.5">
                        {brand}
                      </p>
                      <p className="text-[18px] font-bold text-[#1a1814] mb-1">
                        {selectedFamily?.model || model}
                      </p>
                      <p className="text-[13px] font-mono text-[rgba(26,24,20,0.4)]">
                        Ref. {reference}
                      </p>
                    </div>
                  </div>

                  {/* Specs summary */}
                  <div className="mt-4 pt-4 border-t border-[rgba(26,24,20,0.06)] grid grid-cols-2 gap-2">
                    {sizeMm && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Size:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {sizeMm}mm
                        </span>
                      </div>
                    )}
                    {color && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Dial:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(color)}
                        </span>
                      </div>
                    )}
                    {material && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Material:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {material}
                        </span>
                      </div>
                    )}
                    {movement && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Movement:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(movement)}
                        </span>
                      </div>
                    )}
                    {braceletType && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Bracelet:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(braceletType)}
                        </span>
                      </div>
                    )}
                    {category && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Category:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(category)}
                        </span>
                      </div>
                    )}
                    {origin && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Origin:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {origin}
                        </span>
                      </div>
                    )}
                    {shape && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Shape:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(shape)}
                        </span>
                      </div>
                    )}
                    {crystal && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Crystal:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(crystal)}
                        </span>
                      </div>
                    )}
                    {caseBack && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Case Back:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(caseBack)}
                        </span>
                      </div>
                    )}
                    {bezelType && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Bezel:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {capitalize(bezelType)}
                        </span>
                      </div>
                    )}
                    {waterResistanceM && (
                      <div className="text-[12px]">
                        <span className="text-[rgba(26,24,20,0.35)]">
                          Water Res.:{" "}
                        </span>
                        <span className="text-[#1a1814] font-medium">
                          {waterResistanceM}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dup check status */}
                {dupCheck === "checking" && (
                  <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-4 h-4 border-2 border-[rgba(26,24,20,0.08)] border-t-[#8a7a5a] rounded-full animate-spin" />
                    <span className="text-[13px] text-[rgba(26,24,20,0.4)]">
                      Checking if this reference already exists...
                    </span>
                  </div>
                )}

                {dupCheck === "found" && (
                  <div className="bg-[rgba(138,122,90,0.06)] border border-[rgba(138,122,90,0.15)] rounded-[16px] p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8a7a5a"
                        strokeWidth="2"
                        className="flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1814] mb-1">
                          This reference already exists!
                        </p>
                        <p className="text-[13px] text-[rgba(26,24,20,0.5)] mb-4">
                          Add it directly to your collection instead of
                          creating a duplicate.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddExisting}
                          className="w-full py-3 text-[15px] font-semibold bg-[#8a7a5a] text-white rounded-full hover:bg-[#7a6a4a] active:scale-[0.98] transition-all duration-200"
                        >
                          Add to My Collection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {dupCheck === "not_found" && (
                  <>
                    <div className="px-3 py-2.5 bg-[rgba(138,122,90,0.06)] border border-[rgba(138,122,90,0.12)] rounded-[10px] mb-3">
                      <p className="text-[11px] text-[rgba(26,24,20,0.5)] leading-relaxed">
                        <strong className="text-[#8a7a5a] font-semibold">Community contribution.</strong>{" "}
                        This watch will be added to the public catalog for all users. Please ensure the information is accurate — editing privileges may be revoked for inaccurate or abusive submissions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={submitting}
                      className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                    >
                      {submitting
                        ? "Adding to Catalog..."
                        : "Add to Catalog"}
                    </button>

                    {error && (
                      <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-[12px]">
                        <p className="text-[13px] text-red-600">{error}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-[14px] font-medium text-[rgba(26,24,20,0.4)] hover:text-[rgba(26,24,20,0.6)] transition-colors mt-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
