/**
 * Backfill bezel types for existing watches in the catalog.
 * Run with: npx tsx lib/db/backfill-bezels.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchReferences } from "./schema";
import { eq, isNull, and, ilike, or, sql } from "drizzle-orm";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

// Rules for auto-assigning bezel types based on brand, model, category, and material
interface BezelRule {
  match: {
    brand?: string;
    modelContains?: string;
    category?: string;
    reference?: string;
  };
  bezelType: string;
}

const RULES: BezelRule[] = [
  // ROLEX specific bezels
  { match: { brand: "Rolex", modelContains: "Datejust" }, bezelType: "fluted" },
  { match: { brand: "Rolex", modelContains: "Day-Date" }, bezelType: "fluted" },
  { match: { brand: "Rolex", modelContains: "Submariner" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "GMT-Master" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "Daytona" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "Cosmograph" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "Deepsea" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "Sea-Dweller" }, bezelType: "ceramic" },
  { match: { brand: "Rolex", modelContains: "Yacht-Master" }, bezelType: "coin edge" },
  { match: { brand: "Rolex", modelContains: "Explorer II" }, bezelType: "fixed" },
  { match: { brand: "Rolex", modelContains: "Explorer I" }, bezelType: "smooth" },
  { match: { brand: "Rolex", modelContains: "Milgauss" }, bezelType: "smooth" },
  { match: { brand: "Rolex", modelContains: "Oyster Perpetual" }, bezelType: "smooth" },
  { match: { brand: "Rolex", modelContains: "Air-King" }, bezelType: "smooth" },
  { match: { brand: "Rolex", modelContains: "Sky-Dweller" }, bezelType: "fluted" },

  // OMEGA
  { match: { brand: "Omega", modelContains: "Speedmaster" }, bezelType: "tachymeter" },
  { match: { brand: "Omega", modelContains: "Seamaster" }, bezelType: "ceramic" },
  { match: { brand: "Omega", modelContains: "Planet Ocean" }, bezelType: "ceramic" },
  { match: { brand: "Omega", modelContains: "Aqua Terra" }, bezelType: "fixed" },
  { match: { brand: "Omega", modelContains: "Constellation" }, bezelType: "fluted" },
  { match: { brand: "Omega", modelContains: "De Ville" }, bezelType: "smooth" },
  { match: { brand: "Omega", modelContains: "Railmaster" }, bezelType: "smooth" },

  // TUDOR
  { match: { brand: "Tudor", modelContains: "Black Bay" }, bezelType: "dive" },
  { match: { brand: "Tudor", modelContains: "Pelagos" }, bezelType: "ceramic" },
  { match: { brand: "Tudor", modelContains: "Ranger" }, bezelType: "fixed" },
  { match: { brand: "Tudor", modelContains: "Royal" }, bezelType: "fixed" },

  // Category-based defaults
  { match: { category: "diver" }, bezelType: "dive" },
  { match: { category: "chronograph" }, bezelType: "tachymeter" },
  { match: { category: "pilot" }, bezelType: "smooth" },
  { match: { category: "gmt" }, bezelType: "dive" },
  { match: { category: "dress" }, bezelType: "smooth" },
  { match: { category: "field" }, bezelType: "fixed" },
  { match: { category: "digital" }, bezelType: "fixed" },

  // Specific brand overrides for dress watches
  { match: { brand: "Patek Philippe" }, bezelType: "smooth" },
  { match: { brand: "A. Lange & Sohne" }, bezelType: "smooth" },
  { match: { brand: "Jaeger-LeCoultre" }, bezelType: "smooth" },
  { match: { brand: "Nomos" }, bezelType: "smooth" },
  { match: { brand: "Cartier" }, bezelType: "smooth" },
  { match: { brand: "Breguet" }, bezelType: "coin edge" },
  { match: { brand: "Vacheron Constantin", modelContains: "Overseas" }, bezelType: "fixed" },

  // Specific models
  { match: { brand: "Audemars Piguet", modelContains: "Royal Oak" }, bezelType: "fixed" },
  { match: { brand: "TAG Heuer", modelContains: "Monaco" }, bezelType: "fixed" },
  { match: { brand: "TAG Heuer", modelContains: "Carrera" }, bezelType: "tachymeter" },
  { match: { brand: "TAG Heuer", modelContains: "Aquaracer" }, bezelType: "ceramic" },
  { match: { brand: "Hublot" }, bezelType: "fixed" },
  { match: { brand: "Bell & Ross" }, bezelType: "fixed" },
  { match: { brand: "Breitling", modelContains: "Navitimer" }, bezelType: "tachymeter" },
  { match: { brand: "Breitling", modelContains: "Superocean" }, bezelType: "ceramic" },
  { match: { brand: "Breitling", modelContains: "Chronomat" }, bezelType: "fixed" },
  { match: { brand: "Breitling", modelContains: "Avenger" }, bezelType: "dive" },
  { match: { brand: "IWC", modelContains: "Portugieser" }, bezelType: "smooth" },
  { match: { brand: "IWC", modelContains: "Pilot" }, bezelType: "smooth" },
  { match: { brand: "IWC", modelContains: "Big Pilot" }, bezelType: "smooth" },
  { match: { brand: "IWC", modelContains: "Ingenieur" }, bezelType: "fixed" },
  { match: { brand: "Panerai" }, bezelType: "smooth" },
  { match: { brand: "Panerai", modelContains: "Submersible" }, bezelType: "dive" },
  { match: { brand: "Zenith", modelContains: "Chronomaster" }, bezelType: "tachymeter" },
  { match: { brand: "Zenith", modelContains: "Defy" }, bezelType: "fixed" },
  { match: { brand: "Zenith", modelContains: "Pilot" }, bezelType: "smooth" },
  { match: { brand: "Zenith", modelContains: "El Primero" }, bezelType: "tachymeter" },
  { match: { brand: "Longines", modelContains: "Spirit" }, bezelType: "fixed" },
  { match: { brand: "Longines", modelContains: "HydroConquest" }, bezelType: "ceramic" },
  { match: { brand: "Longines", modelContains: "Legend Diver" }, bezelType: "internal" },
  { match: { brand: "Longines", modelContains: "Master" }, bezelType: "smooth" },
  { match: { brand: "Longines", modelContains: "Dolce Vita" }, bezelType: "smooth" },
  { match: { brand: "Sinn" }, bezelType: "dive" },
  { match: { brand: "Sinn", modelContains: "556" }, bezelType: "smooth" },
  { match: { brand: "Sinn", modelContains: "903" }, bezelType: "tachymeter" },
  { match: { brand: "Sinn", modelContains: "356" }, bezelType: "fixed" },
  { match: { brand: "Casio" }, bezelType: "fixed" },
  { match: { brand: "Timex" }, bezelType: "fixed" },
  { match: { brand: "Swatch" }, bezelType: "tachymeter" },
  { match: { brand: "Tissot", modelContains: "PRX" }, bezelType: "fixed" },
  { match: { brand: "Tissot", modelContains: "Gentleman" }, bezelType: "smooth" },
  { match: { brand: "Tissot", modelContains: "Seastar" }, bezelType: "ceramic" },
  { match: { brand: "Junghans" }, bezelType: "smooth" },
  { match: { brand: "Citizen" }, bezelType: "fixed" },
  { match: { brand: "Citizen", modelContains: "Promaster" }, bezelType: "dive" },
  { match: { brand: "Rado", modelContains: "Captain Cook" }, bezelType: "dive" },
  { match: { brand: "Rado", modelContains: "True" }, bezelType: "smooth" },
  { match: { brand: "Glashutte Original" }, bezelType: "smooth" },
  { match: { brand: "Chopard" }, bezelType: "smooth" },
  { match: { brand: "Piaget" }, bezelType: "smooth" },
  { match: { brand: "Girard-Perregaux", modelContains: "Laureato" }, bezelType: "fixed" },
  { match: { brand: "Frederique Constant" }, bezelType: "smooth" },
  { match: { brand: "Baume & Mercier", modelContains: "Riviera" }, bezelType: "fixed" },
  { match: { brand: "Montblanc" }, bezelType: "smooth" },
  { match: { brand: "Mido" }, bezelType: "smooth" },
  { match: { brand: "Mido", modelContains: "Ocean Star" }, bezelType: "ceramic" },
  { match: { brand: "Oris", modelContains: "Aquis" }, bezelType: "ceramic" },
  { match: { brand: "Oris", modelContains: "Divers" }, bezelType: "dive" },
  { match: { brand: "Oris", modelContains: "Big Crown" }, bezelType: "smooth" },
  { match: { brand: "Oris", modelContains: "ProPilot" }, bezelType: "smooth" },
  { match: { brand: "Hamilton" }, bezelType: "smooth" },
  { match: { brand: "Seiko", category: "diver" }, bezelType: "dive" },
  { match: { brand: "Grand Seiko" }, bezelType: "smooth" },
  { match: { brand: "Orient", category: "diver" }, bezelType: "dive" },
  { match: { brand: "Orient", category: "dress" }, bezelType: "smooth" },
  { match: { brand: "Bulova" }, bezelType: "tachymeter" },
  { match: { brand: "Doxa" }, bezelType: "dive" },
  { match: { brand: "Marathon" }, bezelType: "dive" },
  { match: { brand: "Christopher Ward" }, bezelType: "ceramic" },
  { match: { brand: "Monta" }, bezelType: "ceramic" },
  { match: { brand: "Baltic" }, bezelType: "dive" },
  { match: { brand: "Baltic", modelContains: "HMS" }, bezelType: "smooth" },
  { match: { brand: "Squale" }, bezelType: "dive" },
  { match: { brand: "Halios" }, bezelType: "dive" },
  { match: { brand: "Lorier" }, bezelType: "dive" },
  { match: { brand: "Vaer" }, bezelType: "dive" },
  { match: { brand: "Vaer", modelContains: "Field" }, bezelType: "smooth" },
  { match: { brand: "Stowa" }, bezelType: "smooth" },
  { match: { brand: "Laco" }, bezelType: "smooth" },
  { match: { brand: "Farer" }, bezelType: "fixed" },
  { match: { brand: "Zodiac" }, bezelType: "dive" },
  { match: { brand: "Norqain" }, bezelType: "dive" },
  { match: { brand: "Alpina" }, bezelType: "dive" },
  { match: { brand: "Certina" }, bezelType: "ceramic" },
  { match: { brand: "Glycine" }, bezelType: "dive" },
  { match: { brand: "Shinola" }, bezelType: "smooth" },
  { match: { brand: "Ming" }, bezelType: "smooth" },
  { match: { brand: "Furlan Marri" }, bezelType: "smooth" },
  { match: { brand: "Kurono Tokyo" }, bezelType: "smooth" },
  { match: { brand: "Archimede" }, bezelType: "smooth" },
  { match: { brand: "H. Moser & Cie" }, bezelType: "smooth" },
  { match: { brand: "MB&F" }, bezelType: "smooth" },
  { match: { brand: "Ulysse Nardin" }, bezelType: "smooth" },
  { match: { brand: "Blancpain", modelContains: "Fifty Fathoms" }, bezelType: "dive" },
  { match: { brand: "Blancpain", modelContains: "Villeret" }, bezelType: "smooth" },
  { match: { brand: "Fortis" }, bezelType: "dive" },
  { match: { brand: "Muhle Glashutte" }, bezelType: "smooth" },
  { match: { brand: "Tutima" }, bezelType: "smooth" },
  { match: { brand: "MeisterSinger" }, bezelType: "smooth" },
  { match: { brand: "Brew" }, bezelType: "tachymeter" },
];

function findBezelType(watch: { brand: string; model: string; category: string | null }): string | null {
  // More specific rules first (brand + model), then brand + category, then brand only, then category only
  // Rules are ordered by specificity in the array, first match wins
  for (const rule of RULES) {
    const { match } = rule;
    if (match.brand && watch.brand.toLowerCase() !== match.brand.toLowerCase()) continue;
    if (match.modelContains && !watch.model.toLowerCase().includes(match.modelContains.toLowerCase())) continue;
    if (match.category && watch.category?.toLowerCase() !== match.category.toLowerCase()) continue;
    return rule.bezelType;
  }
  return null;
}

async function main() {
  // Get all watches without a bezel type
  const watches = await db
    .select({
      id: watchReferences.id,
      brand: watchReferences.brand,
      model: watchReferences.model,
      category: watchReferences.category,
      bezelType: watchReferences.bezelType,
    })
    .from(watchReferences)
    .where(isNull(watchReferences.bezelType));

  console.log(`Found ${watches.length} watches without bezel type...\n`);

  let updated = 0;
  let skipped = 0;

  for (const watch of watches) {
    const bezel = findBezelType(watch);
    if (!bezel) {
      console.log(`  SKIP: ${watch.brand} ${watch.model} — no matching rule`);
      skipped++;
      continue;
    }

    await db
      .update(watchReferences)
      .set({ bezelType: bezel })
      .where(eq(watchReferences.id, watch.id));

    console.log(`  SET: ${watch.brand} ${watch.model} → ${bezel}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

main().catch(console.error);
