/**
 * Clerk server-side stub — used in preview mode when NEXT_PUBLIC_DISABLE_AUTH=1.
 *
 * Matches the shape of @clerk/nextjs/server exports: auth(), currentUser(),
 * clerkMiddleware(). Returns signed-out defaults so API routes and server
 * pages can render as an anonymous visitor.
 */

import type { NextRequest, NextResponse } from "next/server";

// auth() — server-side auth info
export async function auth() {
  return {
    userId: null as string | null,
    sessionId: null as string | null,
    sessionClaims: null,
    actor: null,
    orgId: null as string | null,
    orgRole: null,
    orgSlug: null,
    has: () => false,
    getToken: async () => null,
    redirectToSignIn: () => {
      // No-op in preview mode
    },
  };
}

// currentUser() — server-side current user object
export async function currentUser() {
  return null;
}

// clerkMiddleware() — wraps a middleware handler. In preview mode we just
// return a pass-through that lets every request through untouched.
type MiddlewareHandler = (
  auth: () => Promise<ReturnType<typeof authFnSignature>>,
  req: NextRequest,
) => void | Response | NextResponse | Promise<void | Response | NextResponse>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function authFnSignature() {
  return auth();
}

export function clerkMiddleware(_handler?: MiddlewareHandler) {
  // Return a middleware function that does nothing — Next.js will continue
  // to the matched route as normal.
  return function middleware() {
    return undefined;
  };
}
