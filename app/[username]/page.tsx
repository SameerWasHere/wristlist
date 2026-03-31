import { Metadata } from "next";
import Link from "next/link";
import { Nav, ScoreRing, DnaTags, StatsBar, WatchGrid } from "@/components";

// -- Hardcoded profile data (Phase 1) ----------------------------------

const PROFILE = {
  name: "Sameer",
  handle: "sameer",
  collectingSince: 2019,
  archetype: "The Mechanical Purist",
  tagline:
    "A collection built on precision and heritage. Swiss and Japanese automatic movements, tool watches that can take a beating, and a growing appreciation for the understated.",
  score: 48,
  projectedScore: 67,
  dnaTags: [
    { text: "mechanical purist", primary: true },
    { text: "tool watch lover", primary: true },
    { text: "Swiss & Japanese", primary: false },
    { text: "water ready", primary: false },
    { text: "sapphire loyalist", primary: false },
  ],
  stats: [
    { label: "Watches", value: "4", accent: "#6b5b3a" },
    { label: "Collection Value", value: "$14,226" },
    { label: "Categories", value: "4/7" },
    { label: "On the List", value: "5", accent: "#8a7a5a" },
  ],
};

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

const WISHLIST = [
  {
    rank: 1,
    brand: "Nomos Glash\u00fctte",
    model: "Tangente 2date",
    reference: "135",
    detail: "German \u00b7 Dress \u00b7 Automatic \u00b7 37.5mm",
    price: 2780,
    fills: "Fills 4 gaps",
    bestValue: true,
    gradient: "linear-gradient(145deg,#20202a,#10101a)",
    initial: "N",
  },
  {
    rank: 2,
    brand: "Omega",
    model: "Speedmaster Moonwatch",
    reference: "310.30.42.50.01.001",
    detail: "Swiss \u00b7 Chronograph \u00b7 Manual wind \u00b7 42mm",
    price: 6550,
    fills: "Fills 2 gaps",
    bestValue: false,
    gradient: "linear-gradient(145deg,#1a1a2a,#0f0f1a)",
    initial: "O",
  },
  {
    rank: 3,
    brand: "Tudor",
    model: "Black Bay 58",
    reference: "M79030N",
    detail: "Swiss \u00b7 Diver \u00b7 Automatic \u00b7 39mm",
    price: 3575,
    fills: "Fills 1 gap",
    bestValue: false,
    gradient: "linear-gradient(145deg,#1a2028,#0f1418)",
    initial: "T",
  },
  {
    rank: 4,
    brand: "Grand Seiko",
    model: "Shunbun",
    reference: "SBGA413",
    detail: "Japanese \u00b7 Dress \u00b7 Automatic \u00b7 40mm",
    price: 6300,
    fills: "Fills 1 gap",
    bestValue: false,
    gradient: "linear-gradient(145deg,#2a2028,#1a1018)",
    initial: "GS",
  },
  {
    rank: 5,
    brand: "Oris",
    model: "Pointer Date",
    reference: "4365-07",
    detail: "Swiss \u00b7 Field \u00b7 Automatic \u00b7 40mm",
    price: 2400,
    fills: "Fills 1 gap",
    bestValue: false,
    gradient: "linear-gradient(145deg,#1a2a20,#0f1a10)",
    initial: "O",
  },
];

const WISHLIST_TOTAL = "$21,605";

// -- Metadata -----------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${PROFILE.name}'s Collection — WristList`,
    description: `${PROFILE.archetype}. ${PROFILE.tagline}`,
    openGraph: {
      title: `${PROFILE.name}'s Watch Collection`,
      description: PROFILE.tagline,
      url: `https://wristlist.com/${username}`,
    },
  };
}

// -- Helpers ------------------------------------------------------------

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function padRank(n: number): string {
  return String(n).padStart(2, "0");
}

