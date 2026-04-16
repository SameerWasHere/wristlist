"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { HeroSearch } from "./hero-search";

interface HeroSectionProps {
  profileUrl?: string;
  stats?: { watches: number; brands: number; collectors: number };
}

export function HeroSection({ profileUrl = "/dashboard", stats }: HeroSectionProps) {
  const { isSignedIn } = useUser();

  return (
    <section className="max-w-[960px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
      <h1 className="text-[36px] sm:text-[56px] font-light tracking-[6px] uppercase text-foreground leading-tight">
        <strong className="font-bold">WRIST</strong>LIST
      </h1>
      <p className="text-[17px] sm:text-[20px] font-serif italic text-[rgba(26,24,20,0.4)] mt-4">
        Every collection tells a story. What&apos;s yours?
      </p>
      <p className="text-[14px] text-[rgba(26,24,20,0.35)] mt-3 max-w-md mx-auto">
        Track your watches. Build your wishlist. See how your taste compares.
      </p>

      {/* Search bar */}
      <HeroSearch />

      {/* Live stats */}
      {stats && (stats.watches > 0 || stats.collectors > 0) && (
        <div className="flex items-center justify-center gap-6 mt-6">
          {stats.watches > 0 && (
            <div>
              <p className="text-[20px] font-bold text-[#1a1814]">{stats.watches.toLocaleString()}+</p>
              <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)]">Watches</p>
            </div>
          )}
          {stats.brands > 0 && (
            <>
              <div className="w-px h-8 bg-[rgba(26,24,20,0.08)]" />
              <div>
                <p className="text-[20px] font-bold text-[#1a1814]">{stats.brands}+</p>
                <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)]">Brands</p>
              </div>
            </>
          )}
          {stats.collectors > 0 && (
            <>
              <div className="w-px h-8 bg-[rgba(26,24,20,0.08)]" />
              <div>
                <p className="text-[20px] font-bold text-[#1a1814]">{stats.collectors}</p>
                <p className="text-[10px] uppercase tracking-[2px] text-[rgba(26,24,20,0.3)]">Collectors</p>
              </div>
            </>
          )}
        </div>
      )}

      {isSignedIn ? (
        <Link
          href={profileUrl}
          className="inline-block mt-8 px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          View Your Profile
        </Link>
      ) : (
        <div className="flex items-center justify-center gap-3 mt-8">
          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer">
              Start Your Collection
            </button>
          </SignInButton>
          <Link
            href="/catalog"
            className="px-6 py-3 text-[14px] font-medium text-[rgba(26,24,20,0.5)] border border-[rgba(26,24,20,0.12)] rounded-full hover:border-[rgba(26,24,20,0.25)] transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </section>
  );
}
