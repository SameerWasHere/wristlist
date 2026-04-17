/**
 * Clerk server-side stub — used in preview mode when NEXT_PUBLIC_DISABLE_AUTH=1.
 *
 * Matches the shape of @clerk/nextjs/server exports: auth(), currentUser(),
 * clerkMiddleware(). Returns signed-out defaults by default.
 *
 * If NEXT_PUBLIC_DEV_USER_USERNAME is set, the stub impersonates that user
 * by looking up their real Clerk ID in the database. API routes and server
 * pages then behave as if that user is signed in. This gives the Claude
 * Preview a way to browse signed-in views (your profile, add-watch flow, etc.)
 */

import type { NextRequest, NextResponse } from "next/server";

const DEV_USER_USERNAME = process.env.NEXT_PUBLIC_DEV_USER_USERNAME;

let cachedDevClerkId: string | null | undefined;

async function resolveDevClerkId(): Promise<string | null> {
  if (!DEV_USER_USERNAME) return null;
  if (cachedDevClerkId !== undefined) return cachedDevClerkId;

  try {
    const { getDb, schema } = await import("@/lib/db");
    const { eq } = await import("drizzle-orm");
    const db = getDb();
    const [user] = await db
      .select({ clerkId: schema.users.clerkId })
      .from(schema.users)
      .where(eq(schema.users.username, DEV_USER_USERNAME))
      .limit(1);
    cachedDevClerkId = user?.clerkId ?? null;
    if (cachedDevClerkId === null) {
      // eslint-disable-next-line no-console
      console.warn(
        `[preview] NEXT_PUBLIC_DEV_USER_USERNAME="${DEV_USER_USERNAME}" not found in DB — staying signed out`,
      );
    }
  } catch {
    cachedDevClerkId = null;
  }
  return cachedDevClerkId;
}

// auth() — server-side auth info
export async function auth() {
  const userId = await resolveDevClerkId();
  return {
    userId,
    sessionId: userId ? "preview-session" : null,
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
  const userId = await resolveDevClerkId();
  if (!userId) return null;
  return {
    id: userId,
    username: DEV_USER_USERNAME ?? null,
    firstName: null,
    lastName: null,
    fullName: DEV_USER_USERNAME ?? null,
    emailAddresses: [],
    primaryEmailAddress: null,
    imageUrl: "",
  };
}

// clerkMiddleware() — pass-through middleware
type MiddlewareHandler = (
  auth: () => Promise<ReturnType<typeof authFnSignature>>,
  req: NextRequest,
) => void | Response | NextResponse | Promise<void | Response | NextResponse>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function authFnSignature() {
  return auth();
}

export function clerkMiddleware(_handler?: MiddlewareHandler) {
  return function middleware() {
    return undefined;
  };
}
