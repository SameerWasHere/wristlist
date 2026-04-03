/**
 * Adds missing popular/collected watches identified through research.
 * Run with: npx tsx lib/db/seed-popular-2.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchFamilies, watchReferences, users } from "./schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Variation {
  reference: string;
  sizeMm: number;
  movement: string;
  material: string;
  color: string;
  category: string;
  braceletType: string;
  shape: string;
  waterResistanceM: number;
  crystal: string;
  caseBack: string;
  origin: string;
  lugWidthMm: number;
  complications: string[];
  retailPrice: number;
  description: string;
}

interface WatchSeed {
  brand: string;
  model: string;
  variations: Variation[];
}

const WATCHES: WatchSeed[] = [
  // ===========================================================================
  // ROLEX — major missing models
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Oyster Perpetual 41",
    variations: [
      {
        reference: "124300",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 6500,
        description: "Time-only Rolex in its purest form. Calibre 3230, 70-hour power reserve. No date, no bezel.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "GMT-Master II Root Beer",
    variations: [
      {
        reference: "126711CHNR",
        sizeMm: 40,
        movement: "automatic",
        material: "rose gold",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 16800,
        description: "Everose/steel two-tone Root Beer. Brown and black Cerachrom bezel. Calibre 3285.",
      },
    ],
  },

  // ===========================================================================
  // PATEK PHILIPPE
  // ===========================================================================
  {
    brand: "Patek Philippe",
    model: "Aquanaut Travel Time",
    variations: [
      {
        reference: "5164A-001",
        sizeMm: 40.8,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date", "GMT", "day/night indicator"],
        retailPrice: 52950,
        description: "Aquanaut with dual time zone. Calibre 324 S C FUS, composite strap. Home and local time.",
      },
    ],
  },

  // ===========================================================================
  // CARTIER — the hot brand of 2024-2025
  // ===========================================================================
  {
    brand: "Cartier",
    model: "Tank Americaine",
    variations: [
      {
        reference: "WSTA0082",
        sizeMm: 44.6,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 8500,
        description: "Relaunched 2024 to massive demand. Curved rectangular case, automatic 1847 MC.",
      },
    ],
  },
  {
    brand: "Cartier",
    model: "Santos-Dumont",
    variations: [
      {
        reference: "WSSA0032",
        sizeMm: 43.5,
        movement: "manual wind",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "square",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 4700,
        description: "Ultra-thin Santos variant. Hand-wound 430 MC calibre. Beaded crown with blue spinel.",
      },
    ],
  },
  {
    brand: "Cartier",
    model: "Tank Louis Cartier",
    variations: [
      {
        reference: "W1529756",
        sizeMm: 33.7,
        movement: "manual wind",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 16,
        complications: [],
        retailPrice: 15600,
        description: "The original Tank in yellow gold. Calibre 8971 MC hand-wound. Blue cabochon crown.",
      },
    ],
  },

  // ===========================================================================
  // OMEGA
  // ===========================================================================
  {
    brand: "Omega",
    model: "Seamaster Aqua Terra 150M",
    variations: [
      {
        reference: "220.10.41.21.03.001",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5800,
        description: "Horizontal teak dial. Co-Axial Master Chronometer 8900, 55-hour reserve. True strap monster.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR — major missing models
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay 54",
    variations: [
      {
        reference: "M79000N-0001",
        sizeMm: 37,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 3550,
        description: "37mm vintage-proportioned diver inspired by Tudor 7922. MT5400 in-house, 70-hour reserve.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Black Bay 58 GMT",
    variations: [
      {
        reference: "M79830RB-0011",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 4375,
        description: "Burgundy and blue bezel GMT in 39mm BB58 proportions. MT5652, 70-hour reserve.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Pelagos FXD",
    variations: [
      {
        reference: "M25707N/8N-0001",
        sizeMm: 42,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "diver",
        braceletType: "textile strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: [],
        retailPrice: 4100,
        description: "Fixed-bar military diver. Titanium case, no date. MT5602, 70-hour reserve. Marine Nationale heritage.",
      },
    ],
  },

  // ===========================================================================
  // IWC — Ingenieur relaunch
  // ===========================================================================
  {
    brand: "IWC",
    model: "Ingenieur Automatic 40",
    variations: [
      {
        reference: "IW328902",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 10900,
        description: "Relaunched 2023 Genta design. Integrated bracelet, Calibre 32111, 72-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // LONGINES — Spirit Zulu Time is THE affordable GMT
  // ===========================================================================
  {
    brand: "Longines",
    model: "Spirit Zulu Time",
    variations: [
      {
        reference: "L3.812.4.53.6",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "GMT"],
        retailPrice: 2875,
        description: "True GMT with independently adjustable hour hand. L844.4 COSC-certified, 72-hour reserve.",
      },
      {
        reference: "L3.812.4.63.6",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "GMT"],
        retailPrice: 2875,
        description: "Blue dial Spirit Zulu Time. COSC-certified true GMT with flyer hand. Blue/cream dual bezel.",
      },
    ],
  },

  // ===========================================================================
  // GRAND SEIKO — missing the Shunbun
  // ===========================================================================
  {
    brand: "Grand Seiko",
    model: "Shunbun",
    variations: [
      {
        reference: "SBGA413",
        sizeMm: 40,
        movement: "spring drive",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 19,
        complications: ["date", "power reserve indicator"],
        retailPrice: 5800,
        description: "Cherry blossom pink dial inspired by spring. Spring Drive 9R65, 72-hour reserve.",
      },
    ],
  },
  {
    brand: "Grand Seiko",
    model: "White Birch Spring Drive",
    variations: [
      {
        reference: "SLGA009",
        sizeMm: 40,
        movement: "spring drive",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "power reserve indicator"],
        retailPrice: 9100,
        description: "White birch texture dial with Spring Drive 9RA2. 120-hour power reserve. Evolution 9 case.",
      },
    ],
  },

  // ===========================================================================
  // SEIKO — missing popular models
  // ===========================================================================
  {
    brand: "Seiko",
    model: "5 Sports Field",
    variations: [
      {
        reference: "SRPD55",
        sizeMm: 42.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 275,
        description: "The world's most popular modding platform. 4R36 automatic, 41-hour reserve. Gateway to the hobby.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "King Seiko",
    variations: [
      {
        reference: "SPB279",
        sizeMm: 37,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 19,
        complications: ["date"],
        retailPrice: 1450,
        description: "Reissued heritage line. 37mm grammar of design case. 6R55 with 70-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // CITIZEN — Series 8
  // ===========================================================================
  {
    brand: "Citizen",
    model: "Series 8",
    variations: [
      {
        reference: "NA1004-87E",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 550,
        description: "Citizen's integrated bracelet challenger. Calibre 0950 automatic, 60-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // CASIO — Metal CasiOak
  // ===========================================================================
  {
    brand: "Casio",
    model: "G-Shock Metal CasiOak",
    variations: [
      {
        reference: "GM2100-1A",
        sizeMm: 44.4,
        movement: "quartz",
        material: "stainless steel",
        color: "black",
        category: "digital",
        braceletType: "resin strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["world time", "alarm", "chronograph"],
        retailPrice: 200,
        description: "Metal-clad CasiOak. Stainless steel bezel on resin case. Analog-digital display.",
      },
    ],
  },

  // ===========================================================================
  // JUNGHANS — Max Bill is the iconic one
  // ===========================================================================
  {
    brand: "Junghans",
    model: "Max Bill Automatic",
    variations: [
      {
        reference: "027/3501.04",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1050,
        description: "THE Bauhaus watch. Designed by Max Bill for Ulm School. J800.1 automatic, domed acrylic crystal.",
      },
    ],
  },
  {
    brand: "Junghans",
    model: "Max Bill Chronoscope",
    variations: [
      {
        reference: "027/4003.04",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["chronograph", "date"],
        retailPrice: 2350,
        description: "Bauhaus chronograph. J880.2 automatic, 48-hour reserve. Domed acrylic crystal.",
      },
    ],
  },

  // ===========================================================================
  // TISSOT — PRX Chronograph
  // ===========================================================================
  {
    brand: "Tissot",
    model: "PRX Chronograph",
    variations: [
      {
        reference: "T137.427.11.011.00",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 1450,
        description: "Integrated bracelet chronograph. Valjoux A05.H31, 60-hour reserve. Massive hype release.",
      },
    ],
  },

  // ===========================================================================
  // HAMILTON — Khaki Field Titanium
  // ===========================================================================
  {
    brand: "Hamilton",
    model: "Khaki Field Titanium",
    variations: [
      {
        reference: "H70215130",
        sizeMm: 38,
        movement: "automatic",
        material: "titanium",
        color: "green",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 895,
        description: "Titanium Khaki Field. H-10 automatic, 80-hour reserve. Light and tough.",
      },
    ],
  },

  // ===========================================================================
  // SINN — 903
  // ===========================================================================
  {
    brand: "Sinn",
    model: "903 St",
    variations: [
      {
        reference: "903.040",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 2890,
        description: "Navigation chronograph with slide rule bezel. Valjoux 7750 base. Navitimer alternative.",
      },
    ],
  },

  // ===========================================================================
  // ORIS — smaller Aquis
  // ===========================================================================
  {
    brand: "Oris",
    model: "Aquis Date 39.5",
    variations: [
      {
        reference: "01 733 7732 4135",
        sizeMm: 39.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 19,
        complications: ["date"],
        retailPrice: 2250,
        description: "Downsized Aquis in the size everyone wanted. Calibre 733 (SW200), 38-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // NOMOS — Club Sport Neomatik
  // ===========================================================================
  {
    brand: "Nomos",
    model: "Club Sport Neomatik",
    variations: [
      {
        reference: "781",
        sizeMm: 37,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "field",
        braceletType: "textile strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 18,
        complications: ["date"],
        retailPrice: 2680,
        description: "Sporty Club with neomatik DUW 6101 automatic. 42-hour reserve. Textile strap.",
      },
    ],
  },

  // ===========================================================================
  // MICROBRANDS — popular ones missing
  // ===========================================================================
  {
    brand: "Furlan Marri",
    model: "Rivanera",
    variations: [
      {
        reference: "FM-RIV-01",
        sizeMm: 38,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph"],
        retailPrice: 540,
        description: "GPHG prize-winning microbrand. Mecaquartz chronograph, bicompax layout. Instant sellouts.",
      },
    ],
  },
  {
    brand: "Kurono Tokyo",
    model: "Bunkyoku",
    variations: [
      {
        reference: "BUNKYOKU-01",
        sizeMm: 37,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 19,
        complications: [],
        retailPrice: 1370,
        description: "Hajime Asaoka's accessible brand. Grand Feu enamel dial, Miyota 90S5 automatic.",
      },
    ],
  },
  {
    brand: "Archimede",
    model: "Pilot 39",
    variations: [
      {
        reference: "UA7969-A2.1",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 890,
        description: "German-made flieger with ICKLER case. SW200 automatic. Type B dial option available.",
      },
    ],
  },
];

async function seed() {
  const [sameer] = await db
    .select()
    .from(users)
    .where(eq(users.username, "sameer"))
    .limit(1);

  if (!sameer) {
    console.log("Error: No 'sameer' user found.");
    return;
  }

  console.log(`Attributing to @${sameer.username} (id: ${sameer.id})`);
  console.log(`Seeding ${WATCHES.length} watch families...\n`);

  let familiesCreated = 0;
  let referencesCreated = 0;
  let skipped = 0;

  for (const watch of WATCHES) {
    const familySlug = slugify(`${watch.brand}-${watch.model}`);

    const [family] = await db
      .insert(watchFamilies)
      .values({ slug: familySlug, brand: watch.brand, model: watch.model })
      .onConflictDoNothing()
      .returning();

    const familyId =
      family?.id ||
      (await db.select().from(watchFamilies).where(eq(watchFamilies.slug, familySlug)).limit(1))[0]?.id;

    if (!familyId) {
      console.log(`  SKIP: Could not get familyId for ${watch.brand} ${watch.model}`);
      continue;
    }

    if (family) familiesCreated++;

    for (const v of watch.variations) {
      const refSlug = slugify(`${watch.brand}-${watch.model}-${v.reference}`);
      const result = await db
        .insert(watchReferences)
        .values({
          slug: refSlug,
          brand: watch.brand,
          model: watch.model,
          reference: v.reference,
          familyId,
          sizeMm: v.sizeMm,
          movement: v.movement,
          material: v.material,
          color: v.color,
          category: v.category,
          braceletType: v.braceletType,
          shape: v.shape,
          waterResistanceM: v.waterResistanceM,
          crystal: v.crystal,
          caseBack: v.caseBack,
          origin: v.origin,
          lugWidthMm: v.lugWidthMm,
          complications: v.complications,
          retailPrice: v.retailPrice,
          description: v.description,
          createdBy: sameer.id,
          isCommunitySubmitted: false,
        })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) referencesCreated++;
      else skipped++;
    }

    console.log(`  ${watch.brand} ${watch.model} (${watch.variations.length} variation(s))`);
  }

  console.log(`\n--- Summary ---`);
  console.log(`New families: ${familiesCreated}`);
  console.log(`New references: ${referencesCreated}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log("Done!");
}

seed().catch(console.error);
