import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, isNull, sql } from "drizzle-orm";
import { watchFamilies, watchReferences } from "./schema";

const neonSql = neon(process.env.DATABASE_URL!);
const db = drizzle(neonSql);

function slugify(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Known collection mappings: brand -> model pattern -> collection name
// ---------------------------------------------------------------------------
const COLLECTION_MAP: Record<string, Record<string, string>> = {
  Rolex: {
    "Submariner Date": "Submariner",
    "Submariner No Date": "Submariner",
    "Submariner No-Date": "Submariner",
    Submariner: "Submariner",
    "GMT-Master II Pepsi": "GMT-Master II",
    "GMT-Master II Batman": "GMT-Master II",
    "GMT-Master II": "GMT-Master II",
    Daytona: "Daytona",
    "Explorer I": "Explorer",
    "Explorer II": "Explorer",
    Explorer: "Explorer",
    "Datejust 41": "Datejust",
    Datejust: "Datejust",
    "Day-Date 40": "Day-Date",
    "Day-Date": "Day-Date",
    "Yacht-Master": "Yacht-Master",
    "Air-King": "Air-King",
    Milgauss: "Milgauss",
    "Sky-Dweller": "Sky-Dweller",
    "Sea-Dweller": "Sea-Dweller",
    "Oyster Perpetual 36": "Oyster Perpetual",
    "Oyster Perpetual": "Oyster Perpetual",
  },
  Omega: {
    "Speedmaster Moonwatch": "Speedmaster",
    "Speedmaster Moonwatch Sapphire": "Speedmaster",
    "Speedmaster 38": "Speedmaster",
    "Seamaster Diver 300M": "Seamaster",
    "Seamaster Planet Ocean": "Seamaster",
    "Seamaster Planet Ocean GMT": "Seamaster",
    "Seamaster Aqua Terra": "Seamaster",
    "Seamaster 300": "Seamaster",
    "Seamaster Railmaster": "Seamaster",
    "De Ville Prestige": "De Ville",
    "De Ville Tresor": "De Ville",
    Constellation: "Constellation",
  },
  Tudor: {
    "Black Bay": "Black Bay",
    "Black Bay 58": "Black Bay",
    "Black Bay 58 Blue": "Black Bay",
    "Black Bay GMT": "Black Bay",
    "Black Bay Chrono": "Black Bay",
    Pelagos: "Pelagos",
    Ranger: "Ranger",
    Royal: "Royal",
  },
  Seiko: {
    SKX007: "SKX",
    "Presage Cocktail Time": "Presage",
    "Presage Sharp Edged": "Presage",
    "King Turtle": "Prospex",
    "Marinemaster 300": "Prospex",
    "Prospex Willard": "Prospex",
    "Prospex LX SNR029": "Prospex",
    "Prospex Alpinist": "Prospex",
    "Prospex Turtle": "Prospex",
    "5 Sports Field": "5 Sports",
    "5 Sports GMT": "5 Sports",
  },
  "Grand Seiko": {
    Snowflake: "Heritage",
    "White Birch": "Heritage",
    "Green Iwate": "Heritage",
    "Sport GMT": "Sport",
  },
  IWC: {
    "Portugieser Chronograph": "Portugieser",
    "Big Pilot": "Big Pilot",
    "Pilot Spitfire": "Pilot",
    "Pilot Chronograph": "Pilot",
  },
  "Jaeger-LeCoultre": {
    "Master Ultra Thin": "Master",
    "Master Control": "Master",
  },
  Cartier: {
    "Santos de Cartier": "Santos",
    "Ballon Bleu": "Ballon Bleu",
    "Panthere de Cartier": "Panthere",
  },
  Breitling: {
    Navitimer: "Navitimer",
    Superocean: "Superocean",
    Chronomat: "Chronomat",
    Avenger: "Avenger",
  },
  Panerai: {
    "Luminor Marina": "Luminor",
    "Luminor Due": "Luminor",
    Submersible: "Submersible",
  },
  Zenith: {
    "Chronomaster Sport": "Chronomaster",
    "El Primero": "El Primero",
    "Defy Classic": "Defy",
    "Defy Skyline": "Defy",
  },
  "TAG Heuer": {
    Carrera: "Carrera",
    Monaco: "Monaco",
    "Aquaracer Professional 300": "Aquaracer",
  },
  Longines: {
    Spirit: "Spirit",
    HydroConquest: "HydroConquest",
    "Master Collection": "Master Collection",
    "Legend Diver": "Legend Diver",
    "Conquest VHP": "Conquest",
  },
  "Audemars Piguet": {
    "Royal Oak Offshore": "Royal Oak",
    "Code 11.59": "Code 11.59",
  },
  "Patek Philippe": {
    Nautilus: "Nautilus",
    Aquanaut: "Aquanaut",
    Calatrava: "Calatrava",
  },
  Citizen: {
    "Promaster Tough": "Promaster",
    "Tsuki-yomi": "Tsuki-yomi",
    "Eco-Drive One": "Eco-Drive",
  },
  Orient: {
    "Mako II": "Mako",
    Kamasu: "Kamasu",
    "Orient Star": "Orient Star",
    "Sun and Moon": "Sun and Moon",
  },
  Casio: {
    "G-Shock DW5600": "G-Shock",
    "G-Shock Full Metal": "G-Shock",
    Oceanus: "Oceanus",
  },
  Nomos: {
    Club: "Club",
    Ludwig: "Ludwig",
    Orion: "Orion",
    "Zurich Weltzeit": "Zurich",
  },
  Sinn: {
    "104 St Sa": "104",
    U50: "U50",
    "356 Pilot": "356",
    "EZM 3": "EZM",
  },
  "A. Lange & Sohne": {
    Saxonia: "Saxonia",
    "Lange 1": "Lange 1",
    "1815": "1815",
  },
  "Glashutte Original": {
    "Senator Excellence": "Senator",
    "Seventies Chronograph": "Seventies",
  },
  Tissot: {
    "Gentleman Powermatic 80": "Gentleman",
    "Seastar 1000": "Seastar",
    "PRX Quartz": "PRX",
    PRX: "PRX",
  },
  Hamilton: {
    "Khaki Field Mechanical": "Khaki Field",
    "Khaki Field Auto": "Khaki Field",
    "Jazzmaster Open Heart": "Jazzmaster",
    Ventura: "Ventura",
    "Intra-Matic Chronograph": "Intra-Matic",
  },
  Timex: {
    "Marlin Automatic": "Marlin",
    "Expedition North": "Expedition",
    "Q Timex": "Q Timex",
  },
  Swatch: {
    "MoonSwatch Mission to Moon": "MoonSwatch",
    "MoonSwatch Mission to Mars": "MoonSwatch",
    "MoonSwatch Mission to Neptune": "MoonSwatch",
    "MoonSwatch Mission to the Sun": "MoonSwatch",
  },
  Baltic: {
    Aquascaphe: "Aquascaphe",
    "HMS 002": "HMS",
  },
  Monta: {
    Triumph: "Triumph",
    Oceanking: "Oceanking",
  },
  "Christopher Ward": {
    "C60 Sealander": "Sealander",
    "C63 Sealander GMT": "Sealander",
  },
  Doxa: {
    "SUB 200": "SUB",
    "SUB 300": "SUB",
  },
  Oris: {
    "Aquis Date": "Aquis",
    "Divers Sixty-Five": "Divers Sixty-Five",
    "Big Crown Pointer Date": "Big Crown",
    ProPilot: "ProPilot",
  },
  Marathon: {
    JSAR: "JSAR",
    Navigator: "Navigator",
  },
  Shinola: {
    Runwell: "Runwell",
    Canfield: "Canfield",
  },
  Bulova: {
    "Lunar Pilot": "Lunar Pilot",
    Precisionist: "Precisionist",
  },
  "Vacheron Constantin": {
    Overseas: "Overseas",
    Patrimony: "Patrimony",
  },
  Blancpain: {
    "Fifty Fathoms": "Fifty Fathoms",
    "Fifty Fathoms Bathyscaphe": "Fifty Fathoms",
  },
  Hublot: {
    "Big Bang": "Big Bang",
    "Classic Fusion": "Classic Fusion",
  },
  "Bell & Ross": {
    "BR 03-92": "BR 03",
    "BR 05": "BR 05",
  },
  "Frederique Constant": {
    "Classics Moonphase": "Classics",
    "Highlife Automatic": "Highlife",
  },
  Rado: {
    "Captain Cook": "Captain Cook",
    "True Square": "True",
  },
  "Baume & Mercier": {
    Riviera: "Riviera",
  },
  Breguet: {
    Classique: "Classique",
    Marine: "Marine",
  },
  Chopard: {
    "Alpine Eagle": "Alpine Eagle",
  },
  "Girard-Perregaux": {
    Laureato: "Laureato",
  },
  Piaget: {
    "Polo Date": "Polo",
  },
  "Ulysse Nardin": {
    "Marine Torpilleur": "Marine",
  },
  Montblanc: {
    "1858": "1858",
    "Heritage Chronometrie": "Heritage",
  },
  Mido: {
    "Ocean Star": "Ocean Star",
    "Baroncelli Heritage": "Baroncelli",
  },
  Certina: {
    "DS Action Diver": "DS Action",
  },
  Alpina: {
    "Startimer Pilot": "Startimer",
  },
  Norqain: {
    "Freedom 60": "Freedom",
  },
  Zodiac: {
    "Super Sea Wolf": "Super Sea Wolf",
  },
  Farer: {
    "Lander IV": "Lander",
  },
  Squale: {
    "1521": "1521",
  },
  Ming: {
    "27.02": "27",
  },
  Stowa: {
    "Flieger Classic": "Flieger",
  },
  Glycine: {
    "Combat Sub": "Combat",
    Airman: "Airman",
  },
  MeisterSinger: {
    Perigraph: "Perigraph",
  },
  Tutima: {
    "Flieger Friday": "Flieger",
  },
  "Muhle Glashutte": {
    "Teutonia IV": "Teutonia",
  },
  Laco: {
    "Augsburg 39": "Augsburg",
  },
  Vaer: {
    "C5 Field": "C5",
    "D5 Tropic Diver": "D5",
  },
  Lorier: {
    "Neptune V": "Neptune",
  },
  Halios: {
    Fairwind: "Fairwind",
  },
  Brew: {
    Metric: "Metric",
  },
  "H. Moser & Cie": {
    "Streamliner Flyback Chronograph": "Streamliner",
  },
  "MB&F": {
    "HM7 Aquapod": "HM7",
  },
  Junghans: {
    "Meister Driver": "Meister",
    "Form A": "Form",
  },
  Fortis: {
    "Flieger F-41 Automatic": "Flieger",
  },
};

// ---------------------------------------------------------------------------
// Models that should be merged (strip size/nickname from model name)
// Key = current model name, Value = canonical model name
// ---------------------------------------------------------------------------
const MERGE_MAP: Record<string, string> = {
  "Datejust 41": "Datejust",
  "Day-Date 40": "Day-Date",
  "GMT-Master II Pepsi": "GMT-Master II",
  "GMT-Master II Batman": "GMT-Master II",
  "Black Bay 58": "Black Bay",
  "Black Bay 58 Blue": "Black Bay",
  "Black Bay GMT": "Black Bay",
  "Black Bay Chrono": "Black Bay",
  "Oyster Perpetual 36": "Oyster Perpetual",
  "Explorer I": "Explorer",
  "Explorer II": "Explorer",
  "Speedmaster Moonwatch Sapphire": "Speedmaster Moonwatch",
  "Speedmaster 38": "Speedmaster Moonwatch",
  "Seamaster Planet Ocean GMT": "Seamaster Planet Ocean",
  "Fifty Fathoms Bathyscaphe": "Fifty Fathoms",
  "MoonSwatch Mission to Mars": "MoonSwatch Mission to Moon",
  "MoonSwatch Mission to Neptune": "MoonSwatch Mission to Moon",
  "MoonSwatch Mission to the Sun": "MoonSwatch Mission to Moon",
};

// Derive collection name for any family using the map or a fallback heuristic
function deriveCollection(brand: string, model: string): string {
  // Check explicit map first
  const brandMap = COLLECTION_MAP[brand];
  if (brandMap && brandMap[model]) {
    return brandMap[model];
  }

  // Fallback: use the model name itself as collection
  // Strip trailing numbers that look like sizes (e.g. "41", "40", "36")
  const stripped = model.replace(/\s+\d{2,3}$/, "").trim();
  return stripped;
}

async function fixFamilies() {
  console.log("=== Fix Families: Starting ===\n");

  // Get all families
  const allFamilies = await db.select().from(watchFamilies);
  console.log(`Found ${allFamilies.length} families total.\n`);

  // -------------------------------------------------------------------------
  // Phase 1: Merge duplicate families
  // -------------------------------------------------------------------------
  console.log("--- Phase 1: Merging duplicate families ---\n");

  for (const family of allFamilies) {
    const canonicalModel = MERGE_MAP[family.model];
    if (!canonicalModel) continue;

    const canonicalSlug = slugify(family.brand, canonicalModel);

    // Check if the canonical family already exists (and isn't this one)
    const existing = await db
      .select()
      .from(watchFamilies)
      .where(eq(watchFamilies.slug, canonicalSlug));

    if (existing.length > 0 && existing[0].id !== family.id) {
      // Canonical family exists — move references and delete duplicate
      const canonicalId = existing[0].id;
      console.log(
        `  MERGE: "${family.brand} ${family.model}" (id=${family.id}) -> "${existing[0].brand} ${existing[0].model}" (id=${canonicalId})`,
      );

      // Move all references from this family to the canonical one
      await db
        .update(watchReferences)
        .set({ familyId: canonicalId })
        .where(eq(watchReferences.familyId, family.id));

      // Delete the now-empty duplicate family
      await db.delete(watchFamilies).where(eq(watchFamilies.id, family.id));
    } else if (existing.length === 0) {
      // No canonical family exists yet — just rename this one
      console.log(
        `  RENAME: "${family.brand} ${family.model}" -> "${canonicalModel}" (slug: ${canonicalSlug})`,
      );
      await db
        .update(watchFamilies)
        .set({ model: canonicalModel, slug: canonicalSlug })
        .where(eq(watchFamilies.id, family.id));
    }
    // If existing[0].id === family.id, it's already canonical, skip
  }

  // -------------------------------------------------------------------------
  // Phase 2: Set collection for ALL families
  // -------------------------------------------------------------------------
  console.log("\n--- Phase 2: Setting collection values ---\n");

  // Re-fetch families after merges
  const updatedFamilies = await db.select().from(watchFamilies);

  for (const family of updatedFamilies) {
    const collection = deriveCollection(family.brand, family.model);
    await db
      .update(watchFamilies)
      .set({ collection })
      .where(eq(watchFamilies.id, family.id));
    console.log(
      `  ${family.brand} | ${family.model} -> collection: "${collection}"`,
    );
  }

  // -------------------------------------------------------------------------
  // Phase 3: Verify
  // -------------------------------------------------------------------------
  console.log("\n--- Phase 3: Verification ---\n");

  // Check for NULL collections
  const nullCollections = await db
    .select()
    .from(watchFamilies)
    .where(isNull(watchFamilies.collection));
  console.log(`Families with NULL collection: ${nullCollections.length}`);
  if (nullCollections.length > 0) {
    for (const f of nullCollections) {
      console.log(`  WARNING: ${f.brand} ${f.model} (id=${f.id}) has NULL collection`);
    }
  }

  // Check for orphaned references
  const orphanCheck = await db.execute(sql`
    SELECT wr.id, wr.brand, wr.model, wr.family_id
    FROM watch_references wr
    LEFT JOIN watch_families wf ON wr.family_id = wf.id
    WHERE wr.family_id IS NOT NULL AND wf.id IS NULL
  `);
  console.log(`Orphaned references (invalid familyId): ${orphanCheck.rows.length}`);
  if (orphanCheck.rows.length > 0) {
    for (const r of orphanCheck.rows) {
      console.log(`  WARNING: ref id=${r.id} "${r.brand} ${r.model}" points to missing family ${r.family_id}`);
    }
  }

  console.log("\n=== Fix Families: Done ===");
}

fixFamilies().catch(console.error);
