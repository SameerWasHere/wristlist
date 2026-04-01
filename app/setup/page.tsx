import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Nav } from "@/components/nav";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  // Check if user already has a username set up
  const db = getDb();
  const [existingUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (existingUser) {
    // Already set up — go to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-[440px] mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-light tracking-tight mb-2">
            Welcome to{" "}
            <strong className="font-bold">WRIST</strong>
            <span className="font-light">LIST</span>
          </h1>
          <p className="text-[14px] text-[rgba(26,24,20,0.4)]">
            Pick a username for your public collection profile.
          </p>
        </div>

        <SetupForm />
      </div>
    </div>
  );
}
