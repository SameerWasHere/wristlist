"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function CtaBanner() {
  const { isSignedIn } = useUser();

  return (
    <div className="border border-[rgba(26,24,20,0.06)] rounded-[20px] py-12 px-8 text-center">
      <h2 className="text-[28px] font-bold text-foreground leading-tight">
        What&apos;s <span className="font-serif italic text-[#8a7a5a]">your</span> collector DNA?
      </h2>
      <p className="text-[15px] text-[rgba(26,24,20,0.4)] mt-3 max-w-md mx-auto">
        Add your watches and discover your unique collector profile, diversity score, and personalized recommendations.
      </p>
      {isSignedIn ? (
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </Link>
      ) : (
        <SignInButton mode="modal">
          <button className="mt-6 px-8 py-3 bg-[#1a1814] text-[#f6f4ef] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity">
            Start Your Collection
          </button>
        </SignInButton>
      )}
    </div>
  );
}
