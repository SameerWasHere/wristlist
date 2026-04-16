"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function Nav() {
  const { isSignedIn, isLoaded } = useUser();
  const [username, setUsername] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch the user's username for profile link
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.username) {
            setUsername(data.user.username);
          }
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  // Close mobile menu on route change (link click)
  const closeMobile = () => setMobileOpen(false);

  const navLinks = (
    <>
      <Link
        href="/#top-lists"
        onClick={closeMobile}
        className="px-3 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
      >
        Top Lists
      </Link>
      <Link
        href="/catalog"
        onClick={closeMobile}
        className="px-3 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
      >
        Catalog
      </Link>
      <Link
        href="/tools"
        onClick={closeMobile}
        className="px-3 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
      >
        Tools
      </Link>

      {isSignedIn && (
        username ? (
          <Link
            href={`/${username}`}
            onClick={closeMobile}
            className="px-3 py-1.5 text-[12px] font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
          >
            My Profile
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-[12px] font-medium text-foreground/20 rounded-full">
            My Profile
          </span>
        )
      )}
    </>
  );

  return (
    <nav className="relative border-b border-[rgba(26,24,20,0.06)] bg-background">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-[15px] font-light tracking-[4px] uppercase text-foreground">
          <strong className="font-bold">WRIST</strong>LIST
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks}
          </div>

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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden ml-2 p-2 rounded-full hover:bg-[rgba(26,24,20,0.04)] transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[rgba(26,24,20,0.06)] px-4 py-3 flex flex-col gap-1 bg-background">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
