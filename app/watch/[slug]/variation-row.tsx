"use client";

import { useState } from "react";
import Link from "next/link";
import { CatalogImageUpload } from "@/components/catalog-image-upload";
import { ReferenceEditButton } from "./community-features";

interface VariationRowProps {
  id: number;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  sizeMm: number | null;
  movement: string | null;
  material: string | null;
  color: string | null;
  category: string | null;
  braceletType: string | null;
  shape: string | null;
  waterResistanceM: number | null;
  crystal: string | null;
  caseBack: string | null;
  origin: string | null;
  complications: string[] | null;
  imageUrl: string | null;
  isCommunitySubmitted: boolean;
  isFeatured: boolean;
  collectorCount: number;
  isSignedIn: boolean;
  isFirst: boolean;
}

export function VariationRow({
  id, slug, brand, model, reference, sizeMm, movement, material, color, category,
  braceletType, shape, waterResistanceM, crystal, caseBack, origin,
  complications, imageUrl, isCommunitySubmitted, isFeatured, collectorCount,
  isSignedIn, isFirst,
}: VariationRowProps) {
  const [expanded, setExpanded] = useState(false);

  const specs = [
    category && { label: "Category", value: category },
    sizeMm && { label: "Size", value: `${sizeMm}mm` },
    movement && { label: "Movement", value: movement },
    material && { label: "Material", value: material },
    color && { label: "Dial", value: color },
    braceletType && { label: "Bracelet", value: braceletType },
    origin && { label: "Origin", value: origin },
    crystal && { label: "Crystal", value: crystal },
    waterResistanceM && { label: "Water Res.", value: `${waterResistanceM}m` },
    caseBack && { label: "Case Back", value: caseBack },
    shape && { label: "Shape", value: shape },
  ].filter(Boolean) as { label: string; value: string }[];

  // Count how many of the 9 analytics dimensions are filled
  const dimensionFields = [movement, category, material, braceletType, shape, color, crystal, origin, caseBack];
  const specsFilled = dimensionFields.filter((v) => v != null && v !== "").length;
  const specsTotal = dimensionFields.length;

  return (
    <div
      id={`ref-${id}`}
      className={`${!isFirst ? "border-t border-[rgba(26,24,20,0.06)]" : ""} ${
        isFeatured ? "bg-[rgba(138,122,90,0.04)]" : ""
      }`}
    >
      {/* Compact row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(26,24,20,0.015)] text-left"
      >
        {/* Thumb */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={`${brand} ${model}`} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white/20 text-[13px] font-bold font-mono">
                {reference?.slice(0, 3) || brand.charAt(0)}
              </span>
            )}
          </div>
          {isSignedIn && (
            <CatalogImageUpload referenceId={id} currentImageUrl={imageUrl} brand={brand} model={model} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[#1a1814] truncate">
              {reference || model}
            </p>
            {isFeatured && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a7a5a] bg-[rgba(138,122,90,0.1)] rounded-full flex-shrink-0">
                Most popular
              </span>
            )}
            {isCommunitySubmitted && (
              <span className="text-[11px] text-[rgba(26,24,20,0.35)] flex-shrink-0">👥</span>
            )}
          </div>
          {/* Clear description of what makes this variation unique */}
          <p className="text-[12px] text-[rgba(26,24,20,0.5)] truncate">
            {[
              color ? `${color.charAt(0).toUpperCase() + color.slice(1)} dial` : null,
              material,
              sizeMm ? `${sizeMm}mm` : null,
              braceletType,
            ].filter(Boolean).join(" · ")}
          </p>
          <p className="text-[10px] text-[rgba(26,24,20,0.3)] truncate mt-0.5">
            {[movement, origin, crystal].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Count + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {collectorCount > 0 && (
            <span className="text-[12px] text-[rgba(26,24,20,0.3)] font-medium">
              {collectorCount}
            </span>
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-[rgba(26,24,20,0.2)] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1">
          {/* Full specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mb-4">
            {specs.map((s) => (
              <div key={s.label}>
                <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-semibold">{s.label}</p>
                <p className="text-[13px] text-[#1a1814] font-medium capitalize">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Complications */}
          {complications && complications.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-semibold mb-1">Complications</p>
              <div className="flex flex-wrap gap-1.5">
                {complications.map((c) => (
                  <span key={c} className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)] capitalize">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spec completeness nudge */}
          {isSignedIn && specsFilled < specsTotal && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-[rgba(138,122,90,0.04)] rounded-[10px]">
              <div className="flex gap-0.5">
                {dimensionFields.map((v, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      v != null && v !== "" ? "bg-[#8a7a5a]" : "bg-[rgba(26,24,20,0.08)]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[rgba(26,24,20,0.4)]">
                {specsFilled}/{specsTotal} specs filled — help the community by adding more
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(26,24,20,0.05)]">
            <Link
              href={`/watch/${slug}`}
              className="text-[12px] font-medium text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
            >
              View full page &rarr;
            </Link>
            {isSignedIn && (
            <div className="flex items-center gap-2">
              <ReferenceEditButton
                referenceId={id}
                current={{
                  reference,
                  sizeMm,
                  movement,
                  material,
                  color,
                  category,
                  braceletType,
                  shape,
                  waterResistanceM,
                  crystal,
                  caseBack,
                  origin,
                  description: null,
                  imageUrl,
                }}
              />
              {/* label is inside the button component now */}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
