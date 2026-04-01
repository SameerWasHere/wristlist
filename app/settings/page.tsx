import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { Nav } from "@/components/nav";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (!user) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-[480px] mx-auto px-4 sm:px-6 pt-12 pb-20">
        <h1 className="text-[24px] font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-[13px] text-[rgba(26,24,20,0.4)] mb-8">
          Manage your WristList profile.
        </p>

        <SettingsForm
          currentUsername={user.username}
          currentDisplayName={user.displayName || user.username}
          currentBio={user.bio || ""}
          currentCollectingSince={user.collectingSince || undefined}
        />

        <div className="mt-12 pt-8 border-t border-[rgba(26,24,20,0.06)]">
          <p className="text-[11px] text-[rgba(26,24,20,0.25)]">
            Your profile is public at{" "}
            <span className="font-medium text-[#8a7a5a]">wristlist.com/{user.username}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
