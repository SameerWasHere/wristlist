"use client";

import { WatchSearch } from "@/components/watch-search";

export function HeroSection() {
  return (
    <section className="max-w-[960px] mx-auto px-6 pt-20 pb-16 text-center">
      <h1 className="text-[48px] font-bold text-foreground leading-tight">
        What&apos;s on your <span className="font-serif italic">wrist?</span>
      </h1>
      <p className="text-[17px] text-[rgba(26,24,20,0.45)] mt-4 max-w-lg mx-auto leading-relaxed">
        Catalog your collection, discover your collector DNA, and connect with
        enthusiasts who share your taste.
      </p>
      <div className="mt-8">
        <WatchSearch />
      </div>
    </section>
  );
}
