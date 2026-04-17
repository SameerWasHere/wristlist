"use client";

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
  bezelType: string | null;
  shape: string | null;
  waterResistanceM: number | null;
  crystal: string | null;
  caseBack: string | null;
  origin: string | null;
  complications: string[] | null;
  description?: string | null;
  imageUrl: string | null;
  isCommunitySubmitted: boolean;
  isFeatured: boolean;
  collectorCount: number;
  isSignedIn: boolean;
  isFirst: boolean;
}

export function VariationRow({
  id, slug, brand, model, reference, sizeMm, movement, material, color, category,
  braceletType, bezelType, shape, waterResistanceM, crystal, caseBack, origin,
  description, imageUrl, isCommunitySubmitted, isFeatured, collectorCount,
  isSignedIn, isFirst,
}: VariationRowProps) {
  const quickSpecs = [
    { label: "Movement", value: movement },
    { label: "Size", value: sizeMm ? `${sizeMm}mm` : null },
    { label: "Category", value: category },
    { label: "Dial", value: color },
    { label: "Material", value: material },
    { label: "Bracelet", value: braceletType },
    { label: "Bezel", value: bezelType },
    { label: "Shape", value: shape },
    { label: "Origin", value: origin },
    { label: "Crystal", value: crystal },
    { label: "Water Res.", value: waterResistanceM ? `${waterResistanceM}m` : null },
    { label: "Case Back", value: caseBack },
  ].filter((s) => s.value);

  return (
    <div
      id={`ref-${id}`}
      className={`${!isFirst ? "border-t border-[rgba(26,24,20,0.06)]" : ""} ${
        isFeatured ? "bg-[rgba(138,122,90,0.04)]" : ""
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-[rgba(26,24,20,0.015)] transition-colors">
        {/* Thumb (with upload overlay as sibling, not nested inside link) */}
        <div className="relative flex-shrink-0">
          <Link
            href={`/watch/${slug}`}
            className="block w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1a1814] to-[#2a2824] flex items-center justify-center overflow-hidden"
            aria-label={`Open ${brand} ${model} ${reference}`}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={`${brand} ${model}`} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white/20 text-[13px] font-bold font-mono">
                {reference ? reference.slice(-3) : brand.charAt(0)}
              </span>
            )}
          </Link>
          {isSignedIn && (
            <CatalogImageUpload referenceId={id} currentImageUrl={imageUrl} brand={brand} model={model} />
          )}
        </div>

        {/* Info — Link so the text area navigates to the variant page */}
        <Link href={`/watch/${slug}`} className="flex-1 min-w-0 group no-underline text-inherit">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-[#1a1814] group-hover:text-[#8a7a5a] transition-colors">
              {reference || model}
            </p>
            {isFeatured && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8a7a5a] bg-[rgba(138,122,90,0.1)] rounded-full">
                Most popular
              </span>
            )}
            {isCommunitySubmitted && (
              <span className="text-[11px] text-[rgba(26,24,20,0.35)]">👥</span>
            )}
            {collectorCount > 0 && (
              <span className="text-[11px] text-[rgba(26,24,20,0.35)] font-medium">
                · {collectorCount} {collectorCount === 1 ? "collector" : "collectors"}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11.5px] font-serif italic text-[rgba(26,24,20,0.55)] leading-snug mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
          {/* All 12 editable specs in a compact 3-column grid */}
          {quickSpecs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 mt-2">
              {quickSpecs.map((s) => (
                <div key={s.label} className="min-w-0 flex items-baseline gap-1.5">
                  <p className="text-[9px] uppercase tracking-[1px] text-[rgba(26,24,20,0.3)] font-medium leading-tight flex-shrink-0">
                    {s.label}
                  </p>
                  <p className="text-[11.5px] text-[#1a1814] truncate capitalize leading-snug">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Link>

        {/* Edit button — always visible on the row for signed-in users */}
        {isSignedIn && (
          <div className="flex-shrink-0">
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
                bezelType,
                shape,
                waterResistanceM,
                crystal,
                caseBack,
                origin,
                description: description ?? null,
                imageUrl,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
