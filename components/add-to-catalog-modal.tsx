"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PhotoUpload } from "@/components/photo-upload";
import { KNOWN } from "@/lib/known-values";

interface FuzzyMatch {
  id: number;
  slug: string;
  brand: string;
  model: string;
  collection: string | null;
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

const MATERIALS = [
  "Stainless steel",
  "Titanium",
  "Gold",
  "Rose gold",
  "White gold",
  "Ceramic",
  "Carbon",
  "Bronze",
  "Platinum",
];

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
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  // Step 4: Confirm
  const [dupCheck, setDupCheck] = useState<"checking" | "found" | "not_found" | null>(null);
  const [existingRefId, setExistingRefId] = useState<number | null>(null);

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
      setImageUrl([]);
      setDescription("");
      setFamilyMatches([]);
      setSelectedFamily(null);
      setIsNewModel(false);
      setDupCheck(null);
      setExistingRefId(null);
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
        const families: FuzzyMatch[] = (data.families ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (f: any) => ({
            ...f,
            collection: f.collection ?? null,
          }),
        );
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

  // Step 4: duplicate check
  useEffect(() => {
    if (step !== 4 || !reference.trim() || !brand.trim()) return;
    setDupCheck("checking");
    setExistingRefId(null);
    fetch(
      `/api/catalog?ref=${encodeURIComponent(reference.trim())}&brand=${encodeURIComponent(brand.trim())}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.exists && data.watchReferenceId) {
          setDupCheck("found");
          setExistingRefId(data.watchReferenceId);
        } else {
          setDupCheck("not_found");
        }
      })
      .catch(() => setDupCheck("not_found"));
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

  // Group families by collection
  const groupedByCollection = familyMatches.reduce<
    Record<string, FuzzyMatch[]>
  >((acc, f) => {
    const key = f.collection || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const stepLabels = ["Brand", "Model", "Details", "Confirm"];

  return (
    <div
      className="fixed inset-0 z-[9999]"
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

      {/* Modal sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#f6f4ef] rounded-t-[24px] max-h-[92vh] overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
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
                  Which model?
                </h2>
                <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-6">
                  Pick an existing {brand} model or add a new one.
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

                {/* Existing models grouped by collection */}
                {!familyLoading && familyMatches.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {Object.entries(groupedByCollection).map(
                      ([collectionName, families]) => (
                        <div key={collectionName}>
                          {/* Collection header */}
                          {collectionName !== "Other" && (
                            <p className="text-[10px] uppercase tracking-[2px] font-semibold text-[#8a7a5a] mb-2 px-1">
                              {collectionName} Collection
                            </p>
                          )}
                          {collectionName === "Other" &&
                            Object.keys(groupedByCollection).length > 1 && (
                              <p className="text-[10px] uppercase tracking-[2px] font-semibold text-[rgba(26,24,20,0.3)] mb-2 px-1">
                                Other Models
                              </p>
                            )}

                          <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] overflow-hidden">
                            {families.map((match, i) => (
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
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* New model input */}
                {!familyLoading && (
                  <div className="bg-white rounded-[16px] border border-[rgba(26,24,20,0.06)] p-4">
                    <p className="text-[11px] uppercase tracking-[1.5px] font-medium text-[rgba(26,24,20,0.35)] mb-2">
                      {familyMatches.length > 0
                        ? "Or add a new model"
                        : "Enter the model name"}
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
                        placeholder="e.g. Submariner, Speedmaster..."
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
                  Your watch&apos;s details
                </h2>

                {selectedFamily ? (
                  <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-6">
                    Adding a new variation to{" "}
                    <span className="font-semibold text-[#1a1814]">
                      {brand} {selectedFamily.model}
                    </span>
                  </p>
                ) : (
                  <p className="text-[14px] text-[rgba(26,24,20,0.4)] mb-6">
                    Tell us what makes your{" "}
                    <span className="font-semibold text-[#1a1814]">
                      {brand} {model}
                    </span>{" "}
                    unique.
                  </p>
                )}

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
                </div>

                {/* Size + Dial Color */}
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
                    <label className={labelClass}>Dial Color</label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.color.map((c) => (
                        <option key={c} value={c}>
                          {capitalize(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Material + Movement */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className={labelClass}>Case Material</label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Movement</label>
                    <select
                      value={movement}
                      onChange={(e) => setMovement(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.movement.map((m) => (
                        <option key={m} value={m}>
                          {capitalize(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bracelet */}
                <div className="mb-5">
                  <label className={labelClass}>Bracelet</label>
                  <select
                    value={braceletType}
                    onChange={(e) => setBraceletType(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select...</option>
                    {KNOWN.bracelet_type.map((b) => (
                      <option key={b} value={b}>
                        {capitalize(b)}
                      </option>
                    ))}
                  </select>
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

                {/* Continue to confirm */}
                <button
                  type="button"
                  onClick={() => {
                    if (!reference.trim()) {
                      setError("Reference number is required.");
                      return;
                    }
                    goTo(4);
                  }}
                  className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200"
                >
                  Review &amp; Confirm
                </button>

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
