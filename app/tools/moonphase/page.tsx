import Link from "next/link";
import { Nav } from "@/components/nav";

// Moon phase calculation using synodic month from known new moon (Jan 6, 2000 18:14 UTC)
const SYNODIC_MONTH = 29.53059;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0) / 86400000; // days since epoch

function getMoonData(date: Date) {
  const daysSinceEpoch = date.getTime() / 86400000;
  const daysSinceNewMoon = daysSinceEpoch - KNOWN_NEW_MOON;
  const currentCycle = daysSinceNewMoon / SYNODIC_MONTH;
  const phase = currentCycle - Math.floor(currentCycle); // 0 to 1

  // Phase name
  let phaseName: string;
  if (phase < 0.0625) phaseName = "New Moon";
  else if (phase < 0.1875) phaseName = "Waxing Crescent";
  else if (phase < 0.3125) phaseName = "First Quarter";
  else if (phase < 0.4375) phaseName = "Waxing Gibbous";
  else if (phase < 0.5625) phaseName = "Full Moon";
  else if (phase < 0.6875) phaseName = "Waning Gibbous";
  else if (phase < 0.8125) phaseName = "Last Quarter";
  else if (phase < 0.9375) phaseName = "Waning Crescent";
  else phaseName = "New Moon";

  // Illumination: 0 at new moon, 1 at full moon
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase)) / 2 * 100);

  // Next new moon and full moon
  const daysIntoCurrentCycle = phase * SYNODIC_MONTH;
  const daysToNextNewMoon = SYNODIC_MONTH - daysIntoCurrentCycle;
  const daysToNextFullMoon = phase < 0.5
    ? (0.5 - phase) * SYNODIC_MONTH
    : (1.5 - phase) * SYNODIC_MONTH;

  const nextNewMoon = new Date(date.getTime() + daysToNextNewMoon * 86400000);
  const nextFullMoon = new Date(date.getTime() + daysToNextFullMoon * 86400000);

  return { phase, phaseName, illumination, nextNewMoon, nextFullMoon };
}

function MoonVisual({ phase }: { phase: number }) {
  // SVG moon with shadow overlay
  // Phase 0 = new (dark), 0.5 = full (bright)
  // We create a circle and overlay a shadow shape
  const isWaxing = phase < 0.5;
  const normalizedPhase = isWaxing ? phase * 2 : (phase - 0.5) * 2; // 0 to 1

  // The terminator x-offset: goes from edge to center to opposite edge
  // For waxing: shadow is on the right, shrinking left
  // For waning: shadow grows from the right
  const curveX = isWaxing
    ? 50 - normalizedPhase * 100 // 50 -> -50
    : -50 + normalizedPhase * 100; // -50 -> 50

  return (
    <div className="flex justify-center">
      <svg width="180" height="180" viewBox="0 0 200 200">
        {/* Moon body - bright */}
        <circle cx="100" cy="100" r="90" fill="#f5f0e3" stroke="rgba(26,24,20,0.08)" strokeWidth="1" />
        {/* Subtle texture */}
        <circle cx="70" cy="80" r="12" fill="rgba(26,24,20,0.03)" />
        <circle cx="120" cy="65" r="8" fill="rgba(26,24,20,0.03)" />
        <circle cx="100" cy="120" r="15" fill="rgba(26,24,20,0.03)" />
        <circle cx="135" cy="110" r="6" fill="rgba(26,24,20,0.03)" />
        {/* Shadow overlay */}
        <clipPath id="moonClip">
          <circle cx="100" cy="100" r="90" />
        </clipPath>
        <g clipPath="url(#moonClip)">
          {isWaxing ? (
            // Waxing: shadow on left side, shrinking
            <path
              d={`M 100 10 A 90 90 0 0 0 100 190 A ${curveX} 90 0 0 ${normalizedPhase > 0.5 ? 0 : 1} 100 10`}
              fill="rgba(26,24,20,0.85)"
            />
          ) : (
            // Waning: shadow on right side, growing
            <path
              d={`M 100 10 A 90 90 0 0 1 100 190 A ${curveX} 90 0 0 ${normalizedPhase > 0.5 ? 1 : 0} 100 10`}
              fill="rgba(26,24,20,0.85)"
            />
          )}
        </g>
      </svg>
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MoonPhasePage() {
  const now = new Date();
  const { phase, phaseName, illumination, nextNewMoon, nextFullMoon } = getMoonData(now);

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <Nav />

      <div className="max-w-[640px] mx-auto px-6 py-16">
        <Link
          href="/tools"
          className="text-[12px] text-[#8a7a5a] hover:text-[#6b5b3a] transition-colors"
        >
          &larr; Back to Tools
        </Link>

        <div className="mt-8 mb-12">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-2">
            Moon Phase
          </p>
          <h1 className="font-serif text-[28px] text-foreground">
            Lunar Calendar
          </h1>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-10">
          {/* Moon visual */}
          <MoonVisual phase={phase} />

          {/* Phase name */}
          <div className="text-center mt-8">
            <h2 className="font-serif text-[28px] text-foreground">{phaseName}</h2>
            <p className="text-[14px] text-[rgba(26,24,20,0.4)] mt-1">
              {illumination}% illuminated
            </p>
          </div>

          {/* Details */}
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-1">
                Next Full Moon
              </p>
              <p className="text-[14px] font-medium text-foreground">
                {formatDate(nextFullMoon)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-1">
                Next New Moon
              </p>
              <p className="text-[14px] font-medium text-foreground">
                {formatDate(nextNewMoon)}
              </p>
            </div>
          </div>

          <p className="mt-10 text-[12px] text-[rgba(26,24,20,0.25)] leading-relaxed text-center max-w-[400px] mx-auto">
            Use this to align your moonphase complication. The synodic month averages 29.53 days -- most mechanical moonphase displays need correction every 2.5 years.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-3">
            Go Further
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-[13px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity"
          >
            Track your watches on WristList
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(26,24,20,0.06)] py-12">
        <div className="max-w-[960px] mx-auto px-6 text-center">
          <p className="text-[15px] font-light tracking-[4px] uppercase text-foreground">
            <strong className="font-bold">WRIST</strong>LIST
          </p>
          <p className="text-[14px] font-serif italic text-[rgba(26,24,20,0.3)] mt-2">
            Every collection tells a story.
          </p>
        </div>
      </footer>
    </div>
  );
}
