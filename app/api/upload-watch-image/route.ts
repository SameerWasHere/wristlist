import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const referenceId = formData.get("referenceId") as string | null;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
  }

  try {
    // Step 1: Send to remove.bg
    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    let processedImage: Blob;
    let didProcess = false;

    if (removeBgKey) {
      const rbFormData = new FormData();
      rbFormData.append("image_file", file);
      rbFormData.append("size", "auto");
      rbFormData.append("type", "product");

      const rbResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": removeBgKey },
        body: rbFormData,
      });

      if (!rbResponse.ok) {
        // Fallback: store original if remove.bg fails (rate limit, etc.)
        console.error("remove.bg error:", rbResponse.status);
        processedImage = file;
      } else {
        processedImage = await rbResponse.blob();
        didProcess = true;
      }
    } else {
      // No API key -- store original
      processedImage = file;
    }

    // Step 2: Upload to Vercel Blob
    const filename = `catalog/${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}.png`;
    const blob = await put(filename, processedImage, { access: "public" });

    // Step 3: Optionally update the watch reference + log the edit
    if (referenceId) {
      const db = getDb();
      const refId = parseInt(referenceId);

      // Look up user ID from clerk ID
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkId))
        .limit(1);

      // Get old image URL for edit log
      const [ref] = await db
        .select({ imageUrl: schema.watchReferences.imageUrl })
        .from(schema.watchReferences)
        .where(eq(schema.watchReferences.id, refId))
        .limit(1);

      // Update the reference
      await db
        .update(schema.watchReferences)
        .set({
          imageUrl: blob.url,
          updatedAt: new Date(),
          updatedBy: user?.id ?? null,
          editCount: sql`${schema.watchReferences.editCount} + 1`,
        })
        .where(eq(schema.watchReferences.id, refId));

      // Log to catalogEdits
      if (user) {
        await db.insert(schema.catalogEdits).values({
          userId: user.id,
          targetType: "reference",
          targetId: refId,
          action: "add_image",
          fieldChanged: "imageUrl",
          oldValue: ref?.imageUrl ?? null,
          newValue: blob.url,
        });
      }
    }

    return NextResponse.json({ url: blob.url, processed: didProcess });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";

    if (message.includes("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json(
        { error: "Image uploads are not configured yet. Please set BLOB_READ_WRITE_TOKEN." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
