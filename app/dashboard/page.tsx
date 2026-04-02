import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export default async function DashboardRedirect() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.clerkId, clerkId)).limit(1);

  if (!user) redirect("/setup");
  redirect(`/${user.username}`);
}
