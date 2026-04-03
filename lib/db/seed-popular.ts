/**
 * Adds popular missing watch families and variants for top brands.
 * Run with: npx tsx lib/db/seed-popular.ts
 *
 * Attributes all entries to the @sameer account.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchFamilies, watchReferences, users } from "./schema";
import { eq, isNull } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

// =============================================================================
// POPULAR WATCHES TO ADD — organized by brand
// =============================================================================
const WATCHES: WatchSeed[] = [
  // ===========================================================================
  // ROLEX — missing iconic models
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Submariner Date",
    variations: [
      {
        reference: "126610LN",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 10250,
        description: "The quintessential dive watch. Calibre 3235, 70-hour power reserve. Cerachrom bezel insert.",
      },
      {
        reference: "126610LV",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 10750,
        description: "Green Cerachrom bezel with black dial. The Starbucks/Cermit. Calibre 3235.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "GMT-Master II Sprite",
    variations: [
      {
        reference: "126720VTNR",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
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
        retailPrice: 10750,
        description: "Green and black Cerachrom bezel. Left-handed crown at 9 o'clock. Calibre 3285.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Cosmograph Daytona",
    variations: [
      {
        reference: "126500LN",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 15100,
        description: "Latest generation Daytona with ceramic bezel. Calibre 4131, 72-hour power reserve.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Datejust 36",
    variations: [
      {
        reference: "126234",
        sizeMm: 36,
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
        complications: ["date"],
        retailPrice: 8100,
        description: "Classic 36mm with fluted white gold bezel. Blue dial on Jubilee bracelet. Calibre 3235.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Deepsea",
    variations: [
      {
        reference: "136660",
        sizeMm: 44,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 3900,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 14050,
        description: "Rated to 3,900m. Ringlock system, helium escape valve. Calibre 3235.",
      },
    ],
  },

  // ===========================================================================
  // OMEGA — missing popular models
  // ===========================================================================
  {
    brand: "Omega",
    model: "Speedmaster Moonwatch Hesalite",
    variations: [
      {
        reference: "310.30.42.50.01.001",
        sizeMm: 42,
        movement: "manual wind",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "hesalite",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 6900,
        description: "The Moonwatch. Hesalite crystal, solid case back. Calibre 3861 manual-wind movement.",
      },
    ],
  },
  {
    brand: "Omega",
    model: "Seamaster Diver 300M",
    variations: [
      {
        reference: "210.30.42.20.03.001",
        sizeMm: 42,
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
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5600,
        description: "Blue ceramic dial with laser-engraved waves. Calibre 8800, 55-hour reserve. Ceramic bezel.",
      },
      {
        reference: "210.30.42.20.01.001",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5600,
        description: "Black ceramic dial with laser-engraved waves. Ceramic bezel. Calibre 8800.",
      },
    ],
  },
  {
    brand: "Omega",
    model: "Speedmaster '57",
    variations: [
      {
        reference: "332.10.41.51.01.001",
        sizeMm: 40.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "date", "tachymeter"],
        retailPrice: 7900,
        description: "Vintage-inspired Speedmaster. Co-Axial Master Chronometer 9906. Broad arrow hands.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR — missing popular models
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay 58",
    variations: [
      {
        reference: "M79030N-0001",
        sizeMm: 39,
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
        retailPrice: 3775,
        description: "39mm vintage-proportioned diver. MT5402 in-house movement, 70-hour reserve. No date.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Black Bay Pro",
    variations: [
      {
        reference: "M79470-0001",
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
        retailPrice: 4175,
        description: "Tool GMT with fixed 24-hour bezel. MT5652 with 70-hour reserve. Yellow GMT hand.",
      },
    ],
  },

  // ===========================================================================
  // PATEK PHILIPPE — missing iconic models
  // ===========================================================================
  {
    brand: "Patek Philippe",
    model: "Nautilus Blue",
    variations: [
      {
        reference: "5811/1G-001",
        sizeMm: 41,
        movement: "automatic",
        material: "white gold",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 52730,
        description: "Successor to the 5711. White gold with blue dial. Calibre 26-330 S C, 45-hour reserve.",
      },
    ],
  },
  {
    brand: "Patek Philippe",
    model: "Perpetual Calendar",
    variations: [
      {
        reference: "5327G-001",
        sizeMm: 39,
        movement: "automatic",
        material: "white gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["perpetual calendar", "moon phase", "day", "date", "month", "leap year"],
        retailPrice: 87330,
        description: "Grand complication perpetual calendar. Calibre 324 S Q, officer's case back.",
      },
    ],
  },

  // ===========================================================================
  // AUDEMARS PIGUET — the missing Royal Oak
  // ===========================================================================
  {
    brand: "Audemars Piguet",
    model: "Royal Oak",
    variations: [
      {
        reference: "15500ST.OO.1220ST.01",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 28300,
        description: "The Genta icon. Blue Grande Tapisserie dial. Calibre 4302, 70-hour reserve.",
      },
      {
        reference: "15500ST.OO.1220ST.04",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 28300,
        description: "Royal Oak with black Grande Tapisserie dial. Integrated bracelet. Calibre 4302.",
      },
    ],
  },
  {
    brand: "Audemars Piguet",
    model: "Royal Oak Chronograph",
    variations: [
      {
        reference: "26240ST.OO.1220ST.01",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["chronograph", "date"],
        retailPrice: 44900,
        description: "Integrated flyback chronograph. Blue Grande Tapisserie dial. Calibre 4401, 70-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // VACHERON CONSTANTIN — missing models
  // ===========================================================================
  {
    brand: "Vacheron Constantin",
    model: "Fifty-Six",
    variations: [
      {
        reference: "4600E/000A-B487",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 17800,
        description: "Entry to haute horlogerie. Calibre 1326, 48-hour power reserve. Maltese cross rotor.",
      },
    ],
  },

  // ===========================================================================
  // IWC — missing models
  // ===========================================================================
  {
    brand: "IWC",
    model: "Portugieser Automatic",
    variations: [
      {
        reference: "IW500710",
        sizeMm: 42.3,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date", "power reserve indicator"],
        retailPrice: 10600,
        description: "Clean Portugieser dial. Calibre 52010 with Pellaton winding, 7-day power reserve.",
      },
    ],
  },
  {
    brand: "IWC",
    model: "Pilot Mark XX",
    variations: [
      {
        reference: "IW328203",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5150,
        description: "Latest-generation Pilot. Calibre 32111, 72-hour reserve. Soft-iron cage for anti-magnetism.",
      },
    ],
  },

  // ===========================================================================
  // JAEGER-LECOULTRE — missing the Reverso
  // ===========================================================================
  {
    brand: "Jaeger-LeCoultre",
    model: "Reverso Classic",
    variations: [
      {
        reference: "Q3858520",
        sizeMm: 45.6, // length, it's rectangular
        movement: "manual wind",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 19,
        complications: [],
        retailPrice: 7950,
        description: "Art Deco icon with swiveling case. Manual-wind Calibre 822. Dual-face design since 1931.",
      },
    ],
  },

  // ===========================================================================
  // CARTIER — missing Tank
  // ===========================================================================
  {
    brand: "Cartier",
    model: "Tank Must",
    variations: [
      {
        reference: "WSTA0065",
        sizeMm: 33.7, // length
        movement: "quartz",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 3050,
        description: "Entry to Cartier. Quartz Calibre 076. Roman numerals, blue sword-shaped hands, cabochon crown.",
      },
    ],
  },
  {
    brand: "Cartier",
    model: "Tank Francaise",
    variations: [
      {
        reference: "WSTA0074",
        sizeMm: 36.7,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 6750,
        description: "Curved rectangular case with integrated bracelet. Calibre 1847 MC automatic.",
      },
    ],
  },

  // ===========================================================================
  // BREITLING — missing Chronomat
  // ===========================================================================
  {
    brand: "Breitling",
    model: "Premier Chronograph 42",
    variations: [
      {
        reference: "AB0118A11L1X1",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 7350,
        description: "Elegant chronograph. Calibre 01 COSC-certified, 70-hour reserve. Dressy proportions.",
      },
    ],
  },

  // ===========================================================================
  // TAG HEUER — missing Connected
  // ===========================================================================
  {
    brand: "TAG Heuer",
    model: "Carrera Chronograph",
    variations: [
      {
        reference: "CBS2210.FC6534",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph"],
        retailPrice: 5600,
        description: "39mm Carrera Chronograph with Calibre TH20-00. Glassbox sapphire crystal. No date.",
      },
    ],
  },

  // ===========================================================================
  // GRAND SEIKO — missing Heritage and SBGW
  // ===========================================================================
  {
    brand: "Grand Seiko",
    model: "Heritage Collection",
    variations: [
      {
        reference: "SBGW231",
        sizeMm: 37.3,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 19,
        complications: [],
        retailPrice: 4200,
        description: "Pure time-only manual wind. Calibre 9S64 with 72-hour reserve. Zaratsu polishing.",
      },
    ],
  },
  {
    brand: "Grand Seiko",
    model: "Spring Drive Diver",
    variations: [
      {
        reference: "SBGA463",
        sizeMm: 40.5,
        movement: "spring drive",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "power reserve indicator"],
        retailPrice: 5600,
        description: "Spring Drive diver. Calibre 9R65, glide-motion seconds hand. 72-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // SEIKO — missing popular models
  // ===========================================================================
  {
    brand: "Seiko",
    model: "Prospex Alpinist",
    variations: [
      {
        reference: "SPB121",
        sizeMm: 39.5,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "field",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "compass"],
        retailPrice: 725,
        description: "Modern Alpinist with green sunburst dial. Calibre 6R35, 70-hour reserve. Inner compass bezel.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "Prospex 62MAS Reissue",
    variations: [
      {
        reference: "SPB453",
        sizeMm: 40.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1350,
        description: "Modern reinterpretation of the 1965 62MAS. Calibre 6R35, 70-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // CITIZEN — missing popular models
  // ===========================================================================
  {
    brand: "Citizen",
    model: "Promaster Diver",
    variations: [
      {
        reference: "BN0151-09L",
        sizeMm: 44,
        movement: "solar",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 240,
        description: "Solar-powered ISO diver. Eco-Drive movement, 6-month power reserve. Polyurethane strap.",
      },
    ],
  },

  // ===========================================================================
  // NOMOS — missing Tangente
  // ===========================================================================
  {
    brand: "Nomos",
    model: "Tangente",
    variations: [
      {
        reference: "164",
        sizeMm: 35,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 1780,
        description: "Bauhaus icon. Alpha calibre, hand-wound. 43-hour reserve. Silvercut dial.",
      },
    ],
  },
  {
    brand: "Nomos",
    model: "Tangente Neomatik",
    variations: [
      {
        reference: "175",
        sizeMm: 35,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 18,
        complications: ["date"],
        retailPrice: 2980,
        description: "Automatic Tangente. DUW 3001 neomatik calibre, 42-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // ZENITH — missing Pilot
  // ===========================================================================
  {
    brand: "Zenith",
    model: "Pilot Type 20 Extra Special",
    variations: [
      {
        reference: "11.1940.679/91.C807",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 4900,
        description: "Heritage flieger style. Elite 679 automatic, cathedral hands, large onion crown.",
      },
    ],
  },

  // ===========================================================================
  // PANERAI — missing Radiomir
  // ===========================================================================
  {
    brand: "Panerai",
    model: "Radiomir",
    variations: [
      {
        reference: "PAM00754",
        sizeMm: 45,
        movement: "manual wind",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "leather strap",
        shape: "cushion",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["small seconds"],
        retailPrice: 5900,
        description: "Classic Radiomir with wire lugs and sandwich dial. P.6000 manual-wind, 3-day reserve.",
      },
    ],
  },

  // ===========================================================================
  // LONGINES — missing popular models
  // ===========================================================================
  {
    brand: "Longines",
    model: "Dolce Vita",
    variations: [
      {
        reference: "L5.512.4.71.0",
        sizeMm: 32, // it's rectangular: 23.3 x 37mm
        movement: "quartz",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "rectangular",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 14,
        complications: [],
        retailPrice: 1100,
        description: "Art Deco rectangular dress watch. Roman numerals, blue steel hands. ETA quartz.",
      },
    ],
  },

  // ===========================================================================
  // HUBLOT — missing Big Bang Integral
  // ===========================================================================
  {
    brand: "Hublot",
    model: "Big Bang Integral",
    variations: [
      {
        reference: "451.NX.1170.NX",
        sizeMm: 42,
        movement: "automatic",
        material: "titanium",
        color: "gray",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 19900,
        description: "Big Bang with integrated titanium bracelet. UNICO HUB1280 flyback chronograph, 72-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // BLANCPAIN — more accessible model
  // ===========================================================================
  {
    brand: "Blancpain",
    model: "Villeret Ultraplate",
    variations: [
      {
        reference: "6651-1127-55B",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 9700,
        description: "Ultra-thin dress watch at 7.4mm. Calibre 1151, 100-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // HAMILTON — missing popular models
  // ===========================================================================
  {
    brand: "Hamilton",
    model: "Khaki Aviation Pilot Day Date",
    variations: [
      {
        reference: "H64615135",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["day", "date"],
        retailPrice: 795,
        description: "Pilot Day Date. H-40 automatic, 80-hour power reserve. Featured in Interstellar.",
      },
    ],
  },

  // ===========================================================================
  // TISSOT — missing popular models
  // ===========================================================================
  {
    brand: "Tissot",
    model: "PRX Powermatic 80",
    variations: [
      {
        reference: "T137.407.11.041.00",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 650,
        description: "Integrated bracelet design inspired by the 1978 original. Powermatic 80 movement, 80-hour reserve.",
      },
      {
        reference: "T137.407.11.051.00",
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
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 650,
        description: "Black dial PRX Powermatic 80. Integrated steel bracelet. 80-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // ORIENT — missing popular Bambino
  // ===========================================================================
  {
    brand: "Orient",
    model: "Bambino",
    variations: [
      {
        reference: "FAC00005W0",
        sizeMm: 40.5,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 21,
        complications: [],
        retailPrice: 198,
        description: "Classic dress watch at an incredible value. In-house Calibre F6724 automatic.",
      },
    ],
  },

  // ===========================================================================
  // CASIO — missing popular models
  // ===========================================================================
  {
    brand: "Casio",
    model: "G-Shock Casioak",
    variations: [
      {
        reference: "GA-2100-1A1",
        sizeMm: 45.4,
        movement: "quartz",
        material: "resin",
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
        retailPrice: 110,
        description: "The CasiOak. Carbon Core Guard octagonal bezel. Analog-digital combo. World time.",
      },
    ],
  },
  {
    brand: "Casio",
    model: "G-Shock GMW-B5000",
    variations: [
      {
        reference: "GMW-B5000D-1",
        sizeMm: 43.2,
        movement: "solar",
        material: "stainless steel",
        color: "black",
        category: "digital",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["world time", "alarm", "chronograph"],
        retailPrice: 550,
        description: "Full metal G-Shock square. Tough Solar + Multiband 6. STN LCD. Bluetooth connectivity.",
      },
    ],
  },

  // ===========================================================================
  // TIMEX — missing Waterbury
  // ===========================================================================
  {
    brand: "Timex",
    model: "Waterbury Heritage",
    variations: [
      {
        reference: "TW2V28900",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "field",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "mineral",
        caseBack: "display",
        origin: "American",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 279,
        description: "Heritage automatic field watch. Miyota 8215 movement. Named for Timex's hometown.",
      },
    ],
  },

  // ===========================================================================
  // SINN — missing popular model
  // ===========================================================================
  {
    brand: "Sinn",
    model: "556 I",
    variations: [
      {
        reference: "556.0104",
        sizeMm: 38.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1490,
        description: "Quintessential everyday tool watch. SW 200-1 base, 38-hour reserve. Tegiment-hardened.",
      },
    ],
  },

  // ===========================================================================
  // ORIS — missing popular model
  // ===========================================================================
  {
    brand: "Oris",
    model: "Aquis Date Calibre 400",
    variations: [
      {
        reference: "01 400 7769 4135",
        sizeMm: 41.5,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 3200,
        description: "In-house Calibre 400 with 5-day power reserve and 10-year warranty. Green ceramic bezel.",
      },
    ],
  },

  // ===========================================================================
  // FREDERIQUE CONSTANT — missing Slimline
  // ===========================================================================
  {
    brand: "Frederique Constant",
    model: "Slimline Perpetual Calendar",
    variations: [
      {
        reference: "FC-775V4S4",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["perpetual calendar", "moon phase", "date", "day", "month"],
        retailPrice: 3995,
        description: "Most affordable perpetual calendar. In-house FC-775 calibre. Manufactures line.",
      },
    ],
  },

  // ===========================================================================
  // RADO — missing popular Captain Cook models
  // ===========================================================================
  {
    brand: "Rado",
    model: "Captain Cook High-Tech Ceramic",
    variations: [
      {
        reference: "R32127162",
        sizeMm: 43,
        movement: "automatic",
        material: "ceramic",
        color: "green",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 3150,
        description: "High-tech plasma ceramic case. Calibre R801, 80-hour reserve. Green dial and bezel.",
      },
    ],
  },

  // ===========================================================================
  // BELL & ROSS — missing BR 01
  // ===========================================================================
  {
    brand: "Bell & Ross",
    model: "BR 01",
    variations: [
      {
        reference: "BR0192-BL-ST/SRB",
        sizeMm: 46,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "rubber strap",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["date"],
        retailPrice: 4500,
        description: "Iconic instrument panel square. BR-CAL.302 automatic. Rubber strap with steel buckle.",
      },
    ],
  },

  // ===========================================================================
  // BREGUET — missing Marine Chronographe
  // ===========================================================================
  {
    brand: "Breguet",
    model: "Marine Chronographe",
    variations: [
      {
        reference: "5527TI/G2/TW0",
        sizeMm: 42.3,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "chronograph",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 27800,
        description: "Titanium flyback chronograph. Calibre 582QA, 48-hour reserve. Guilloché dial.",
      },
    ],
  },

  // ===========================================================================
  // CHOPARD — missing L.U.C
  // ===========================================================================
  {
    brand: "Chopard",
    model: "L.U.C XPS",
    variations: [
      {
        reference: "168592-3002",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8700,
        description: "Ultra-thin dress watch at 7.2mm. L.U.C 96.12-L COSC chronometer. 65-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // GLASHUTTE ORIGINAL — missing PanoMaticLunar
  // ===========================================================================
  {
    brand: "Glashutte Original",
    model: "PanoMaticLunar",
    variations: [
      {
        reference: "1-90-02-46-32-05",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["moon phase", "date", "power reserve indicator"],
        retailPrice: 9800,
        description: "Panorama date with moon phase. Calibre 90-02, 42-hour reserve. Off-center dial layout.",
      },
    ],
  },

  // ===========================================================================
  // PIAGET — missing Altiplano
  // ===========================================================================
  {
    brand: "Piaget",
    model: "Altiplano",
    variations: [
      {
        reference: "G0A45401",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 13200,
        description: "Ultra-thin at 6.36mm. Calibre 1200P automatic, 44-hour reserve. Minimalist dial.",
      },
    ],
  },
];

async function seed() {
  // Get the sameer user
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

    // Insert family (or find existing)
    const [family] = await db
      .insert(watchFamilies)
      .values({
        slug: familySlug,
        brand: watch.brand,
        model: watch.model,
      })
      .onConflictDoNothing()
      .returning();

    const familyId =
      family?.id ||
      (
        await db
          .select()
          .from(watchFamilies)
          .where(eq(watchFamilies.slug, familySlug))
          .limit(1)
      )[0]?.id;

    if (!familyId) {
      console.log(`  SKIP: Could not get familyId for ${watch.brand} ${watch.model}`);
      continue;
    }

    if (family) familiesCreated++;

    // Insert variations
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

      if (result.length > 0) {
        referencesCreated++;
      } else {
        skipped++;
      }
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
