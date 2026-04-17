"use client";

/**
 * Clerk client-side stub — used in preview mode when NEXT_PUBLIC_DISABLE_AUTH=1.
 *
 * Replaces every export that the codebase imports from "@clerk/nextjs" with a
 * no-op signed-out version. This lets the site render in Claude Preview without
 * the cross-origin script injection that Clerk dev does to accounts.dev.
 *
 * Production (real Clerk) is unchanged — the alias only applies when the env
 * flag is set, which lives only in .env.local.
 */

import type { ReactNode, MouseEventHandler } from "react";

// When NEXT_PUBLIC_DEV_USER_USERNAME is set, the client acts as if that user
// is signed in. The actual user record is resolved server-side by the server
// stub, which looks up the real Clerk ID by username in the DB.
const DEV_USER_USERNAME = process.env.NEXT_PUBLIC_DEV_USER_USERNAME;
const IS_DEV_SIGNED_IN = !!DEV_USER_USERNAME;

// --- Context providers --------------------------------------------------

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// --- Auth hooks ---------------------------------------------------------

export function useUser() {
  return {
    isSignedIn: IS_DEV_SIGNED_IN,
    isLoaded: true,
    user: IS_DEV_SIGNED_IN
      ? {
          id: `preview-${DEV_USER_USERNAME}`,
          username: DEV_USER_USERNAME ?? null,
          firstName: null,
          lastName: null,
          fullName: DEV_USER_USERNAME ?? null,
          primaryEmailAddress: null,
          imageUrl: "",
        }
      : null,
  };
}

export function useAuth() {
  return {
    isSignedIn: IS_DEV_SIGNED_IN,
    isLoaded: true,
    userId: IS_DEV_SIGNED_IN ? `preview-${DEV_USER_USERNAME}` : null,
    sessionId: IS_DEV_SIGNED_IN ? "preview-session" : null,
    getToken: async () => null,
    signOut: async () => {},
  };
}

export function useClerk() {
  return {
    openSignIn: () => {
      // eslint-disable-next-line no-console
      console.info("[preview] openSignIn called — auth is disabled");
    },
    openSignUp: () => {
      // eslint-disable-next-line no-console
      console.info("[preview] openSignUp called — auth is disabled");
    },
    signOut: async () => {},
    user: null,
    session: null,
  };
}

// --- Visibility gates ---------------------------------------------------

export function SignedIn() {
  return null;
}

export function SignedOut({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

// --- Button wrappers ----------------------------------------------------

interface SignInButtonProps {
  children?: ReactNode;
  mode?: "modal" | "redirect";
  forceRedirectUrl?: string;
  fallbackRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
}

export function SignInButton({ children }: SignInButtonProps) {
  // Clerk's SignInButton wraps children with click handler. We pass children
  // through unchanged — clicks become no-ops (or whatever the child does).
  const handleClick: MouseEventHandler = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.info("[preview] sign in clicked — auth is disabled");
  };

  if (!children) {
    return (
      <button
        onClick={handleClick}
        className="px-5 py-2 text-[12px] font-semibold bg-[#1a1814] text-[#f6f4ef] rounded-full"
      >
        Sign In
      </button>
    );
  }

  return <span onClick={handleClick}>{children}</span>;
}

export function SignUpButton({ children }: SignInButtonProps) {
  return <SignInButton>{children}</SignInButton>;
}

export function UserButton() {
  if (!IS_DEV_SIGNED_IN) return null;
  const initial = (DEV_USER_USERNAME ?? "?").charAt(0).toUpperCase();
  return (
    <div
      title={`Previewing as @${DEV_USER_USERNAME}`}
      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a7a5a] to-[#6b5b3a] flex items-center justify-center text-white text-[13px] font-bold cursor-default select-none"
    >
      {initial}
    </div>
  );
}

// --- Full-page components ----------------------------------------------

export function SignIn() {
  return (
    <div className="max-w-md mx-auto mt-16 px-6 py-10 bg-white rounded-[16px] border border-[rgba(26,24,20,0.08)] text-center">
      <p className="text-[15px] font-serif italic text-[rgba(26,24,20,0.5)] mb-3">
        Auth is disabled in preview
      </p>
      <p className="text-[13px] text-[rgba(26,24,20,0.35)]">
        You&apos;re browsing as a signed-out visitor. Deploy to see the real sign-in flow.
      </p>
    </div>
  );
}

export function SignUp() {
  return <SignIn />;
}
