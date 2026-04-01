import Link from "next/link";
import { Nav } from "@/components/nav";
import { LiveClock } from "./live-clock";

export default function ClockPage() {
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
            Live Clock
          </p>
          <h1 className="font-serif text-[28px] text-foreground">
            Set Your Watch
          </h1>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-10">
          <LiveClock />
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
