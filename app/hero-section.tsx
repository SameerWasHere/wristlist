"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface HeroSectionProps {
  profileUrl?: string;
}

export function HeroSection({ profileUrl = "/dashboard" }: HeroSectionProps) {
  const { isSignedIn } = useUser();

  return (
    <section className="max-w-[960px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
      <h1 className="text-[36px] sm:text-[56px] font-light tracking-[6px] uppercase text-foreground leading-tight">
        <strong className="font-bold">WRIST</strong>LIST
      </h1>
      <p className="text-[17px] sm:text-[20px] font-serif italic text-[rgba(26,24,20,0.4)] mt-4">
        Every collection tells a story. What&apos;s yours?
      </p>
      {isSignedIn ? (
        <Link
          href={profileUrl}
          className="inline-block mt-8 px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          View Your Profile
        </Link>
      ) : (
        <SignInButton mode="modal">
          <button className="mt-8 px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer">
            Start Your Collection
          </button>
        </SignInButton>
      )}
    </section>
  );
}