// -- Page ---------------------------------------------------------------

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // In Phase 1, we ignore the actual username and always show Sameer's data.
  // Future: look up user from DB using `username`.
  const { username } = await params;
  void username;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <Nav />

      {/* Page container */}
      <div className="max-w-[860px] mx-auto px-6 pb-20">
        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent mb-10" />

        {/* ── Profile Hero ────────────────────────────────── */}
        <div className="flex flex-col-reverse items-center text-center sm:flex-row sm:items-start sm:text-left gap-10 mb-12">
          {/* Left column */}
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold mb-2">
              The collection of
            </p>
            <h1 className="text-[42px] font-black tracking-tighter leading-none mb-1">
              {PROFILE.name}
            </h1>
            <p className="text-[13px] text-[rgba(26,24,20,0.35)] mb-4">
              @{PROFILE.handle} &middot; Collecting since {PROFILE.collectingSince}
            </p>

            <p className="font-serif italic text-[20px] font-medium text-[rgba(26,24,20,0.7)] tracking-[-0.3px] mb-1.5">
              {PROFILE.archetype}
            </p>
            <p className="text-[14px] text-[rgba(26,24,20,0.4)] leading-[1.7] max-w-[420px] sm:max-w-[420px] mx-auto sm:mx-0">
              {PROFILE.tagline}
            </p>

            <div className="mt-5 flex justify-center sm:justify-start">
              <DnaTags tags={PROFILE.dnaTags} />
            </div>
          </div>

          {/* Right column — Score */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <ScoreRing score={PROFILE.score} size={120} label="Diversity" />
            <p className="text-[10px] text-[rgba(26,24,20,0.3)] font-medium mt-3">
              {PROFILE.projectedScore} with wishlist
            </p>
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────── */}
        <div className="mb-12">
          <StatsBar stats={PROFILE.stats} />
        </div>

        {/* ── The Collection ──────────────────────────────── */}
        <section className="mb-14">
          <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
            <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
              The Collection
            </h2>
            <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
              {COLLECTION.length} pieces
            </span>
          </div>
          <WatchGrid watches={COLLECTION} />
        </section>

        {/* ── The Wishlist ────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex justify-between items-baseline mb-5 pb-3 border-b border-[rgba(26,24,20,0.06)]">
            <h2 className="text-[12px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-semibold">
              The Wishlist
            </h2>
            <span className="text-[12px] text-[rgba(26,24,20,0.25)] font-medium">
              {WISHLIST.length} pieces &middot; {WISHLIST_TOTAL}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {WISHLIST.map((w) => (
              <div
                key={w.rank}
                className="flex gap-4 items-center px-5 py-4 bg-white border border-[rgba(26,24,20,0.06)] rounded-[18px] cursor-pointer transition-all hover:translate-x-1 hover:border-[rgba(26,24,20,0.1)]"
              >
                {/* Rank */}
                <span className="text-[12px] font-black text-[rgba(26,24,20,0.12)] w-5 text-center flex-shrink-0">
                  {padRank(w.rank)}
                </span>

                {/* Thumbnail */}
                <div
                  className="w-12 h-12 rounded-[14px] flex-shrink-0 flex items-center justify-center font-black text-[18px] text-white/5"
                  style={{ background: w.gradient }}
                >
                  {w.initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-[rgba(26,24,20,0.25)] font-bold">
                    {w.brand}
                  </p>
                  <p className="text-[14px] font-bold tracking-[-0.2px] truncate">
                    {w.model}
                  </p>
                  <p className="text-[11px] text-[rgba(26,24,20,0.35)] mt-0.5">
                    {w.detail}
                  </p>
                </div>

                {/* Price & fills */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-black tracking-[-0.3px]">
                    {formatPrice(w.price)}
                  </p>
                  <p
                    className={`text-[9px] font-bold mt-0.5 ${
                      w.bestValue
                        ? "text-[#6b8f4e]"
                        : "text-[#6b8f4e]"
                    }`}
                  >
                    {w.fills}
                    {w.bestValue && (
                      <span className="text-[#b8860b]"> &middot; Best value</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ──────────────────────────────────── */}
        <section className="mb-4">
          <div className="border border-[rgba(26,24,20,0.06)] rounded-[24px] py-12 px-8 text-center">
            <h2 className="text-[28px] font-light tracking-[-0.5px]">
              <span className="font-serif italic font-medium">
                What&apos;s{" "}
                <span className="text-[#8a7a5a]">your</span>
              </span>{" "}
              collector DNA?
            </h2>
            <p className="text-[13px] text-[rgba(26,24,20,0.4)] mt-3 max-w-md mx-auto leading-relaxed">
              Every collection tells a story. Build yours on WristList and
              discover your diversity score, your blind spots, and what to buy
              next.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-9 py-3.5 bg-[#1a1814] text-[#f6f4ef] text-[12px] font-bold rounded-full hover:translate-y-[-2px] hover:shadow-[0_8px_32px_rgba(26,24,20,0.2)] transition-all tracking-[0.5px]"
            >
              Create Your WristList
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
