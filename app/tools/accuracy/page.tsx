import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { AccuracyTimer } from "./accuracy-timer";

export default function AccuracyPage() {
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
            Accuracy Logger
          </p>
          <h1 className="font-serif text-[28px] text-foreground">
            Measure Your Drift
          </h1>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-8 mb-8">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(26,24,20,0.3)] font-medium mb-4">
            How It Works
          </p>
          <ol className="space-y-4 text-[14px] text-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center text-[12px] font-bold text-[rgba(26,24,20,0.3)]">
                1
              </span>
              <span>
                Set your watch&apos;s second hand to match the reference seconds display below.
                Start the timer at the same moment.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center text-[12px] font-bold text-[rgba(26,24,20,0.3)]">
                2
              </span>
              <span>
                Wait at least 24 hours. The longer you wait, the more accurate your measurement.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(26,24,20,0.06)] flex items-center justify-center text-[12px] font-bold text-[rgba(26,24,20,0.3)]">
                3
              </span>
              <span>
                Come back and compare your watch&apos;s second hand to the reference display. The
                difference is your daily drift.
              </span>
            </li>
          </ol>
          <div className="mt-6 p-4 rounded-lg bg-[rgba(138,122,90,0.06)]">
            <p className="text-[13px] text-[rgba(26,24,20,0.5)] leading-relaxed">
              <strong className="text-foreground">What&apos;s good?</strong> COSC-certified
              chronometers run within -4/+6 seconds per day. Most mechanical watches are within
              +/-15 seconds. Quartz watches drift less than 1 second per day.
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(26,24,20,0.04)] border border-[rgba(26,24,20,0.06)] p-10">
          <AccuracyTimer />
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

      <Footer />
    </div>
  );
}
