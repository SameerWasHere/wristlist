import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();

  const body = await request.json();
  const { brand, model, reference } = body;

  if (!brand || !model) {
    return NextResponse.json(
      { error: "brand and model are required" },
      { status: 400 },
    );
  }

  const db = getDb();

  const [entry] = await db
    .insert(schema.watchRequests)
    .values({
      requestedBy: clerkId ?? null,
      brand,
      model,
      reference: reference ?? null,
    })
    .returning();

  return NextResponse.json({ request: entry }, { status: 201 });
}
