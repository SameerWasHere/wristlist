"use client";

import { SignInButton } from "@clerk/nextjs";

export function CtaBanner() {
  return (
    <section className="max-w-[960px] mx-auto px-4 sm:px-6 pb-16">
      <div className="bg-[#1a1814] rounded-[24px] p-8 sm:p-12 text-center">
        <p className="text-[22px] sm:text-[28px] font-serif italic text-[#f6f4ef]">
          Your watches deserve a better home.
        </p>
        <p className="text-[14px] text-[rgba(246,244,239,0.5)] mt-3 max-w-md mx-auto">
          Track your collection, build your wishlist, and see how your taste stacks up against other collectors.
        </p>
        <SignInButton mode="modal">
          <button className="mt-6 px-8 py-3 bg-[#f6f4ef] text-[#1a1814] text-[14px] font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer">
            Start Your Collection
          </button>
        </SignInButton>
      </div>
    </section>
  );
}
