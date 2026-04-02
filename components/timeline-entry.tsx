import Link from "next/link";

const colorGradients: Record<string, string> = {
  black: "linear-gradient(135deg, #0a0a0a, #1a2332)",
  blue: "linear-gradient(135deg, #0a1020, #1a2332)",
  green: "linear-gradient(135deg, #0a1a0a, #1a2a1a)",
  gold: "linear-gradient(135deg, #1a1a0a, #2a2a18)",
  silver: "linear-gradient(135deg, #1a1a1a, #2a2a2e)",
  white: "linear-gradient(135deg, #1a1a1e, #2a2a30)",
  brown: "linear-gradient(135deg, #1a1008, #2a1c10)",
  default: "linear-gradient(135deg, #0a0a0a, #1a1a20)",
};

interface TimelineEntryProps {
  brand: string;
  model: string;
  reference: string;
  category: string;
  movement: string;
  sizeMm: number;
  origin: string;
  caption?: string;
  milestone?: string;
  acquiredYear?: number;
  modelYear?: number;
  photos?: string[];
  imageUrl?: string;
  slug: string;
  color?: string;
  modifications?: string[];
}

export function TimelineEntry({
  brand,
  model,
  reference,
  category,
  movement,
  sizeMm,
  origin,
  caption,
  milestone,
  acquiredYear,
  modelYear,
  photos,
  imageUrl,
  slug,
  color = "default",
  modifications,
}: TimelineEntryProps) {
  const gradient = colorGradients[color] || colorGradients.default;
  const initial = brand.charAt(0).toUpperCase();
  const hasUserPhoto = photos && photos.length > 0;
  const hasImage = hasUserPhoto || imageUrl;

  const specs = [category, `${sizeMm}mm`, movement, origin].filter(
    (s) => s && s !== "0mm"
  );

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(26,24,20,0.06)] shadow-[0_4px_24px_rgba(26,24,20,0.04)] overflow-hidden">
      {/* Photo area — 16:10 ratio */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
        {hasUserPhoto ? (
          <img
            src={photos![0]}
            alt={`${brand} ${model}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : imageUrl ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: gradient }}
          >
            <span
              className="absolute font-serif font-bold text-white pointer-events-none select-none"
              style={{ fontSize: 180, opacity: 0.04 }}
            >
              {initial}
            </span>
            <img
              src={imageUrl}
              alt={`${brand} ${model}`}
              className="relative w-full h-full object-contain p-8 z-[1]"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: gradient }}
          >
            <span
              className="font-serif font-bold text-white select-none"
              style={{ fontSize: 160, opacity: 0.08 }}
            >
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Brand */}
        <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.35)] font-bold mb-1">
          {brand}
        </p>

        {/* Model */}
        <h3 className="text-[22px] font-bold tracking-[-0.3px] leading-tight text-foreground mb-1">
          {model}
        </h3>

        {/* Reference */}
        <p className="text-[12px] font-mono text-[rgba(26,24,20,0.3)] tracking-wide mb-4">
          {reference}
        </p>

        {/* Caption */}
        {caption && (
          <p className="text-[15px] text-foreground/80 leading-relaxed mb-3">
            &ldquo;{caption}&rdquo;
          </p>
        )}

        {/* Milestone */}
        {milestone && (
          <p className="font-serif italic text-[14px] text-[#8a7a5a] mb-3">
            {milestone}
          </p>
        )}

        {/* Year info */}
        {(acquiredYear || modelYear) && (
          <p className="text-[12px] text-[rgba(26,24,20,0.35)] mb-4">
            {acquiredYear && <>Acquired {acquiredYear}</>}
            {acquiredYear && modelYear && <> &middot; </>}
            {modelYear && <>Model Year {modelYear}</>}
          </p>
        )}

        {/* Spec tags */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specs.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 text-[11px] font-medium rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)]"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Modifications */}
        {modifications && modifications.length > 0 && (
          <p className="text-[12px] text-[rgba(26,24,20,0.4)] mb-4">
            <span className="font-semibold">Mods:</span>{" "}
            {modifications.join(", ")}
          </p>
        )}

        {/* Link */}
        <Link
          href={`/watch/${slug}`}
          className="text-[12px] font-semibold text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
        >
          View Watch Details &rarr;
        </Link>
      </div>
    </div>
  );
}
