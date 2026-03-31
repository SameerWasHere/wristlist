"use client";

import { WatchSearch } from "@/components/watch-search";

export function HeroSection() {
  return (
    <section className="max-w-[960px] mx-auto px-6 pt-20 pb-16 text-center">
      <h1 className="text-[44px] font-light tracking-tight text-foreground leading-tight">
        What&apos;s on your{" "}
        <span className="font-serif italic font-medium text-[56px] text-[#8a7a5a] relative inline-block">
          wrist
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8a7a5a] to-transparent opacity-40" />
        </span>
        <span className="font-serif italic font-medium text-[56px] text-[#8a7a5a]">?</span>
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
