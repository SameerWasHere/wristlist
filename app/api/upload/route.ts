import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(
      `watches/${userId}/${Date.now()}-${file.name}`,
      file,
      { access: "public" }
    );

    return NextResponse.json({ url: blob.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Upload failed";

    // If blob storage isn't configured, return a helpful error
    if (message.includes("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json(
        { error: "Image uploads are not configured yet. Please set BLOB_READ_WRITE_TOKEN." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
