import { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { ScoreRing } from "@/components/score-ring";
import { DnaTags } from "@/components/dna-tags";
import { WatchGrid } from "@/components/watch-grid";

// -- Metadata ---------------------------------------------------------------

export const metadata: Metadata = {
  title: "Dashboard — WristList",
  description: "Your watch collection at a glance.",
};

// -- Hardcoded Data (Phase 1) -----------------------------------------------

const COLLECTION = [
  {
    brand: "Rolex",
    model: "Submariner Date",
    reference: "126610LN",
    category: "Diver",
    sizeMm: 41,
    movement: "Automatic",
    price: 12400,
    color: "black",
  },
  {
    brand: "Hamilton",
    model: "Pilot Day Date",
    reference: "H64615135",
    category: "Pilot",
    sizeMm: 42,
    movement: "Automatic",
    price: 1135,
    color: "black",
  },
  {
    brand: "Seiko",
    model: "Prospex Alpinist",
    reference: "SPB121",
    category: "Field",
    sizeMm: 39.5,
    movement: "Automatic",
    price: 599,
    color: "green",
  },
  {
    brand: "Casio",
    model: "Vintage Multiface",
    reference: "A130WEG-9A",
    category: "Digital",
    sizeMm: 40.5,
    movement: "Battery",
    price: 92,
    color: "gold",
  },
];

const DNA_TAGS = [
  { text: "mechanical purist", primary: true },
  { text: "tool watch lover", primary: true },
  { text: "Swiss & Japanese", primary: false },
  { text: "water ready", primary: false },
  { text: "sapphire loyalist", primary: false },
];

const SCORE = 48;

const GAPS = [
  { label: "Shape", current: 2, total: 5 },
  { label: "Movement", current: 2, total: 5 },
  { label: "Color", current: 3, total: 7 },
];

// -- Helpers ----------------------------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function gapColor(current: number, total: number): string {
  const pct = current / total;
  if (pct < 0.3) return "#DC2626";
  if (pct <= 0.6) return "#B8860B";
  return "#059669";
}

// -- Page -------------------------------------------------------------------

export default function DashboardPage() {
  const totalValue = COLLECTION.reduce((sum, w) => sum + w.price, 0);

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="max-w-[960px] mx-auto px-6 pb-20">
        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-8" />

        {/* ── Compact Score Bar ─────────────────────────────── */}
        <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] px-6 py-4 mb-10 flex items-center gap-6">
          <ScoreRing score={SCORE} size={44} />
          <div className="flex items-center gap-8 text-[13px]">
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Owned</span>{" "}
              <span className="font-bold tracking-tight">{COLLECTION.length}</span>
            </div>
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Value</span>{" "}
              <span className="font-bold tracking-tight">
                ${Math.round(totalValue / 1000)}k
              </span>
            </div>
            <div>
              <span className="text-[rgba(26,24,20,0.35)] font-medium">Wishlist</span>{" "}
              <span className="font-bold tracking-tight">5</span>
            </div>
          </div>
        </div>

        {/* ── My Collection ────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
            <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
              My Collection
            </h2>
            <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
              {COLLECTION.length} pieces
            </span>
          </div>
          <WatchGrid watches={COLLECTION} />
        </section>

        {/* ── DNA Tags ─────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            Collector DNA
          </h2>
          <DnaTags tags={DNA_TAGS} />
        </section>

        {/* ── Your Next Move ───────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            Your Next Move
          </h2>
          <div
            className="rounded-[20px] px-6 py-5 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(5,150,105,0.04) 0%, rgba(5,150,105,0.02) 100%)",
              borderColor: "rgba(5,150,105,0.12)",
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold mb-0.5">
                  Nomos Glashutte
                </p>
                <p className="text-[18px] font-bold tracking-[-0.3px]">
                  Tangente
                </p>
                <p className="text-[13px] text-[rgba(26,24,20,0.45)] mt-1 leading-relaxed max-w-md">
                  German dress watch with manual wind — fills 4 gaps in one purchase
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[20px] font-black tracking-[-0.5px]">
                  {formatPrice(2780)}
                </p>
                <span className="inline-block mt-1.5 text-[9px] font-bold text-[#059669] bg-[rgba(5,150,105,0.08)] px-2.5 py-1 rounded-full">
                  Best value on your wishlist
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Collection Gaps ──────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-4">
            Collection Gaps
          </h2>
          <div className="bg-white border border-[rgba(26,24,20,0.06)] rounded-[20px] px-6 py-5 space-y-4">
            {GAPS.map((gap) => {
              const pct = (gap.current / gap.total) * 100;
              const color = gapColor(gap.current, gap.total);
              return (
                <div key={gap.label}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[13px] font-semibold tracking-tight">
                      {gap.label}
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color }}
                    >
                      {gap.current}/{gap.total}
                    </span>
                  </div>
                  <div className="h-[6px] rounded-full bg-[rgba(26,24,20,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <Link
              href="/sameer"
              className="inline-block mt-2 text-[12px] font-semibold text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
            >
              See full analysis &rarr;
            </Link>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="text-center py-8">
          <p className="text-[13px] font-light tracking-[4px] uppercase text-[rgba(26,24,20,0.2)]">
            <strong className="font-bold">WRIST</strong>LIST
          </p>
          <p className="text-[11px] text-[rgba(26,24,20,0.15)] mt-2 font-serif italic">
            Every collection tells a story.
          </p>
        </footer>
      </div>
    </div>
  );
}
