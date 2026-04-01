"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function Nav() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-[rgba(26,24,20,0.06)] bg-background">
      {/* Logo */}
      <Link href="/" className="text-[15px] font-light tracking-[4px] uppercase text-foreground">
        <strong className="font-bold">WRIST</strong>LIST
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Link
          href="/#top-lists"
          className="px-4 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
        >
          Top Lists
        </Link>
        <Link
          href="/#collectors"
          className="px-4 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
        >
          Collectors
        </Link>
        <Link
          href="/#tools"
          className="px-4 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
        >
          Tools
        </Link>

        {isSignedIn && (
          <Link
            href="/dashboard"
            className="px-4 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
          >
            Dashboard
          </Link>
        )}

        {/* Auth */}
        {isLoaded && (
          isSignedIn ? (
            <div className="ml-2">
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="ml-2 px-5 py-2 text-[12px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </SignInButton>
          )
        )}
      </div>
    </nav>
  );
}
