interface WatchCardProps {
  brand: string;
  model: string;
  reference: string;
  category: string;
  sizeMm: number;
  movement: string;
  price: number;
  imageUrl?: string;
  color?: string;
  featured?: boolean;
}

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function WatchCard({
  brand,
  model,
  reference,
  category,
  sizeMm,
  movement,
  price,
  imageUrl,
  color = "default",
  featured = false,
}: WatchCardProps) {
  const gradient = colorGradients[color] || colorGradients.default;
  const initial = brand.charAt(0).toUpperCase();
  const heroHeight = featured ? 280 : 200;

  return (
    <div className="rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(26,24,20,0.04)] group">
      {/* Top gradient section */}
      <div
        className="relative overflow-hidden flex items-end"
        style={{ background: gradient, height: heroHeight }}
      >
        {/* Large faint initial */}
        <span
          className="absolute inset-0 flex items-center justify-center font-serif font-bold text-white pointer-events-none select-none"
          style={{ fontSize: heroHeight * 0.7, opacity: 0.04 }}
        >
          {initial}
        </span>

        {/* Watch image if provided */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${brand} ${model}`}
            className="absolute inset-0 w-full h-full object-contain p-8 z-[1]"
          />
        )}

        {/* Bottom gradient overlay with text */}
        <div
          className="relative z-[2] w-full px-5 pb-5 pt-16"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[2px] font-medium mb-1"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {brand}
          </p>
          <h3
            className={`font-bold text-white leading-tight ${
              featured ? "text-[24px]" : "text-[18px]"
            }`}
          >
            {model}
          </h3>
        </div>
      </div>

      {/* Bottom white section */}
      <div className="bg-white border border-t-0 border-[rgba(26,24,20,0.06)] rounded-b-[20px] p-5">
        <div className="mb-3">
          <span className="text-[12px] font-mono text-[rgba(26,24,20,0.35)] tracking-wide">
            {reference}
          </span>
        </div>

        {/* Spec tags */}
        <div className="flex flex-wrap gap-1.5">
          {[category, `${sizeMm}mm`, movement].map((spec) => (
            <span
              key={spec}
              className="px-3 py-1 text-[11px] font-medium rounded-full bg-[rgba(26,24,20,0.04)] text-[rgba(26,24,20,0.5)]"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
