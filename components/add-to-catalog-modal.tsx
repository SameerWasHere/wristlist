"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PhotoUpload } from "@/components/photo-upload";
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

  // Phase 1: Brand + Model
  const [phase, setPhase] = useState<1 | 2>(1);
  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [fuzzyMatches, setFuzzyMatches] = useState<FuzzyMatch[]>([]);
  const [fuzzyLoading, setFuzzyLoading] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const fuzzyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Phase 2: Full form
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [movement, setMovement] = useState("");
  const [sizeMm, setSizeMm] = useState("");
  const [origin, setOrigin] = useState("");
  const [crystal, setCrystal] = useState("");
  const [material, setMaterial] = useState("");
  const [braceletType, setBraceletType] = useState("");
  const [waterResistanceM, setWaterResistanceM] = useState("");
  const [caseBack, setCaseBack] = useState("");
  const [shape, setShape] = useState("");
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [description, setDescription] = useState("");

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
      setPhase(1);
      setBrand(initialBrand);
      setModel(initialModel);
      setReference("");
      setCategory("");
      setMovement("");
      setSizeMm("");
      setOrigin("");
      setCrystal("");
      setMaterial("");
      setBraceletType("");
      setWaterResistanceM("");
      setCaseBack("");
      setShape("");
      setImageUrl([]);
      setDescription("");
      setFuzzyMatches([]);
      setNoMatches(false);
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

  // Fuzzy search as user types brand + model
  useEffect(() => {
    if (fuzzyTimer.current) clearTimeout(fuzzyTimer.current);

    const query = `${brand} ${model}`.trim();
    if (query.length < 2) {
      setFuzzyMatches([]);
      setNoMatches(false);
      return;
    }

    setFuzzyLoading(true);
    fuzzyTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/catalog?fuzzy=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        const families: FuzzyMatch[] = data.families ?? [];
        setFuzzyMatches(families.slice(0, 3));
        setNoMatches(families.length === 0);
      } catch {
        setFuzzyMatches([]);
        setNoMatches(true);
      } finally {
        setFuzzyLoading(false);
      }
    }, 300);

    return () => {
      if (fuzzyTimer.current) clearTimeout(fuzzyTimer.current);
    };
  }, [brand, model]);

  // Auto-advance to Phase 2 if no matches and both fields filled
  const canProceed = brand.trim().length > 0 && model.trim().length > 0;

  const handleProceedToPhase2 = useCallback(() => {
    if (canProceed) {
      setPhase(2);
    }
  }, [canProceed]);

  // Submit to catalog
  const handleSubmit = useCallback(async () => {
    if (!brand.trim() || !model.trim() || !reference.trim()) {
      setError("Brand, model, and reference are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          reference: reference.trim(),
          category: category || undefined,
          movement: movement || undefined,
          sizeMm: sizeMm || undefined,
          origin: origin || undefined,
          crystal: crystal || undefined,
          material: material.trim() || undefined,
          braceletType: braceletType || undefined,
          waterResistanceM: waterResistanceM || undefined,
          caseBack: caseBack || undefined,
          shape: shape || undefined,
          imageUrl: imageUrl[0] || undefined,
          description: description.trim() || undefined,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error || "You've added 5 watches today. Try again tomorrow.");
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Something went wrong" }));
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
    category,
    movement,
    sizeMm,
    origin,
    crystal,
    material,
    braceletType,
    waterResistanceM,
    caseBack,
    shape,
    imageUrl,
    description,
    onCreated,
    onClose,
  ]);

  if (!animating && !open) return null;

  const inputClass =
    "w-full px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)]";

  const selectClass =
    "w-full px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors text-[#1a1814] appearance-none";

  const labelClass =
    "text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-2 block";

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: animating || open ? "auto" : "none" }}
      >
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
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out"
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

            {/* Header */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[2px] font-medium text-[rgba(26,24,20,0.4)] mb-1">
                Community Catalog
              </p>
              <h2 className="text-[24px] font-bold text-[#1a1814] leading-tight mb-1">
                Add to Catalog
              </h2>
              <p className="text-[13px] text-[rgba(26,24,20,0.4)]">
                {phase === 1
                  ? "Enter the brand and model to check if it already exists."
                  : "Fill in the specs you know -- we'll add it to the catalog."}
              </p>
            </div>

            {/* ======= PHASE 1: Brand + Model with fuzzy matching ======= */}
            {phase === 1 && (
              <>
                {/* Brand input with autocomplete */}
                <div className="mb-4" ref={brandRef}>
                  <label className={labelClass}>
                    Brand <span className="text-[#8a7a5a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      onFocus={() => {
                        if (brandSuggestions.length > 0)
                          setShowBrandDropdown(true);
                      }}
                      placeholder="e.g. Omega, Rolex, Seiko..."
                      className={inputClass}
                      autoComplete="off"
                    />
                    {showBrandDropdown && brandSuggestions.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-[12px] shadow-[0_8px_32px_rgba(26,24,20,0.12)] border border-[rgba(26,24,20,0.06)] z-50 overflow-hidden max-h-[200px] overflow-y-auto">
                        {brandSuggestions.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setBrand(b);
                              setShowBrandDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[14px] text-[#1a1814] hover:bg-[rgba(26,24,20,0.03)] transition-colors"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Model input */}
                <div className="mb-6">
                  <label className={labelClass}>
                    Model <span className="text-[#8a7a5a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Submariner, Speedmaster, Prospex..."
                    className={inputClass}
                  />
                </div>

                {/* Fuzzy matches: "Did you mean?" */}
                {fuzzyLoading && canProceed && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 border-2 border-[rgba(26,24,20,0.1)] border-t-[#8a7a5a] rounded-full animate-spin" />
                    <span className="text-[13px] text-[rgba(26,24,20,0.4)]">
                      Checking catalog...
                    </span>
                  </div>
                )}

                {!fuzzyLoading && fuzzyMatches.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[12px] font-medium text-[rgba(26,24,20,0.5)] mb-3">
                      Did you mean one of these?
                    </p>
                    <div className="bg-[rgba(26,24,20,0.02)] rounded-[16px] border border-[rgba(26,24,20,0.06)] overflow-hidden">
                      {fuzzyMatches.map((match, i) => (
                        <div key={match.id}>
                          {i > 0 && (
                            <div className="mx-4 border-t border-[rgba(26,24,20,0.06)]" />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              // User picked an existing family -- close and let parent handle
                              onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(26,24,20,0.04)] transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a20] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {match.imageUrl ? (
                                <img
                                  src={match.imageUrl}
                                  alt=""
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <span className="text-white/30 text-[14px] font-bold">
                                  {match.brand.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-foreground truncate">
                                {match.brand} {match.model}
                              </p>
                              <p className="text-[11px] text-[rgba(26,24,20,0.4)]">
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
                              className="text-[rgba(26,24,20,0.2)] flex-shrink-0"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* "No, this is different" button */}
                    <button
                      type="button"
                      onClick={handleProceedToPhase2}
                      className="w-full mt-3 py-3 text-[14px] font-semibold text-[#8a7a5a] bg-[rgba(138,122,90,0.08)] rounded-[12px] hover:bg-[rgba(138,122,90,0.12)] transition-colors"
                    >
                      No, this is a different watch
                    </button>
                  </div>
                )}

                {/* No matches found -- auto show proceed button */}
                {!fuzzyLoading && noMatches && canProceed && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-[#8a7a5a]"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span className="text-[13px] text-[rgba(26,24,20,0.5)]">
                        Not found in catalog. You can add it.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleProceedToPhase2}
                      className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200"
                    >
                      Continue to Add Details
                    </button>
                  </div>
                )}

                {/* If neither loading nor results, and can proceed */}
                {!fuzzyLoading &&
                  fuzzyMatches.length === 0 &&
                  !noMatches &&
                  canProceed && (
                    <button
                      type="button"
                      onClick={handleProceedToPhase2}
                      className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200 mb-4"
                    >
                      Continue
                    </button>
                  )}
              </>
            )}

            {/* ======= PHASE 2: Full spec form ======= */}
            {phase === 2 && (
              <>
                {/* Back to Phase 1 */}
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="text-[13px] text-[#8a7a5a] hover:underline mb-4 block"
                >
                  &larr; Back
                </button>

                {/* Brand + Model (editable) */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>
                      Brand <span className="text-[#8a7a5a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Model <span className="text-[#8a7a5a]">*</span>
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Reference Number (required) */}
                <div className="mb-4">
                  <label className={labelClass}>
                    Reference Number <span className="text-[#8a7a5a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 210.30.42.20.06.001"
                    className={inputClass}
                  />
                </div>

                {/* Category + Movement */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.category.map((c) => (
                        <option key={c} value={c}>
                          {capitalize(c)}
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

                {/* Size + Origin */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Case Size (mm)</label>
                    <input
                      type="number"
                      value={sizeMm}
                      onChange={(e) => setSizeMm(e.target.value)}
                      placeholder="e.g. 42"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Origin</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.origin.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Crystal + Case Material */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Crystal</label>
                    <select
                      value={crystal}
                      onChange={(e) => setCrystal(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.crystal.map((c) => (
                        <option key={c} value={c}>
                          {capitalize(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Case Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. Stainless steel"
                      className={inputClass}
                      list="material-suggestions"
                    />
                    <datalist id="material-suggestions">
                      <option value="Stainless steel" />
                      <option value="Titanium" />
                      <option value="Gold" />
                      <option value="Rose gold" />
                      <option value="Ceramic" />
                      <option value="Carbon" />
                      <option value="Bronze" />
                      <option value="Platinum" />
                    </datalist>
                  </div>
                </div>

                {/* Bracelet Type + Water Resistance */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Bracelet Type</label>
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

                {/* Case Back + Shape */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelClass}>Case Back</label>
                    <select
                      value={caseBack}
                      onChange={(e) => setCaseBack(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.case_back.map((c) => (
                        <option key={c} value={c}>
                          {capitalize(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Shape</label>
                    <select
                      value={shape}
                      onChange={(e) => setShape(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select...</option>
                      {KNOWN.shape.map((s) => (
                        <option key={s} value={s}>
                          {capitalize(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo */}
                <div className="mb-4">
                  <label className={labelClass}>
                    Photo{" "}
                    <span className="text-[rgba(26,24,20,0.25)]">
                      (optional)
                    </span>
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
                    <span className="text-[rgba(26,24,20,0.25)]">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any additional details about this watch..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-[16px] bg-white border border-[rgba(26,24,20,0.08)] rounded-[12px] focus:outline-none focus:border-[rgba(138,122,90,0.5)] focus:ring-1 focus:ring-[rgba(138,122,90,0.5)] transition-colors placeholder:text-[rgba(26,24,20,0.2)] resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-[12px]">
                    <p className="text-[13px] text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 text-[15px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:bg-[#2a2824] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add to Catalog"}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-[14px] font-medium text-[rgba(26,24,20,0.4)] hover:text-[rgba(26,24,20,0.6)] transition-colors mt-2"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
