import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { watchReferences } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const IMAGE_MAP: Record<string, string> = {
  "rolex-submariner-date-126610ln": "/watches/rolex-sub.png",
  "omega-speedmaster-moonwatch-31030425001001": "/watches/omega-speedy.png",
  "tudor-black-bay-58-m79030n": "/watches/tudor-bb58.png",
  "grand-seiko-shunbun-sbga413": "/watches/grand-seiko-shunbun.png",
  "nomos-tangente-2date-135": "/watches/nomos-tangente.png",
  "hamilton-khaki-pilot-day-date-h64615135": "/watches/hamilton-pilot.png",
  "seiko-prospex-alpinist-spb121": "/watches/seiko-alpinist.png",
  "casio-vintage-multiface-a130weg9a": "/watches/casio-vintage.png",
  "oris-pointer-date-436507": "/watches/oris-pointer-date.png",
};

async function updateImages() {
  console.log("Updating watch images...");

  // First let's see what slugs exist
  const all = await db.select({ slug: watchReferences.slug }).from(watchReferences);
  console.log("Existing slugs:", all.map(r => r.slug));

  for (const [slug, imageUrl] of Object.entries(IMAGE_MAP)) {
    const result = await db
      .update(watchReferences)
      .set({ imageUrl })
      .where(eq(watchReferences.slug, slug));
    console.log(`  ${slug} → ${imageUrl}`);
  }

  console.log(`Updated ${Object.keys(IMAGE_MAP).length} watches with images.`);
}

updateImages().catch(console.error);
